import { Router } from 'express';
import { pool } from '../lib/db.js';

const router = Router();

function makeKey(r) {
  const email = (r.email || '').trim().toLowerCase();
  const phone = (r.phone || '').toString().trim();
  const name  = (r.full_name || '').trim().toLowerCase();
  return `${email}|${phone}|${name}`;
}

/**
 * GET /api/patients (?q=search)
 * Returns the full patients list (optionally filtered by ?q=) sorted by name.
 */
router.get('/', async (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();

  try {
    // Simply get all patients - no complex sync logic
    const [patients] = await pool.execute(
      'SELECT id, full_name, email, phone FROM patients ORDER BY full_name ASC'
    );

    let out = patients;
    if (q) {
      out = patients.filter((r) =>
        (r.full_name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
      );
    }

    res.json(out);
  } catch (e) {
    console.error('GET /api/patients failed:', e);
    res.status(500).json({ error: e.message || 'Failed to load patients' });
  }
});

/**
 * GET /api/patients/:id
 * Returns a single patient plus their medicines, newest first.
 * NOTE: We order by `prescribed_date` only because the table does not have `created_at`.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Ensure procedures table exists
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS procedures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        procedure_catalogue_id INT,
        procedure_name VARCHAR(150) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        preparation_instructions TEXT,
        prescribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);
    
    const [patients] = await conn.execute(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );
    if (!patients.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const [medicines] = await conn.execute(
      'SELECT * FROM medicines WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC',
      [id]
    );

    const [lab_tests] = await conn.execute(
      'SELECT * FROM labs_test WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC',
      [id]
    );

    const [procedures] = await conn.execute(
      'SELECT * FROM procedures WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC',
      [id]
    );

    res.json({ ...patients[0], medicines, lab_tests, procedures });
  } catch (e) {
    console.error('GET /api/patients/:id failed:', e);
    res.status(500).json({ error: e.message || 'Failed to load patient' });
  } finally {
    if (conn) conn.release();
  }
});

/**
 * GET /api/patients/:id/prescriptions
 * Standalone prescriptions list (same ordering).
 */
router.get('/:id/prescriptions', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM medicines WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC',
      [id]
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /api/patients/:id/prescriptions failed:', e);
    res.status(500).json({ error: e.message || 'Failed to load prescriptions' });
  }
});

/**
 * GET /api/patients/search?term=xyz
 * Search patients by name, email, or phone
 */
router.get('/search', async (req, res) => {
  const term = (req.query.term || '').toString().trim().toLowerCase();
  
  if (!term) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const [patients] = await pool.execute(
      'SELECT id, full_name, email, phone FROM patients WHERE LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ? ORDER BY full_name ASC',
      [`%${term}%`, `%${term}%`, `%${term}%`]
    );
    res.json(patients);
  } catch (e) {
    console.error('GET /api/patients/search failed:', e);
    res.status(500).json({ error: e.message || 'Failed to search patients' });
  }
});

export default router;
