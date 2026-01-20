import { getTenantPool } from './tenant-db.js';

/* ============================================================
   Utility: Ensure last 6 months always exist in chart data
   ============================================================ */
function normalizeLast6Months(rows, valueKey) {
  const map = {};

  // Convert DB rows to lookup map
  rows.forEach(row => {
    map[row.month] = Number(row[valueKey] || 0);
  });

  const result = [];
  const now = new Date();

  // Generate last 6 months (YYYY-MM)
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.toISOString().slice(0, 7);

    result.push({
      month,
      [valueKey]: map[month] || 0
    });
  }

  return result;
}

/* ============================================================
   SUPER ADMIN DASHBOARD – CHART DATA
   ============================================================ */
export async function getSuperAdminDashboardCharts(req, res) {
  try {
    const db = getTenantPool(req);

    /* =========================
       MONTHLY REVENUE (LAST 6 MONTHS)
    ========================= */
    const [revenueRows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(total) AS revenue
      FROM invoices
      WHERE status = 'paid'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    /* =========================
       MONTHLY APPOINTMENTS (LAST 6 MONTHS)
    ========================= */
    const [appointmentRows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM appointments
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `);

    /* =========================
       NORMALIZE DATA (NO GAPS)
    ========================= */
    const revenueByMonth =
      normalizeLast6Months(revenueRows, 'revenue');

    const appointmentsByMonth =
      normalizeLast6Months(appointmentRows, 'count');

    /* =========================
       RESPONSE
    ========================= */
    res.json({
      revenueByMonth,
      appointmentsByMonth
    });

  } catch (error) {
    console.error('❌ SuperAdmin chart error:', error);
    res.status(500).json({
      error: 'Failed to load dashboard charts'
    });
  }
}
