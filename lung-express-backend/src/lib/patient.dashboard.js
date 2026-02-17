import { getTenantPool } from './tenant-db.js';

/* ============================================================
   PATIENT DASHBOARD APIs
   Data visible to logged-in patients
   ============================================================ */

/**
 * GET /api/dashboard/patient/home
 * Returns patient's dashboard home data
 */
export async function getPatientHome(req, res) {
  try {
    const db = getTenantPool(req);
    const patientEmail = req.query.email;

    if (!patientEmail) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    // Get patient record
    const [[patient]] = await db.query(
      `SELECT id, full_name, email, phone, date_of_birth, gender, blood_group, patient_uid 
       FROM patients WHERE email = ? LIMIT 1`,
      [patientEmail]
    );

    if (!patient) {
      return res.json({
        patient: null,
        upcomingAppointments: [],
        recentPrescriptions: [],
        totalVisits: 0
      });
    }

    // Upcoming appointments
    const [upcomingAppointments] = await db.query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        d.name AS doctor_name,
        d.specialization
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.email = ?
        AND a.appointment_date >= CURDATE()
        AND a.status NOT IN ('cancelled', 'done')
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 5
    `, [patientEmail]);

    // Recent prescriptions
    const [recentPrescriptions] = await db.query(`
      SELECT 
        pm.id,
        pm.medicine_name,
        pm.dosage,
        pm.frequency,
        pm.duration,
        pm.prescribed_date,
        d.name AS doctor_name
      FROM prescribed_medicines pm
      LEFT JOIN doctors d ON pm.doctor_id = d.id
      WHERE pm.patient_id = ?
      ORDER BY pm.prescribed_date DESC
      LIMIT 5
    `, [patient.id]);

    // Total visits count
    const [[{ totalVisits }]] = await db.query(
      `SELECT COUNT(*) AS totalVisits FROM appointments WHERE email = ? AND status = 'done'`,
      [patientEmail]
    );

    res.json({
      patient,
      upcomingAppointments,
      recentPrescriptions,
      totalVisits
    });
  } catch (error) {
    console.error('❌ Patient home error:', error);
    res.status(500).json({ error: 'Failed to load patient dashboard' });
  }
}

/**
 * GET /api/dashboard/patient/appointments
 * Returns patient's appointments
 */
export async function getPatientAppointments(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, status } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    // Schema-aware: older tenants may not have doctors.profile_photo_url yet
    const [doctorColumns] = await db.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'doctors'
    `).catch(() => [[]]);

    const doctorColSet = new Set((doctorColumns || []).map((c) => c.COLUMN_NAME));
    const hasProfilePhotoUrl = doctorColSet.has('profile_photo_url');

    let query = `
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.message,
        a.created_at,
        d.name AS doctor_name,
        d.specialization,
        ${hasProfilePhotoUrl ? 'd.profile_photo_url' : 'NULL'} AS profile_photo_url
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.email = ?
    `;
    const params = [email];

    if (status && status !== 'all') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const [appointments] = await db.query(query, params);

    res.json({ appointments });
  } catch (error) {
    console.error('❌ Patient appointments error:', error);
    res.status(500).json({ error: 'Failed to load appointments' });
  }
}

/**
 * GET /api/dashboard/patient/medical-records
 * Returns patient's medical history
 */
export async function getPatientMedicalRecords(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    // Get patient ID
    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.json({ prescriptions: [], labTests: [], procedures: [] });
    }

    // Prescriptions
    const [prescriptions] = await db.query(`
      SELECT 
        pm.id,
        pm.medicine_name,
        pm.dosage,
        pm.frequency,
        pm.duration,
        pm.instructions,
        pm.prescribed_date,
        d.name AS doctor_name
      FROM prescribed_medicines pm
      LEFT JOIN doctors d ON pm.doctor_id = d.id
      WHERE pm.patient_id = ?
      ORDER BY pm.prescribed_date DESC
    `, [patient.id]);

    // Lab tests
    const [labTests] = await db.query(`
      SELECT 
        lt.id,
        lt.test_name,
        lt.status,
        lt.result,
        lt.prescribed_date,
        lt.completed_date,
        d.name AS doctor_name
      FROM labs_test lt
      LEFT JOIN doctors d ON lt.doctor_id = d.id
      WHERE lt.patient_id = ?
      ORDER BY lt.prescribed_date DESC
    `, [patient.id]);

    // Procedures
    const [procedures] = await db.query(`
      SELECT 
        p.id,
        p.procedure_name,
        p.status,
        p.notes,
        p.scheduled_date,
        p.completed_date,
        d.name AS doctor_name
      FROM procedures p
      LEFT JOIN doctors d ON p.doctor_id = d.id
      WHERE p.patient_id = ?
      ORDER BY p.prescribed_date DESC
    `, [patient.id]);

    res.json({ prescriptions, labTests, procedures });
  } catch (error) {
    console.error('❌ Patient medical records error:', error);
    res.status(500).json({ error: 'Failed to load medical records' });
  }
}

