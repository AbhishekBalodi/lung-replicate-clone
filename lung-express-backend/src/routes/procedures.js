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
      procedure_catalogue_id INT,
      procedure_name VARCHAR(150) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      preparation_instructions TEXT,
      prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (procedure_catalogue_id) REFERENCES procedure_catalogue(id) ON DELETE SET NULL
    )
  `);
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

    const [result] = await conn.execute(
      'INSERT INTO procedure_catalogue (name, category, description, duration, preparation_instructions) VALUES (?, ?, ?, ?, ?)',
      [name, category || null, description || null, duration || null, preparation_instructions || null]
    );

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
 * POST /api/procedures - Prescribe procedure to a patient
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

      const [patientResult] = await conn.execute(
        'INSERT INTO patients (full_name, email, phone, doctor_id) VALUES (?, ?, ?, ?)',
        [full_name || 'Unknown', email || null, phone || null, doctorId]
      );
      finalPatientId = patientResult.insertId;
    }

    const [result] = await conn.execute(
      'INSERT INTO procedures (patient_id, doctor_id, procedure_catalogue_id, procedure_name, category, description, preparation_instructions) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [finalPatientId, doctorId, procedure_catalogue_id || null, procedure_name, category || null, description || null, preparation_instructions || null]
    );

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
