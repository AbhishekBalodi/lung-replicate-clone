import { getTenantPool } from './tenant-db.js';

/* ============================================================
   APPOINTMENTS ANALYTICS
   ============================================================ */

/**
 * GET /api/dashboard/appointments/summary
 * Returns appointment statistics
 */
export async function getAppointmentsSummary(req, res) {
  try {
    const db = getTenantPool(req);

    // Today's appointments
    const [[{ todayCount }]] = await db.query(`
      SELECT COUNT(*) AS todayCount
      FROM appointments
      WHERE appointment_date = CURDATE()
    `);

    // This week
    const [[{ weekCount }]] = await db.query(`
      SELECT COUNT(*) AS weekCount
      FROM appointments
      WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        AND appointment_date <= DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 6 DAY)
    `);

    // This month
    const [[{ monthCount }]] = await db.query(`
      SELECT COUNT(*) AS monthCount
      FROM appointments
      WHERE MONTH(appointment_date) = MONTH(CURDATE())
        AND YEAR(appointment_date) = YEAR(CURDATE())
    `);

    // Status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM appointments
      WHERE MONTH(appointment_date) = MONTH(CURDATE())
        AND YEAR(appointment_date) = YEAR(CURDATE())
      GROUP BY status
    `);

    // Upcoming appointments (next 7 days)
    const [[{ upcomingCount }]] = await db.query(`
      SELECT COUNT(*) AS upcomingCount
      FROM appointments
      WHERE appointment_date > CURDATE()
        AND appointment_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND status NOT IN ('cancelled', 'done')
    `);

    // Completed this month
    const completed = statusBreakdown.find(s => s.status === 'done')?.count || 0;
    const cancelled = statusBreakdown.find(s => s.status === 'cancelled')?.count || 0;
    const pending = statusBreakdown.find(s => s.status === 'pending')?.count || 0;

    res.json({
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      upcoming: upcomingCount,
      completed,
      cancelled,
      pending,
      statusBreakdown
    });
  } catch (error) {
    console.error('❌ Appointments summary error:', error);
    res.status(500).json({ error: 'Failed to load appointments summary' });
  }
}

/**
 * GET /api/dashboard/appointments/by-doctor
 * Returns appointment counts by doctor
 */
export async function getAppointmentsByDoctor(req, res) {
  try {
    const db = getTenantPool(req);

    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.name AS doctorName,
        d.specialization,
        COUNT(a.id) AS totalAppointments,
        SUM(CASE WHEN a.status = 'done' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending
      FROM doctors d
      LEFT JOIN appointments a ON a.doctor_id = d.id
      GROUP BY d.id, d.name, d.specialization
      ORDER BY totalAppointments DESC
    `);

    res.json({ appointmentsByDoctor: rows });
  } catch (error) {
    console.error('❌ Appointments by doctor error:', error);
    res.status(500).json({ error: 'Failed to load appointments by doctor' });
  }
}

/**
 * GET /api/dashboard/appointments/by-month
 * Returns appointment counts by month for charts
 */
export async function getAppointmentsByMonth(req, res) {
  try {
    const db = getTenantPool(req);
    const { months = 6 } = req.query;

    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(appointment_date, '%Y-%m') AS month,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
      FROM appointments
      WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
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
        total: existing ? existing.total : 0,
        completed: existing ? existing.completed : 0,
        cancelled: existing ? existing.cancelled : 0
      });
    }

    res.json({ appointmentsByMonth: result });
  } catch (error) {
    console.error('❌ Appointments by month error:', error);
    res.status(500).json({ error: 'Failed to load appointments data' });
  }
}
