import { Router } from 'express';
import { getPool, getConnection } from '../lib/tenant-db.js';
import { getDoctorFilter, getDoctorIdForInsert } from '../middleware/doctor-context.js';

const router = Router();

/**
 * Get schema-aware configuration based on tenant type
 * Hospital tenants use doctor_id (INT), individual doctors use doctor_assigned (VARCHAR)
 */
function getSchemaConfig(req) {
  const isHospital = req.tenant?.type === 'hospital';
  
  return {
    isHospital,
    // Doctor column differs between hospital and doctor schemas
    doctorColumn: isHospital ? 'doctor_id' : 'doctor_assigned',
    // Medicines table name differs (hospital uses prescribed_medicines, doctor uses medicines)
    medicinesTable: isHospital ? 'prescribed_medicines' : 'medicines',
  };
}

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
  const config = getSchemaConfig(req);

  try {
    const pool = getPool(req);
    
    // Build query with doctor filter (only for hospital tenants)
    let whereSql = '';
    let params = [];
    
    if (config.isHospital) {
      const doctorFilter = getDoctorFilter(req, 'doctor_id');
      whereSql = doctorFilter.whereSql ? `WHERE ${doctorFilter.whereSql}` : '';
      params = doctorFilter.params;
    }
    
    const [patients] = await pool.execute(
      `SELECT id, full_name, email, phone${config.isHospital ? ', doctor_id' : ', doctor_assigned'} FROM patients ${whereSql} ORDER BY full_name ASC`,
      params
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
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const config = getSchemaConfig(req);
  let conn;
  
  try {
    conn = await getConnection(req);
    
    // Ensure procedures table exists (for backwards compatibility)
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

    const patient = patients[0];

    // Get medicines from the appropriate table based on schema
    const [medicines] = await conn.execute(
      `SELECT * FROM ${config.medicinesTable} WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC`,
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

    // Get all appointments for this patient (by email AND phone)
    const [appointments] = await conn.execute(
      `SELECT * FROM appointments 
       WHERE email = ? AND phone = ? 
       ORDER BY appointment_date DESC, appointment_time DESC`,
      [patient.email, patient.phone]
    );

    res.json({ ...patient, medicines, lab_tests, procedures, appointments });
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
  const config = getSchemaConfig(req);
  
  try {
    const pool = getPool(req);
    const [rows] = await pool.execute(
      `SELECT * FROM ${config.medicinesTable} WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC`,
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
  const config = getSchemaConfig(req);
  
  if (!term) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const pool = getPool(req);
    
    // Build query with doctor filter (only for hospital tenants)
    let whereSql = '(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?)';
    let params = [`%${term}%`, `%${term}%`, `%${term}%`];
    
    if (config.isHospital) {
      const doctorFilter = getDoctorFilter(req, 'doctor_id');
      if (doctorFilter.whereSql) {
        whereSql = `${doctorFilter.whereSql} AND ${whereSql}`;
        params = [...doctorFilter.params, ...params];
      }
    }
    
    const [patients] = await pool.execute(
      `SELECT id, full_name, email, phone FROM patients WHERE ${whereSql} ORDER BY full_name ASC`,
      params
    );
    res.json(patients);
  } catch (e) {
    console.error('GET /api/patients/search failed:', e);
    res.status(500).json({ error: e.message || 'Failed to search patients' });
  }
});

export default router;
