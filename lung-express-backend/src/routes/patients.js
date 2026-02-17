import { Router } from 'express';
import { getPool, getConnection } from '../lib/tenant-db.js';
import { getDoctorFilter, getDoctorIdForInsert } from '../middleware/doctor-context.js';

const router = Router();

/**
 * Get schema-aware configuration based on tenant type
 */
function getSchemaConfig(req) {
  const isHospital = req.tenant?.type === 'hospital';
  return {
    isHospital,
    doctorColumn: isHospital ? 'doctor_id' : 'doctor_assigned',
    medicinesTable: isHospital ? 'prescribed_medicines' : 'medicines',
  };
}

/**
 * Generate a unique patient UID like "PT-2026-000042"
 * Format: PT-YYYY-NNNNNN (year of registration + zero-padded sequence)
 * The UID is tied to the patient's email – same email always gets the same UID.
 */
async function generatePatientUID(conn, patientId) {
  const year = new Date().getFullYear();
  const paddedId = String(patientId).padStart(6, '0');
  return `PT-${year}-${paddedId}`;
}

/**
 * Ensure patient_uid column exists (for existing tenants)
 */
async function ensurePatientUidColumn(conn) {
  try {
    const [cols] = await conn.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'patient_uid'`
    );
    if (cols.length === 0) {
      await conn.execute(`ALTER TABLE patients ADD COLUMN patient_uid VARCHAR(20) DEFAULT NULL AFTER id`);
      try {
        await conn.execute(`ALTER TABLE patients ADD UNIQUE KEY unique_patient_uid (patient_uid)`);
      } catch { /* index may already exist */ }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Backfill UIDs for patients that don't have one yet
 */
async function backfillPatientUIDs(conn) {
  try {
    const [rows] = await conn.execute(
      `SELECT id FROM patients WHERE patient_uid IS NULL OR patient_uid = '' ORDER BY id ASC`
    );
    for (const row of rows) {
      const uid = await generatePatientUID(conn, row.id);
      await conn.execute(`UPDATE patients SET patient_uid = ? WHERE id = ? AND (patient_uid IS NULL OR patient_uid = '')`, [uid, row.id]);
    }
  } catch (e) {
    console.warn('Backfill patient UIDs warning:', e.message);
  }
}

function makeKey(r) {
  const email = (r.email || '').trim().toLowerCase();
  const phone = (r.phone || '').toString().trim();
  const name  = (r.full_name || '').trim().toLowerCase();
  return `${email}|${phone}|${name}`;
}

/**
 * GET /api/patients (?q=search)
 */
router.get('/', async (req, res) => {
  const q = (req.query.q || req.query.search || '').toString().trim().toLowerCase();
  const config = getSchemaConfig(req);

  let conn;
  try {
    conn = await getConnection(req);
    
    // Ensure patient_uid column exists and backfill
    const hasUidCol = await ensurePatientUidColumn(conn);
    if (hasUidCol) {
      await backfillPatientUIDs(conn);
    }
    
    const doctorId = req.headers['x-doctor-id'];
    const userRole = req.headers['x-user-role'];
    const isSuperAdmin = userRole === 'super_admin';
    
    let patients = [];
    
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

    // Build SELECT columns including patient_uid
    const uidCol = hasUidCol ? ', p.patient_uid' : '';
    const uidColSimple = hasUidCol ? ', patient_uid' : '';
    
    if (config.isHospital && doctorId && !isSuperAdmin) {
      if (hasAppointmentDoctorId && hasPatientDoctorId) {
        const [rows] = await conn.execute(`
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone, p.doctor_id${uidCol}
          FROM patients p
          WHERE p.doctor_id = ?
          UNION
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone, p.doctor_id${uidCol}
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
        const [rows] = await conn.execute(`
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone${uidCol}
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
        const [rows] = await conn.execute(
          `SELECT id, full_name, email, phone${uidColSimple} FROM patients ORDER BY full_name ASC`
        );
        patients = rows;
      }
    } else if (config.isHospital) {
      const selectCols = hasPatientDoctorId 
        ? `id, full_name, email, phone, doctor_id${uidColSimple}` 
        : `id, full_name, email, phone${uidColSimple}`;
      const [rows] = await conn.execute(
        `SELECT ${selectCols} FROM patients ORDER BY full_name ASC`
      );
      patients = rows;
    } else {
      const [rows] = await conn.execute(
        `SELECT id, full_name, email, phone, doctor_assigned${uidColSimple} FROM patients ORDER BY full_name ASC`
      );
      patients = rows;
    }

    let out = patients;
    if (q) {
      out = patients.filter((r) =>
        (r.full_name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q) ||
        (r.patient_uid || '').toLowerCase().includes(q)
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
      if (hasPatientDoctorId && hasAppointmentDoctorId) {
        const [rows] = await conn.execute(`
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone, p.patient_uid
          FROM patients p
          WHERE (p.doctor_id = ? OR EXISTS (
            SELECT 1 FROM appointments a 
            WHERE a.doctor_id = ? 
            AND ((p.email = a.email AND p.email IS NOT NULL AND p.email <> '') 
                 OR (p.phone = a.phone AND p.phone IS NOT NULL AND p.phone <> ''))
          ))
          AND (LOWER(p.full_name) LIKE ? OR LOWER(p.email) LIKE ? OR p.phone LIKE ? OR LOWER(p.patient_uid) LIKE ?)
          ORDER BY p.full_name ASC
        `, [doctorId, doctorId, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
        patients = rows;
      } else if (hasAppointmentDoctorId) {
        const [rows] = await conn.execute(`
          SELECT DISTINCT p.id, p.full_name, p.email, p.phone, p.patient_uid
          FROM patients p
          INNER JOIN appointments a ON (
            (p.email = a.email AND p.email IS NOT NULL AND p.email <> '') 
            OR (p.phone = a.phone AND p.phone IS NOT NULL AND p.phone <> '')
          )
          WHERE a.doctor_id = ?
          AND (LOWER(p.full_name) LIKE ? OR LOWER(p.email) LIKE ? OR p.phone LIKE ? OR LOWER(p.patient_uid) LIKE ?)
          ORDER BY p.full_name ASC
        `, [doctorId, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]);
        patients = rows;
      } else {
        const [rows] = await conn.execute(
          `SELECT id, full_name, email, phone, patient_uid FROM patients 
           WHERE LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ? OR LOWER(patient_uid) LIKE ?
           ORDER BY full_name ASC`,
          [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
        );
        patients = rows;
      }
    } else {
      const [rows] = await conn.execute(
        `SELECT id, full_name, email, phone, patient_uid FROM patients 
         WHERE LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ? OR LOWER(patient_uid) LIKE ?
         ORDER BY full_name ASC`,
        [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
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
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const config = getSchemaConfig(req);
  let conn;
  
  try {
    conn = await getConnection(req);
    
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

    const [medicines] = await conn.execute(
      `SELECT * FROM ${config.medicinesTable} WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC`,
      [id]
    );

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
 * POST /api/patients
 * Create a new patient with auto-generated UID
 */
router.post('/', async (req, res) => {
  let conn;
  try {
    const { full_name, email, phone, doctor_id, date_of_birth, address, gender, blood_group } = req.body;

    if (!full_name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    conn = await getConnection(req);

    // Ensure patient_uid column exists
    await ensurePatientUidColumn(conn);

    // Check if patient already exists
    const [existing] = await conn.execute(
      'SELECT id, patient_uid FROM patients WHERE email = ? AND phone = ?',
      [email.trim(), phone.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'A patient with this email and phone already exists' });
    }

    const config = getSchemaConfig(req);
    const doctorValue = doctor_id || null;

    let insertSQL, insertParams;
    if (config.isHospital) {
      insertSQL = `INSERT INTO patients (full_name, email, phone, doctor_id, date_of_birth, address, is_active, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`;
      insertParams = [full_name.trim(), email.trim(), phone.trim(), doctorValue, date_of_birth || null, address || null];
    } else {
      insertSQL = `INSERT INTO patients (full_name, email, phone, date_of_birth, address, is_active, created_at)
                   VALUES (?, ?, ?, ?, ?, 1, NOW())`;
      insertParams = [full_name.trim(), email.trim(), phone.trim(), date_of_birth || null, address || null];
    }

    const [result] = await conn.execute(insertSQL, insertParams);
    const patientId = result.insertId;

    // Generate and assign UID
    const patientUid = await generatePatientUID(conn, patientId);
    await conn.execute('UPDATE patients SET patient_uid = ? WHERE id = ?', [patientUid, patientId]);

    // Register in platform tenant_users table
    if (req.tenant?.id) {
      try {
        const { platformPool } = await import('../lib/platform-db.js');
        const [existingUser] = await platformPool.execute(
          'SELECT id FROM tenant_users WHERE tenant_id = ? AND email = ? AND role = ?',
          [req.tenant.id, email.trim(), 'patient']
        );

        if (existingUser.length === 0) {
          await platformPool.execute(
            `INSERT INTO tenant_users (tenant_id, email, phone, name, role, is_active)
             VALUES (?, ?, ?, ?, 'patient', TRUE)`,
            [req.tenant.id, email.trim(), phone.trim(), full_name.trim()]
          );
        }
      } catch (platformErr) {
        console.warn('Could not register patient in platform table:', platformErr.message);
      }
    }

    res.status(201).json({
      success: true,
      patient: {
        id: patientId,
        patient_uid: patientUid,
        full_name: full_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        doctor_id: doctorValue
      }
    });
  } catch (e) {
    console.error('POST /api/patients failed:', e);
    res.status(500).json({ error: e.message || 'Failed to create patient' });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
