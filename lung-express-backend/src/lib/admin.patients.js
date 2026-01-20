import { getTenantPool } from './tenant-db.js';

/* ============================================================
   PATIENTS ANALYTICS
   ============================================================ */

/**
 * GET /api/dashboard/patients/summary
 * Returns patient statistics
 */
export async function getPatientsSummary(req, res) {
  try {
    const db = getTenantPool(req);

    // Total patients
    const [[{ totalPatients }]] = await db.query(
      `SELECT COUNT(*) AS totalPatients FROM patients`
    );

    // Active patients
    const [[{ activePatients }]] = await db.query(
      `SELECT COUNT(*) AS activePatients FROM patients WHERE is_active = 1`
    );

    // New patients this week
    const [[{ newThisWeek }]] = await db.query(`
      SELECT COUNT(*) AS newThisWeek
      FROM patients
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);

    // New patients this month
    const [[{ newThisMonth }]] = await db.query(`
      SELECT COUNT(*) AS newThisMonth
      FROM patients
      WHERE MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
    `);

    // Patients by gender
    const [byGender] = await db.query(`
      SELECT 
        COALESCE(gender, 'unknown') AS gender,
        COUNT(*) AS count
      FROM patients
      GROUP BY gender
    `);

    // Patients by blood group
    const [byBloodGroup] = await db.query(`
      SELECT 
        COALESCE(blood_group, 'Unknown') AS blood_group,
        COUNT(*) AS count
      FROM patients
      GROUP BY blood_group
      ORDER BY count DESC
    `);

    res.json({
      total: totalPatients,
      active: activePatients,
      newThisWeek,
      newThisMonth,
      byGender,
      byBloodGroup
    });
  } catch (error) {
    console.error('❌ Patients summary error:', error);
    res.status(500).json({ error: 'Failed to load patients summary' });
  }
}

/**
 * GET /api/dashboard/patients/by-month
 * Returns new patient registrations by month
 */
export async function getPatientsByMonth(req, res) {
  try {
    const db = getTenantPool(req);
    const { months = 6 } = req.query;

    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM patients
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY month
      ORDER BY month ASC
    `, [Number(months)]);

    // Normalize to ensure all months are present
    const result = [];
    const now = new Date();
    for (let i = Number(months) - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toISOString().slice(0, 7);
      const existing = rows.find(r => r.month === month);
      result.push({
        month,
        count: existing ? existing.count : 0
      });
    }

    res.json({ patientsByMonth: result });
  } catch (error) {
    console.error('❌ Patients by month error:', error);
    res.status(500).json({ error: 'Failed to load patients data' });
  }
}

/**
 * GET /api/dashboard/patients/by-doctor
 * Returns patient counts by doctor
 */
export async function getPatientsByDoctor(req, res) {
  try {
    const db = getTenantPool(req);

    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.name AS doctorName,
        d.specialization,
        COUNT(p.id) AS patientCount
      FROM doctors d
      LEFT JOIN patients p ON p.doctor_id = d.id
      GROUP BY d.id, d.name, d.specialization
      ORDER BY patientCount DESC
    `);

    res.json({ patientsByDoctor: rows });
  } catch (error) {
    console.error('❌ Patients by doctor error:', error);
    res.status(500).json({ error: 'Failed to load patients by doctor' });
  }
}
