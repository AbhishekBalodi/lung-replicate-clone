import { Router } from 'express';
import { getPool, getConnection } from '../lib/tenant-db.js';
import { getDoctorFilter, getDoctorIdForInsert } from '../middleware/doctor-context.js';

const router = Router();

/**
 * Ensure lab_catalogue and labs_test tables exist with schema-resilient approach
 */
async function ensureTables(conn) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS lab_catalogue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(100),
      sample_type VARCHAR(100),
      preparation_instructions TEXT,
      turnaround_time VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS labs_test (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      doctor_id INT NULL,
      test_name VARCHAR(150) NOT NULL,
      category VARCHAR(100),
      sample_type VARCHAR(100),
      preparation_instructions TEXT,
      prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Backwards-compatible: older tenant schemas may exist without newer columns.
  await ensureColumn(conn, 'labs_test', 'doctor_id', 'INT NULL');
  await ensureColumn(conn, 'labs_test', 'test_name', 'VARCHAR(150) NOT NULL');
  await ensureColumn(conn, 'labs_test', 'category', 'VARCHAR(100) NULL');
  await ensureColumn(conn, 'labs_test', 'sample_type', 'VARCHAR(100) NULL');
  await ensureColumn(conn, 'labs_test', 'preparation_instructions', 'TEXT NULL');
  await ensureColumn(conn, 'labs_test', 'prescribed_date', 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP');

  await ensureColumn(conn, 'lab_catalogue', 'category', 'VARCHAR(100) NULL');
  await ensureColumn(conn, 'lab_catalogue', 'sample_type', 'VARCHAR(100) NULL');
  await ensureColumn(conn, 'lab_catalogue', 'preparation_instructions', 'TEXT NULL');
  await ensureColumn(conn, 'lab_catalogue', 'turnaround_time', 'VARCHAR(50) NULL');
}

/**
 * Check if a column exists in a table
 */
async function columnExists(conn, tableName, columnName) {
  const [rows] = await conn.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

/**
 * Ensure a column exists (safe for older schemas where CREATE TABLE IF NOT EXISTS won't add new columns).
 */
async function ensureColumn(conn, tableName, columnName, columnSqlDef) {
  const exists = await columnExists(conn, tableName, columnName);
  if (exists) return;
  try {
    await conn.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnSqlDef}`);
  } catch (e) {
    // In case of race conditions or limited privileges, don't crash the request.
    console.log(`ensureColumn skipped for ${tableName}.${columnName}:`, e.message);
  }
}

/**
 * GET /api/lab-tests/catalog - Get all lab tests from catalog
 */
router.get('/catalog', async (req, res) => {
  let conn;
  try {
    conn = await getConnection(req);
    await ensureTables(conn);
    const [rows] = await conn.execute('SELECT * FROM lab_catalogue ORDER BY name ASC');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching lab catalog:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * POST /api/lab-tests/catalog - Add new lab test to catalog
 */
router.post('/catalog', async (req, res) => {
  const { name, category, sample_type, preparation_instructions, turnaround_time } = req.body || {};
  
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Test name is required' });
  }

  let conn;
  try {
    conn = await getConnection(req);
    await ensureTables(conn);

    const [result] = await conn.execute(
      'INSERT INTO lab_catalogue (name, category, sample_type, preparation_instructions, turnaround_time) VALUES (?, ?, ?, ?, ?)',
      [name, category || null, sample_type || null, preparation_instructions || null, turnaround_time || null]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (e) {
    console.error('Error adding to lab catalog:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * GET /api/lab-tests - Get all prescribed lab tests (filtered by doctor)
 */
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await getConnection(req);
    await ensureTables(conn);
    
    // Build query with doctor filter
    const doctorFilter = getDoctorFilter(req, 'doctor_id');
    const whereSql = doctorFilter.whereSql ? `WHERE ${doctorFilter.whereSql}` : '';
    
    const [rows] = await conn.execute(
      `SELECT * FROM labs_test ${whereSql} ORDER BY id DESC`,
      doctorFilter.params
    );
    res.json(rows);
  } catch (e) {
    console.error('Error fetching prescribed lab tests:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * POST /api/lab-tests - Prescribe lab test to a patient (schema-resilient)
 */
router.post('/', async (req, res) => {
  const { 
    patient_id, 
    lab_catalogue_id, 
    test_name, 
    category, 
    sample_type, 
    preparation_instructions,
    full_name,
    email,
    phone 
  } = req.body || {};

  if (!test_name || !String(test_name).trim()) {
    return res.status(400).json({ error: 'Test name is required' });
  }

  let conn;
  try {
    conn = await getConnection(req);
    await ensureTables(conn);
    await conn.beginTransaction();

    let finalPatientId = patient_id;
    const doctorId = getDoctorIdForInsert(req);

    // If no patient_id, create a new patient entry
    if (!finalPatientId) {
      if (!full_name && !email && !phone) {
        await conn.rollback();
        return res.status(400).json({ error: 'Either patient_id or patient details required' });
      }

      const [existingPatient] = await conn.execute(
        'SELECT id FROM patients WHERE email = ? OR phone = ? LIMIT 1',
        [email || '', phone || '']
      );

      if (existingPatient.length > 0) {
        finalPatientId = existingPatient[0].id;
      } else {
        const [insertResult] = await conn.execute(
          'INSERT INTO patients (full_name, email, phone, doctor_id, created_at) VALUES (?, ?, ?, ?, NOW())',
          [full_name || 'Unknown', email || null, phone || null, doctorId]
        );
        finalPatientId = insertResult.insertId;
      }
    }

    // Schema-resilient INSERT: check if optional columns exist
    const hasLabCatalogueId = await columnExists(conn, 'labs_test', 'lab_catalogue_id');
    const hasCategory = await columnExists(conn, 'labs_test', 'category');
    const hasSampleType = await columnExists(conn, 'labs_test', 'sample_type');
    const hasPrep = await columnExists(conn, 'labs_test', 'preparation_instructions');
    
    let insertSql;
    let insertParams;
    
    const cols = ['patient_id', 'doctor_id'];
    const vals = [finalPatientId, doctorId];

    if (hasLabCatalogueId) {
      cols.push('lab_catalogue_id');
      vals.push(lab_catalogue_id || null);
    }

    cols.push('test_name');
    vals.push(test_name);

    if (hasCategory) {
      cols.push('category');
      vals.push(category || null);
    }
    if (hasSampleType) {
      cols.push('sample_type');
      vals.push(sample_type || null);
    }
    if (hasPrep) {
      cols.push('preparation_instructions');
      vals.push(preparation_instructions || null);
    }

    insertSql = `INSERT INTO labs_test (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
    insertParams = vals;

    const [result] = await conn.execute(insertSql, insertParams);

    await conn.commit();
    res.status(201).json({ success: true, id: result.insertId, patient_id: finalPatientId });
  } catch (e) {
    if (conn) await conn.rollback();
    console.error('Error prescribing lab test:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