/**
 * GET /api/dashboard/patient/prescriptions
 * Returns patient's prescriptions
 */
export async function getPatientPrescriptions(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.json({ prescriptions: [] });
    }

    const [prescriptions] = await db.query(`
      SELECT 
        pm.id,
        pm.medicine_name,
        pm.dosage,
        pm.frequency,
        pm.duration,
        pm.instructions,
        pm.prescribed_date,
        d.name AS doctor_name,
        d.specialization
      FROM prescribed_medicines pm
      LEFT JOIN doctors d ON pm.doctor_id = d.id
      WHERE pm.patient_id = ?
      ORDER BY pm.prescribed_date DESC
    `, [patient.id]);

    res.json({ prescriptions });
  } catch (error) {
    console.error('❌ Patient prescriptions error:', error);
    res.status(500).json({ error: 'Failed to load prescriptions' });
  }
}

/**
 * GET /api/dashboard/patient/lab-reports
 * Returns patient's lab test results
 */
export async function getPatientLabReports(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.json({ labReports: [] });
    }

    const [labReports] = await db.query(`
      SELECT 
        lt.id,
        lt.test_name,
        lt.status,
        lt.result,
        lt.notes,
        lt.prescribed_date,
        lt.completed_date,
        d.name AS doctor_name,
        lc.category,
        lc.sample_type
      FROM labs_test lt
      LEFT JOIN doctors d ON lt.doctor_id = d.id
      LEFT JOIN lab_catalogue lc ON lt.lab_id = lc.id
      WHERE lt.patient_id = ?
      ORDER BY lt.prescribed_date DESC
    `, [patient.id]);

    res.json({ labReports });
  } catch (error) {
    console.error('❌ Patient lab reports error:', error);
    res.status(500).json({ error: 'Failed to load lab reports' });
  }
}

/**
 * GET /api/dashboard/patient/billing
 * Returns patient's billing/invoices
 */
export async function getPatientBilling(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [invoices] = await db.query(`
      SELECT 
        i.id,
        i.invoice_number,
        i.status,
        i.sub_total,
        i.tax,
        i.discount,
        i.total,
        i.issued_date,
        i.due_date,
        i.created_at
      FROM invoices i
      WHERE i.patient_email = ?
      ORDER BY i.created_at DESC
    `, [email]);

    // Summary
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0);
    const totalPending = invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + Number(i.total), 0);

    res.json({
      invoices,
      summary: {
        totalPaid,
        totalPending,
        invoiceCount: invoices.length
      }
    });
  } catch (error) {
    console.error('❌ Patient billing error:', error);
    res.status(500).json({ error: 'Failed to load billing information' });
  }
}

/**
 * GET /api/dashboard/patient/timeline
 * Returns patient's health timeline
 */
export async function getPatientTimeline(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.json({ timeline: [] });
    }

    // Combine appointments, prescriptions, lab tests into timeline
    const [appointments] = await db.query(`
      SELECT 
        'appointment' AS type,
        a.id,
        CONCAT('Appointment with Dr. ', COALESCE(d.name, 'Doctor')) AS title,
        a.status AS description,
        a.appointment_date AS event_date,
        d.name AS doctor_name
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.email = ?
    `, [email]);

    const [prescriptions] = await db.query(`
      SELECT 
        'prescription' AS type,
        pm.id,
        CONCAT('Prescribed: ', pm.medicine_name) AS title,
        pm.dosage AS description,
        pm.prescribed_date AS event_date,
        d.name AS doctor_name
      FROM prescribed_medicines pm
      LEFT JOIN doctors d ON pm.doctor_id = d.id
      WHERE pm.patient_id = ?
    `, [patient.id]);

    const [labTests] = await db.query(`
      SELECT 
        'lab_test' AS type,
        lt.id,
        CONCAT('Lab Test: ', lt.test_name) AS title,
        lt.status AS description,
        lt.prescribed_date AS event_date,
        d.name AS doctor_name
      FROM labs_test lt
      LEFT JOIN doctors d ON lt.doctor_id = d.id
      WHERE lt.patient_id = ?
    `, [patient.id]);

    // Combine and sort by date
    const timeline = [...appointments, ...prescriptions, ...labTests]
      .sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    res.json({ timeline });
  } catch (error) {
    console.error('❌ Patient timeline error:', error);
    res.status(500).json({ error: 'Failed to load health timeline' });
  }
}
