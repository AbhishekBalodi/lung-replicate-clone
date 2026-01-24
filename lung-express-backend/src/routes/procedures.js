import { Router } from 'express';
import { getPool, getConnection } from '../lib/tenant-db.js';
import { getDoctorFilter, getDoctorIdForInsert } from '../middleware/doctor-context.js';

const router = Router();

/**
 * Ensure procedure_catalogue and procedures tables exist
 */
async function ensureTables(conn) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS procedure_catalogue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      duration VARCHAR(50),
      preparation_instructions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS procedures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      doctor_id INT NULL,
      procedure_name VARCHAR(150) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      preparation_instructions TEXT,
      prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Backwards-compatible column enforcement (older tenant schemas won't get new cols from CREATE TABLE IF NOT EXISTS)
  await ensureColumn(conn, 'procedure_catalogue', 'category', 'VARCHAR(100) NULL');
  await ensureColumn(conn, 'procedure_catalogue', 'description', 'TEXT NULL');
  await ensureColumn(conn, 'procedure_catalogue', 'duration', 'VARCHAR(50) NULL');
  await ensureColumn(conn, 'procedure_catalogue', 'preparation_instructions', 'TEXT NULL');

  await ensureColumn(conn, 'procedures', 'doctor_id', 'INT NULL');
  await ensureColumn(conn, 'procedures', 'category', 'VARCHAR(100) NULL');
  await ensureColumn(conn, 'procedures', 'description', 'TEXT NULL');
  await ensureColumn(conn, 'procedures', 'preparation_instructions', 'TEXT NULL');
  await ensureColumn(conn, 'procedures', 'prescribed_date', 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP');
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

async function ensureColumn(conn, tableName, columnName, columnSqlDef) {
  const exists = await columnExists(conn, tableName, columnName);
  if (exists) return;
  try {
    await conn.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnSqlDef}`);
  } catch (e) {
    console.log(`ensureColumn skipped for ${tableName}.${columnName}:`, e.message);
  }
}

/**
 * GET /api/procedures/catalog - Get all procedures from catalog
 */
router.get('/catalog', async (req, res) => {
  let conn;
  try {
    conn = await getConnection(req);
    await ensureTables(conn);
    const [rows] = await conn.execute('SELECT * FROM procedure_catalogue ORDER BY name ASC');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching procedure catalog:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * POST /api/procedures/catalog - Add new procedure to catalog
 */
router.post('/catalog', async (req, res) => {
  const { name, category, description, duration, preparation_instructions } = req.body || {};
  
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Procedure name is required' });
  }

  let conn;
  try {
    conn = await getConnection(req);
    await ensureTables(conn);

    // Schema-resilient: check if duration column exists in catalogue
    const hasDuration = await columnExists(conn, 'procedure_catalogue', 'duration');
    
    let insertSql;
    let insertParams;
    
    if (hasDuration) {
      insertSql = 'INSERT INTO procedure_catalogue (name, category, description, duration, preparation_instructions) VALUES (?, ?, ?, ?, ?)';
      insertParams = [name, category || null, description || null, duration || null, preparation_instructions || null];
    } else {
      insertSql = 'INSERT INTO procedure_catalogue (name, category, description, preparation_instructions) VALUES (?, ?, ?, ?)';
      insertParams = [name, category || null, description || null, preparation_instructions || null];
    }

    const [result] = await conn.execute(insertSql, insertParams);

    res.status(201).json({ success: true, id: result.insertId });
  } catch (e) {
    console.error('Error adding to procedure catalog:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * GET /api/procedures - Get all prescribed procedures (filtered by doctor)
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
      `SELECT * FROM procedures ${whereSql} ORDER BY id DESC`,
      doctorFilter.params
    );
    res.json(rows);
  } catch (e) {
    console.error('Error fetching prescribed procedures:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * POST /api/procedures - Prescribe procedure to a patient (schema-resilient)
 */
router.post('/', async (req, res) => {
  const { 
    patient_id, 
    procedure_catalogue_id, 
    procedure_name, 
    category, 
    description,
    preparation_instructions,
    full_name,
    email,
    phone 
  } = req.body || {};

  if (!procedure_name || !String(procedure_name).trim()) {
    return res.status(400).json({ error: 'Procedure name is required' });
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
        return res.status(400).json({ error: 'Either patient_id or patient details (name/email/phone) required' });
      }

      // Check if patient already exists
      const [existingPatient] = await conn.execute(
        'SELECT id FROM patients WHERE (email = ? AND email <> "") OR (phone = ? AND phone <> "") LIMIT 1',
        [email || '', phone || '']
      );

      if (existingPatient.length > 0) {
        finalPatientId = existingPatient[0].id;
      } else {
        const [patientResult] = await conn.execute(
          'INSERT INTO patients (full_name, email, phone, doctor_id) VALUES (?, ?, ?, ?)',
          [full_name || 'Unknown', email || null, phone || null, doctorId]
        );
        finalPatientId = patientResult.insertId;
      }
    }

    // Schema-resilient INSERT: include only columns that exist
    const hasCatalogueId = await columnExists(conn, 'procedures', 'procedure_catalogue_id');
    const hasCategory = await columnExists(conn, 'procedures', 'category');
    const hasDescription = await columnExists(conn, 'procedures', 'description');
    const hasPrep = await columnExists(conn, 'procedures', 'preparation_instructions');

    const cols = ['patient_id', 'doctor_id'];
    const vals = [finalPatientId, doctorId];

    if (hasCatalogueId) {
      cols.push('procedure_catalogue_id');
      vals.push(procedure_catalogue_id || null);
    }

    cols.push('procedure_name');
    vals.push(procedure_name);

    if (hasCategory) {
      cols.push('category');
      vals.push(category || null);
    }
    if (hasDescription) {
      cols.push('description');
      vals.push(description || null);
    }
    if (hasPrep) {
      cols.push('preparation_instructions');
      vals.push(preparation_instructions || null);
    }

    const insertSql = `INSERT INTO procedures (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
    const insertParams = vals;

    const [result] = await conn.execute(insertSql, insertParams);

    await conn.commit();
    res.status(201).json({ success: true, id: result.insertId, patient_id: finalPatientId });
  } catch (e) {
    if (conn) await conn.rollback();
    console.error('Error prescribing procedure:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
