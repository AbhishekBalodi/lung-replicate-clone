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

    // Schema-resilient INSERT: check if lab_catalogue_id column exists
    const hasLabCatalogueId = await columnExists(conn, 'labs_test', 'lab_catalogue_id');
    
    let insertSql;
    let insertParams;
    
    if (hasLabCatalogueId) {
      insertSql = 'INSERT INTO labs_test (patient_id, doctor_id, lab_catalogue_id, test_name, category, sample_type, preparation_instructions) VALUES (?, ?, ?, ?, ?, ?, ?)';
      insertParams = [finalPatientId, doctorId, lab_catalogue_id || null, test_name, category || null, sample_type || null, preparation_instructions || null];
    } else {
      // Fallback for schemas without lab_catalogue_id
      insertSql = 'INSERT INTO labs_test (patient_id, doctor_id, test_name, category, sample_type, preparation_instructions) VALUES (?, ?, ?, ?, ?, ?)';
      insertParams = [finalPatientId, doctorId, test_name, category || null, sample_type || null, preparation_instructions || null];
    }

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
