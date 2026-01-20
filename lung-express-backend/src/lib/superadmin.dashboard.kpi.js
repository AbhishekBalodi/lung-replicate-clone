import { getTenantPool } from './tenant-db.js';

export async function getSuperAdminDashboard(req, res) {
  const db = getTenantPool(req);

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

  /* =========================
     APPOINTMENTS
  ========================= */
  const [[{ todayAppointments }]] =
    await db.query(`
      SELECT COUNT(*) AS todayAppointments
      FROM appointments
      WHERE appointment_date = CURDATE()
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

  const [[{ unpaidInvoices }]] =
    await db.query(`
      SELECT COUNT(*) AS unpaidInvoices
      FROM invoices
      WHERE status = 'unpaid'
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
     RESPONSE
  ========================= */
  res.json({
    doctors: {
      total: totalDoctors,
      active: activeDoctors
    },
    patients: {
      total: totalPatients,
      newLast7Days: newPatients7d
    },
    appointments: {
      today: todayAppointments,
      cancelledThisMonth,
      thisMonth: appointmentsThisMonth,
      completedThisMonth: completedAppointmentsThisMonth
    },
    billing: {
      totalRevenue,
      revenueThisMonth,
      unpaidInvoices
    },
    rooms: {
      total: totalRooms,
      occupied: occupiedRooms
    }
  });
}
