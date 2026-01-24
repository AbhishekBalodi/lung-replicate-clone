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
 * Returns patients filtered by the logged-in doctor (for hospital tenants).
 * Includes patients who have appointments with this doctor, plus patients explicitly assigned.
 */
router.get('/', async (req, res) => {
  const q = (req.query.q || req.query.search || '').toString().trim().toLowerCase();
  const config = getSchemaConfig(req);

  let conn;
  try {
    conn = await getConnection(req);
    
    // Get doctor ID from headers for filtering
    const doctorId = req.headers['x-doctor-id'];
    const userRole = req.headers['x-user-role'];
    const isSuperAdmin = userRole === 'super_admin';
    
    let patients = [];
    
    // Check if doctor_id column exists in appointments table
    const [doctorIdColCheck] = await conn.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'doctor_id'`
    );
    const hasAppointmentDoctorId = doctorIdColCheck.length > 0;
    
    // Check if doctor_id column exists in patients table
    const [patientDoctorIdCheck] = await conn.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'doctor_id'`
    );
    const hasPatientDoctorId = patientDoctorIdCheck.length > 0;
    
    if (config.isHospital && doctorId && !isSuperAdmin) {
      // For hospital doctors: get patients who have appointments with this doctor
      // OR patients explicitly assigned to this doctor
      if (hasAppointmentDoctorId && hasPatientDoctorId) {
        const [rows] = await conn.execute(`
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone, p.doctor_id
          FROM patients p
          WHERE p.doctor_id = ?
          UNION
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone, p.doctor_id
          FROM patients p
          INNER JOIN appointments a ON (
            (p.email = a.email AND p.email IS NOT NULL AND p.email <> '') 
            OR (p.phone = a.phone AND p.phone IS NOT NULL AND p.phone <> '')
          )
          WHERE a.doctor_id = ?
          ORDER BY full_name ASC
        `, [doctorId, doctorId]);
        patients = rows;
      } else if (hasAppointmentDoctorId) {
        // Only appointments has doctor_id
        const [rows] = await conn.execute(`
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone
          FROM patients p
          INNER JOIN appointments a ON (
            (p.email = a.email AND p.email IS NOT NULL AND p.email <> '') 
            OR (p.phone = a.phone AND p.phone IS NOT NULL AND p.phone <> '')
          )
          WHERE a.doctor_id = ?
          ORDER BY p.full_name ASC
        `, [doctorId]);
        patients = rows;
      } else {
        // Fallback: show all patients (legacy schema)
        const [rows] = await conn.execute(
          `SELECT id, full_name, email, phone FROM patients ORDER BY full_name ASC`
        );
        patients = rows;
      }
    } else if (config.isHospital) {
      // Super admin: see all patients
      const selectCols = hasPatientDoctorId ? 'id, full_name, email, phone, doctor_id' : 'id, full_name, email, phone';
      const [rows] = await conn.execute(
        `SELECT ${selectCols} FROM patients ORDER BY full_name ASC`
      );
      patients = rows;
    } else {
      // Individual doctor tenant: all patients belong to this tenant
      const [rows] = await conn.execute(
        `SELECT id, full_name, email, phone, doctor_assigned FROM patients ORDER BY full_name ASC`
      );
      patients = rows;
    }

    // Apply search filter if provided
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
  } finally {
    if (conn) conn.release();
  }
});

/**
 * GET /api/patients/search?term=xyz
 * Search patients by name, email, or phone (filtered by doctor for hospital tenants)
 */
router.get('/search', async (req, res) => {
  const term = (req.query.term || '').toString().trim().toLowerCase();
  const config = getSchemaConfig(req);
  
  if (!term) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  let conn;
  try {
    conn = await getConnection(req);
    
    const doctorId = req.headers['x-doctor-id'];
    const userRole = req.headers['x-user-role'];
    const isSuperAdmin = userRole === 'super_admin';
    
    // Check schema columns exist
    const [doctorIdColCheck] = await conn.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'doctor_id'`
    );
    const hasAppointmentDoctorId = doctorIdColCheck.length > 0;
    
    const [patientDoctorIdCheck] = await conn.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'doctor_id'`
    );
    const hasPatientDoctorId = patientDoctorIdCheck.length > 0;
    
    let patients = [];
    
    if (config.isHospital && doctorId && !isSuperAdmin) {
      // For hospital doctors: search only their patients
      if (hasPatientDoctorId && hasAppointmentDoctorId) {
        const [rows] = await conn.execute(`
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone
          FROM patients p
          WHERE (p.doctor_id = ? OR EXISTS (
            SELECT 1 FROM appointments a 
            WHERE a.doctor_id = ? 
            AND ((p.email = a.email AND p.email IS NOT NULL AND p.email <> '') 
                 OR (p.phone = a.phone AND p.phone IS NOT NULL AND p.phone <> ''))
          ))
          AND (LOWER(p.full_name) LIKE ? OR LOWER(p.email) LIKE ? OR p.phone LIKE ?)
          ORDER BY p.full_name ASC
        `, [doctorId, doctorId, `%${term}%`, `%${term}%`, `%${term}%`]);
        patients = rows;
      } else if (hasAppointmentDoctorId) {
        // Only appointments has doctor_id
        const [rows] = await conn.execute(`
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone
          FROM patients p
          INNER JOIN appointments a ON (
            (p.email = a.email AND p.email IS NOT NULL AND p.email <> '') 
            OR (p.phone = a.phone AND p.phone IS NOT NULL AND p.phone <> '')
          )
          WHERE a.doctor_id = ?
          AND (LOWER(p.full_name) LIKE ? OR LOWER(p.email) LIKE ? OR p.phone LIKE ?)
          ORDER BY p.full_name ASC
        `, [doctorId, `%${term}%`, `%${term}%`, `%${term}%`]);
        patients = rows;
      } else {
        // Fallback: search all patients
        const [rows] = await conn.execute(
          `SELECT id, full_name, email, phone FROM patients 
           WHERE LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?
           ORDER BY full_name ASC`,
          [`%${term}%`, `%${term}%`, `%${term}%`]
        );
        patients = rows;
      }
    } else {
      // Super admin or individual doctor: search all patients
      const [rows] = await conn.execute(
        `SELECT id, full_name, email, phone FROM patients 
         WHERE LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?
         ORDER BY full_name ASC`,
        [`%${term}%`, `%${term}%`, `%${term}%`]
      );
      patients = rows;
    }
    
    res.json(patients);
  } catch (e) {
    console.error('GET /api/patients/search failed:', e);
    res.status(500).json({ error: e.message || 'Failed to search patients' });
  } finally {
    if (conn) conn.release();
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

    // Schema-resilient: check if labs_test table exists
    let lab_tests = [];
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM labs_test WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC',
        [id]
      );
      lab_tests = rows;
    } catch (e) {
      console.log('labs_test table may not exist:', e.message);
    }

    const [procedures] = await conn.execute(
      'SELECT * FROM procedures WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC',
      [id]
    );

    // Get all appointments for this patient (by email AND phone)
    const [appointments] = await conn.execute(
      `SELECT * FROM appointments 
       WHERE email = ? OR phone = ? 
       ORDER BY appointment_date DESC, appointment_time DESC`,
      [patient.email || '', patient.phone || '']
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

export default router;
