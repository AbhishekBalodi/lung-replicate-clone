import { getTenantPool } from './tenant-db.js';

/* ============================================================
   BILLING/REVENUE ANALYTICS
   ============================================================ */

/**
 * GET /api/dashboard/billing/summary
 * Returns billing/revenue statistics
 */
export async function getBillingSummary(req, res) {
  try {
    const db = getTenantPool(req);

    // Total revenue (paid invoices)
    const [[{ totalRevenue }]] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS totalRevenue
      FROM invoices
      WHERE status = 'paid'
    `);

    // Revenue this month
    const [[{ revenueThisMonth }]] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS revenueThisMonth
      FROM invoices
      WHERE status = 'paid'
        AND MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
    `);

    // Revenue last month (for comparison)
    const [[{ revenueLastMonth }]] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS revenueLastMonth
      FROM invoices
      WHERE status = 'paid'
        AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
    `);

    // Pending/unpaid invoices
    const [[{ unpaidCount, unpaidAmount }]] = await db.query(`
      SELECT 
        COUNT(*) AS unpaidCount,
        COALESCE(SUM(total), 0) AS unpaidAmount
      FROM invoices
      WHERE status = 'unpaid'
    `);

    // Invoice status distribution
    const [statusDistribution] = await db.query(`
      SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS amount
      FROM invoices
      GROUP BY status
    `);

    // Calculate month-over-month growth
    const growth = revenueLastMonth > 0 
      ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
      : 0;

    res.json({
      totalRevenue: Number(totalRevenue),
      revenueThisMonth: Number(revenueThisMonth),
      revenueLastMonth: Number(revenueLastMonth),
      monthlyGrowth: Number(growth),
      unpaidCount,
      unpaidAmount: Number(unpaidAmount),
      statusDistribution
    });
  } catch (error) {
    console.error('❌ Billing summary error:', error);
    res.status(500).json({ error: 'Failed to load billing summary' });
  }
}

/**
 * GET /api/dashboard/billing/revenue-by-month
 * Returns monthly revenue for charts
 */
export async function getRevenueByMonth(req, res) {
  try {
    const db = getTenantPool(req);
    const { months = 6 } = req.query;

    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(total) AS revenue,
        COUNT(*) AS invoiceCount
      FROM invoices
      WHERE status = 'paid'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
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
        revenue: existing ? Number(existing.revenue) : 0,
        invoiceCount: existing ? existing.invoiceCount : 0
      });
    }

    res.json({ revenueByMonth: result });
  } catch (error) {
    console.error('❌ Revenue by month error:', error);
    res.status(500).json({ error: 'Failed to load revenue data' });
  }
}

/**
 * GET /api/dashboard/billing/revenue-by-doctor
 * Returns revenue breakdown by doctor
 */
export async function getRevenueByDoctor(req, res) {
  try {
    const db = getTenantPool(req);

    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.name AS doctorName,
        d.specialization,
        COUNT(DISTINCT i.id) AS invoiceCount,
        COALESCE(SUM(i.total), 0) AS totalRevenue
      FROM doctors d
      LEFT JOIN appointments a ON a.doctor_id = d.id
      LEFT JOIN invoices i ON i.patient_id = a.id AND i.status = 'paid'
      GROUP BY d.id, d.name, d.specialization
      ORDER BY totalRevenue DESC
    `);

    res.json({ revenueByDoctor: rows });
  } catch (error) {
    console.error('❌ Revenue by doctor error:', error);
    res.status(500).json({ error: 'Failed to load doctor revenue' });
  }
}
