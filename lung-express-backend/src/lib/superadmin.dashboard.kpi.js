import { getTenantPool } from './tenant-db.js';

export async function getSuperAdminDashboard(req, res) {
  const db = getTenantPool(req);

  try {
    /* =========================
       DOCTORS
    ========================= */
    const [[{ totalDoctors }]] =
      await db.query(`SELECT COUNT(*) AS totalDoctors FROM doctors`);

    const [[{ activeDoctors }]] =
      await db.query(`
        SELECT COUNT(*) AS activeDoctors
        FROM doctors
        WHERE is_active = 1
      `);

    /* =========================
       PATIENTS
    ========================= */
    const [[{ totalPatients }]] =
      await db.query(`SELECT COUNT(*) AS totalPatients FROM patients`);

    const [[{ newPatients7d }]] =
      await db.query(`
        SELECT COUNT(*) AS newPatients7d
        FROM patients
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      `);

    const [[{ todayPatients }]] =
      await db.query(`
        SELECT COUNT(*) AS todayPatients
        FROM patients
        WHERE DATE(created_at) = CURDATE()
      `);

    /* =========================
       APPOINTMENTS
    ========================= */
    const [[{ todayAppointments }]] =
      await db.query(`
        SELECT COUNT(*) AS todayAppointments
        FROM appointments
        WHERE appointment_date = CURDATE()
      `);

    const [[{ completedToday }]] =
      await db.query(`
        SELECT COUNT(*) AS completedToday
        FROM appointments
        WHERE appointment_date = CURDATE() AND status = 'done'
      `);

    const [[{ cancelledThisMonth }]] =
      await db.query(`
        SELECT COUNT(*) AS cancelledThisMonth
        FROM appointments
        WHERE status = 'cancelled'
          AND MONTH(appointment_date) = MONTH(CURDATE())
          AND YEAR(appointment_date) = YEAR(CURDATE())
      `);

    const [[{ appointmentsThisMonth }]] =
      await db.query(`
        SELECT COUNT(*) AS appointmentsThisMonth
        FROM appointments
        WHERE MONTH(created_at) = MONTH(CURDATE())
          AND YEAR(created_at) = YEAR(CURDATE())
      `);

    const [[{ completedAppointmentsThisMonth }]] =
      await db.query(`
        SELECT COUNT(*) AS completedAppointmentsThisMonth
        FROM appointments
        WHERE status = 'done'
          AND MONTH(created_at) = MONTH(CURDATE())
          AND YEAR(created_at) = YEAR(CURDATE())
      `);

    const [[{ pendingAppointments }]] =
      await db.query(`
        SELECT COUNT(*) AS pendingAppointments
        FROM appointments
        WHERE status = 'pending' OR status IS NULL
      `);

    const [[{ totalAppointments }]] =
      await db.query(`SELECT COUNT(*) AS totalAppointments FROM appointments`);

    /* =========================
       BILLING / REVENUE
    ========================= */
    const [[{ totalRevenue }]] =
      await db.query(`
        SELECT COALESCE(SUM(total), 0) AS totalRevenue
        FROM invoices
        WHERE status = 'paid'
      `);

    const [[{ revenueThisMonth }]] =
      await db.query(`
        SELECT COALESCE(SUM(total), 0) AS revenueThisMonth
        FROM invoices
        WHERE status = 'paid'
          AND MONTH(created_at) = MONTH(CURDATE())
          AND YEAR(created_at) = YEAR(CURDATE())
      `);

    const [[{ revenueThisWeek }]] =
      await db.query(`
        SELECT COALESCE(SUM(total), 0) AS revenueThisWeek
        FROM invoices
        WHERE status = 'paid'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      `);

    const [[{ revenueThisYear }]] =
      await db.query(`
        SELECT COALESCE(SUM(total), 0) AS revenueThisYear
        FROM invoices
        WHERE status = 'paid'
          AND YEAR(created_at) = YEAR(CURDATE())
      `);

    const [[{ unpaidInvoices }]] =
      await db.query(`
        SELECT COUNT(*) AS unpaidInvoices
        FROM invoices
        WHERE status = 'unpaid'
      `);

    const [[{ pendingPaymentsAmount }]] =
      await db.query(`
        SELECT COALESCE(SUM(total), 0) AS pendingPaymentsAmount
        FROM invoices
        WHERE status = 'unpaid' OR status = 'pending'
      `);

    /* =========================
       ROOMS
    ========================= */
    const [[{ totalRooms }]] =
      await db.query(`SELECT COUNT(*) AS totalRooms FROM rooms`);

    const [[{ occupiedRooms }]] =
      await db.query(`
        SELECT COUNT(*) AS occupiedRooms
        FROM room_allotments
        WHERE status = 'active'
      `);

    /* =========================
       STAFF
    ========================= */
    let totalStaff = 0;
    let newStaffThisMonth = 0;
    try {
      const [[{ cnt }]] = await db.query(`SELECT COUNT(*) AS cnt FROM staff`);
      totalStaff = cnt;
      const [[{ newCnt }]] = await db.query(`
        SELECT COUNT(*) AS newCnt FROM staff
        WHERE MONTH(created_at) = MONTH(CURDATE())
          AND YEAR(created_at) = YEAR(CURDATE())
      `);
      newStaffThisMonth = newCnt;
    } catch { /* staff table may not exist */ }
    // Add doctors to staff count
    totalStaff += totalDoctors;

    /* =========================
       LAB TESTS (pending / unread)
    ========================= */
    let pendingLabTests = 0;
    let unreadLabReports = 0;
    try {
      const [[{ cnt }]] = await db.query(`
        SELECT COUNT(*) AS cnt FROM lab_tests
        WHERE status = 'pending' OR status = 'ordered'
      `);
      pendingLabTests = cnt;
      const [[{ unread }]] = await db.query(`
        SELECT COUNT(*) AS unread FROM lab_tests
        WHERE status = 'completed' AND (is_read = 0 OR is_read IS NULL)
      `);
      unreadLabReports = unread;
    } catch { /* lab_tests table may not exist */ }

    /* =========================
       TASKS
    ========================= */
    let pendingTasks = 0;
    let highPriorityTasks = 0;
    try {
      const [[{ cnt }]] = await db.query(`
        SELECT COUNT(*) AS cnt FROM tasks
        WHERE status = 'pending' OR status = 'in_progress'
      `);
      pendingTasks = cnt;
      const [[{ hp }]] = await db.query(`
        SELECT COUNT(*) AS hp FROM tasks
        WHERE (status = 'pending' OR status = 'in_progress')
          AND priority = 'high'
      `);
      highPriorityTasks = hp;
    } catch { /* tasks table may not exist */ }

    /* =========================
       EMERGENCY ALERTS
    ========================= */
    let emergencyAlerts = 0;
    try {
      const [[{ cnt }]] = await db.query(`
        SELECT COUNT(*) AS cnt FROM system_alerts
        WHERE severity = 'critical' AND (is_dismissed = 0 OR is_dismissed IS NULL)
      `);
      emergencyAlerts = cnt;
    } catch { /* system_alerts table may not exist */ }

    /* =========================
       RESPONSE
    ========================= */
    res.json({
      doctors: {
        total: totalDoctors,
        active: activeDoctors
      },
      patients: {
        total: totalPatients,
        newLast7Days: newPatients7d,
        today: todayPatients
      },
      appointments: {
        today: todayAppointments,
        completedToday,
        cancelledThisMonth,
        thisMonth: appointmentsThisMonth,
        completedThisMonth: completedAppointmentsThisMonth,
        pending: pendingAppointments,
        total: totalAppointments
      },
      billing: {
        totalRevenue,
        revenueThisMonth,
        revenueThisWeek,
        revenueThisYear,
        unpaidInvoices,
        pendingPaymentsAmount
      },
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms
      },
      staff: {
        total: totalStaff,
        newThisMonth: newStaffThisMonth
      },
      labTests: {
        pending: pendingLabTests,
        unread: unreadLabReports
      },
      tasks: {
        pending: pendingTasks,
        highPriority: highPriorityTasks
      },
      emergencyAlerts
    });
  } catch (error) {
    console.error('❌ SuperAdmin KPI error:', error);
    res.status(500).json({ error: 'Failed to load dashboard KPIs' });
  }
}
