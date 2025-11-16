import { Router } from 'express';
import { pool } from '../lib/db.js';

const router = Router();

/**
 * Ensure lab_catalogue and labs_test tables exist
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
      lab_catalogue_id INT,
      test_name VARCHAR(150) NOT NULL,
      category VARCHAR(100),
      sample_type VARCHAR(100),
      preparation_instructions TEXT,
      prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (lab_catalogue_id) REFERENCES lab_catalogue(id) ON DELETE SET NULL
    )
  `);
}

/**
 * GET /api/lab-tests/catalog - Get all lab tests from catalog
 */
router.get('/catalog', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
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
    conn = await pool.getConnection();
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
 * GET /api/lab-tests - Get all prescribed lab tests
 */
router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await ensureTables(conn);
    const [rows] = await conn.execute('SELECT * FROM labs_test ORDER BY id DESC');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching prescribed lab tests:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * POST /api/lab-tests - Prescribe lab test to a patient
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
    conn = await pool.getConnection();
    await ensureTables(conn);
    await conn.beginTransaction();

    let finalPatientId = patient_id;

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
          'INSERT INTO patients (full_name, email, phone, created_at) VALUES (?, ?, ?, NOW())',
          [full_name || 'Unknown', email || null, phone || null]
        );
        finalPatientId = insertResult.insertId;
      }
    }

    // Insert the prescribed lab test
    const [result] = await conn.execute(
      'INSERT INTO labs_test (patient_id, lab_catalogue_id, test_name, category, sample_type, preparation_instructions) VALUES (?, ?, ?, ?, ?, ?)',
      [finalPatientId, lab_catalogue_id || null, test_name, category || null, sample_type || null, preparation_instructions || null]
    );

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
