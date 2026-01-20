import { getTenantPool } from './tenant-db.js';

/* ============================================================
   BLOOD BANK MANAGEMENT - Stock, Donors, Analytics
   ============================================================ */

/**
 * GET /api/dashboard/blood-bank/summary
 * Returns blood bank statistics
 */
export async function getBloodBankSummary(req, res) {
  try {
    const db = getTenantPool(req);

    // Total stock by blood group
    const [stockByGroup] = await db.query(`
      SELECT 
        bg.group_name,
        bg.rh_factor,
        CONCAT(bg.group_name, bg.rh_factor) AS blood_type,
        COALESCE(SUM(bs.units), 0) AS units
      FROM blood_groups bg
      LEFT JOIN blood_stock bs ON bs.blood_group_id = bg.id
      GROUP BY bg.id, bg.group_name, bg.rh_factor
      ORDER BY bg.group_name, bg.rh_factor
    `);

    // Total units
    const totalUnits = stockByGroup.reduce((sum, g) => sum + Number(g.units), 0);

    // Expiring soon (within 7 days)
    const [[{ expiringSoon }]] = await db.query(`
      SELECT COALESCE(SUM(units), 0) AS expiringSoon
      FROM blood_stock
      WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `);

    // Critical levels (types with < 5 units)
    const criticalTypes = stockByGroup.filter(g => Number(g.units) < 5);

    // Total donors
    const [[{ totalDonors }]] = await db.query(
      `SELECT COUNT(*) AS totalDonors FROM blood_donors`
    );

    res.json({
      totalUnits,
      expiringSoon: Number(expiringSoon),
      criticalTypes: criticalTypes.length,
      totalDonors,
      stockByGroup
    });
  } catch (error) {
    console.error('❌ Blood bank summary error:', error);
    res.status(500).json({ error: 'Failed to load blood bank summary' });
  }
}

/**
 * GET /api/dashboard/blood-bank/stock
 * Returns detailed blood stock with filters
 */
export async function getBloodStock(req, res) {
  try {
    const db = getTenantPool(req);
    const { bloodType, status } = req.query;

    let query = `
      SELECT 
        bs.id,
        CONCAT(bg.group_name, bg.rh_factor) AS blood_type,
        bs.units,
        bs.batch_number,
        bs.expiry_date,
        bs.source,
        bs.created_at AS collection_date,
        CASE 
          WHEN bs.expiry_date < CURDATE() THEN 'Expired'
          WHEN bs.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Expiring Soon'
          ELSE 'Available'
        END AS status
      FROM blood_stock bs
      JOIN blood_groups bg ON bs.blood_group_id = bg.id
      WHERE 1=1
    `;
    const params = [];

    if (bloodType && bloodType !== 'all') {
      query += ` AND CONCAT(bg.group_name, bg.rh_factor) = ?`;
      params.push(bloodType);
    }

    if (status === 'expiring') {
      query += ` AND bs.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND bs.expiry_date >= CURDATE()`;
    } else if (status === 'expired') {
      query += ` AND bs.expiry_date < CURDATE()`;
    }

    query += ` ORDER BY bs.expiry_date ASC`;

    const [stock] = await db.query(query, params);

    res.json({ stock });
  } catch (error) {
    console.error('❌ Blood stock error:', error);
    res.status(500).json({ error: 'Failed to load blood stock' });
  }
}

/**
 * GET /api/dashboard/blood-bank/donors
 * Returns blood donors list
 */
export async function getBloodDonors(req, res) {
  try {
    const db = getTenantPool(req);
    const { search, bloodType } = req.query;

    let query = `
      SELECT 
        bd.id,
        bd.name,
        bd.phone,
        bd.email,
        bd.dob,
        bd.gender,
        CONCAT(bg.group_name, bg.rh_factor) AS blood_type,
        bd.last_donation_date,
        bd.notes,
        bd.created_at
      FROM blood_donors bd
      LEFT JOIN blood_groups bg ON bd.blood_group_id = bg.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (bd.name LIKE ? OR bd.phone LIKE ? OR bd.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (bloodType && bloodType !== 'all') {
      query += ` AND CONCAT(bg.group_name, bg.rh_factor) = ?`;
      params.push(bloodType);
    }

    query += ` ORDER BY bd.last_donation_date DESC`;

    const [donors] = await db.query(query, params);

    res.json({ donors });
  } catch (error) {
    console.error('❌ Blood donors error:', error);
    res.status(500).json({ error: 'Failed to load blood donors' });
  }
}
