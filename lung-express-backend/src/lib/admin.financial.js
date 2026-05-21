/**
 * Financial Management Backend Logic
 * Handles revenue analytics, billing summaries, and insurance claims
 */

import { getTenantPool } from './tenant-db.js';

async function ensureInsuranceClaimsTable(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS insurance_claims (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NULL,
      patient_name VARCHAR(255),
      insurance_provider VARCHAR(255),
      policy_number VARCHAR(100),
      claim_number VARCHAR(100) UNIQUE,
      claim_amount DECIMAL(12,2) DEFAULT 0,
      approved_amount DECIMAL(12,2) DEFAULT 0,
      claim_date DATE,
      submitted_date DATE,
      diagnosis TEXT,
      treatment TEXT,
      treatment_type VARCHAR(100),
      documents JSON,
      notes TEXT,
      remarks TEXT,
      status ENUM('pending','submitted','approved','rejected','partial','partially_approved') DEFAULT 'pending',
      rejection_reason TEXT,
      approved_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const addColumnIfMissing = async (columnName, ddl) => {
    const [exists] = await pool.execute(
      `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'insurance_claims' AND COLUMN_NAME = ? LIMIT 1`,
      [columnName]
    );
    if (!exists.length) {
      await pool.execute(`ALTER TABLE insurance_claims ADD COLUMN ${ddl}`);
    }
  };

  await addColumnIfMissing('treatment_type', 'treatment_type VARCHAR(100) NULL');
  await addColumnIfMissing('submitted_date', 'submitted_date DATE NULL');
  await addColumnIfMissing('remarks', 'remarks TEXT NULL');
};

// ============================================
// REVENUE ANALYTICS
// ============================================

export async function getRevenueOverview(req, res) {
  try {
    const pool = getTenantPool(req);
    const { period } = req.query; // 'day', 'week', 'month', 'year'
    
    let dateCondition = '';
    if (period === 'day') {
      dateCondition = 'DATE(created_at) = CURDATE()';
    } else if (period === 'week') {
      dateCondition = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateCondition = 'MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())';
    } else {
      dateCondition = 'YEAR(created_at) = YEAR(CURDATE())';
    }
    
    // Total revenue
    const [revenue] = await pool.execute(`
      SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid' AND ${dateCondition}
    `);
    
    // Outstanding
    const [outstanding] = await pool.execute(`
      SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status IN ('unpaid', 'partial') AND ${dateCondition}
    `);
    
    // Revenue by category
    const [byCategory] = await pool.execute(`
      SELECT ii.service_type as category, SUM(ii.line_total) as total
      FROM invoice_items ii
      JOIN invoices i ON i.id = ii.invoice_id
      WHERE i.status = 'paid' AND ${dateCondition.replace('created_at', 'i.created_at')}
      GROUP BY ii.service_type
    `);
    
    // Trend (last 6 months)
    const [trend] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(total) as revenue
      FROM invoices 
      WHERE status = 'paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);
    
    res.json({
      totalRevenue: revenue[0]?.total || 0,
      outstanding: outstanding[0]?.total || 0,
      byCategory,
      trend
    });
  } catch (err) {
    console.error('getRevenueOverview error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue overview' });
  }
}

export async function getRevenueTrend(req, res) {
  try {
    const pool = getTenantPool(req);
    const { from, to, groupBy } = req.query;
    
    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    } else if (groupBy === 'week') {
      dateFormat = '%Y-%u';
    }
    
    let query = `
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        COUNT(*) as invoice_count,
        SUM(total) as revenue,
        SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) as collected
      FROM invoices
    `;
    
    const conditions = [];
    const params = [];
    
    if (from) {
      conditions.push('DATE(created_at) >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('DATE(created_at) <= ?');
      params.push(to);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` GROUP BY DATE_FORMAT(created_at, '${dateFormat}') ORDER BY period`;
    
    const [rows] = await pool.execute(query, params);
    res.json({ trend: rows });
  } catch (err) {
    console.error('getRevenueTrend error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue trend' });
  }
}

// ============================================
// BILLING DASHBOARD
// ============================================

export async function getBillingDashboard(req, res) {
  try {
    const pool = getTenantPool(req);
    
    // Today's collection
    const [today] = await pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as collected FROM payments WHERE DATE(paid_at) = CURDATE()
    `);
    
    // This month's collection
    const [thisMonth] = await pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as collected FROM payments 
      WHERE MONTH(paid_at) = MONTH(CURDATE()) AND YEAR(paid_at) = YEAR(CURDATE())
    `);
    
    // Pending invoices
    const [pending] = await pool.execute(`
      SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as amount 
      FROM invoices WHERE status IN ('unpaid', 'partial')
    `);
    
    // Overdue invoices
    const [overdue] = await pool.execute(`
      SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as amount 
      FROM invoices WHERE status IN ('unpaid', 'partial') AND due_date < CURDATE()
    `);
    
    // Payment method breakdown
    const [byMethod] = await pool.execute(`
      SELECT pm.name as method, COUNT(p.id) as count, SUM(p.amount) as total
      FROM payments p
      LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
      WHERE MONTH(p.paid_at) = MONTH(CURDATE())
      GROUP BY pm.id
    `);
    
    res.json({
      todayCollection: today[0]?.collected || 0,
      monthCollection: thisMonth[0]?.collected || 0,
      pendingCount: pending[0]?.count || 0,
      pendingAmount: pending[0]?.amount || 0,
      overdueCount: overdue[0]?.count || 0,
      overdueAmount: overdue[0]?.amount || 0,
      paymentMethods: byMethod
    });
  } catch (err) {
    console.error('getBillingDashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch billing dashboard' });
  }
}

// ============================================
// INSURANCE CLAIMS
// ============================================

export async function getInsuranceClaims(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureInsuranceClaimsTable(pool);
    const { status, search, from, to } = req.query;
    
    let query = `
      SELECT ic.*, p.full_name as patient_name
      FROM insurance_claims ic
      LEFT JOIN patients p ON p.id = ic.patient_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (status && status !== 'all') {
      conditions.push('ic.status = ?');
      params.push(status);
    }
    
    if (search) {
      conditions.push('(p.full_name LIKE ? OR ic.claim_number LIKE ? OR ic.insurance_provider LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (from) {
      conditions.push('DATE(ic.created_at) >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('DATE(ic.created_at) <= ?');
      params.push(to);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY ic.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    const normalizedRows = rows.map((r) => ({
      ...r,
      submitted_date: r.submitted_date || r.claim_date || r.created_at,
      treatment_type: r.treatment_type || r.treatment || null,
      remarks: r.remarks || r.notes || null,
      status: r.status === 'partial' ? 'partially_approved' : r.status,
    }));
    res.json({ claims: normalizedRows });
  } catch (err) {
    console.error('getInsuranceClaims error:', err);
    res.status(500).json({ error: 'Failed to fetch insurance claims' });
  }
}

export async function getInsuranceClaimsSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureInsuranceClaimsTable(pool);
    
    const [total] = await pool.execute('SELECT COUNT(*) as count, COALESCE(SUM(claim_amount), 0) as amount FROM insurance_claims');
    const [pending] = await pool.execute("SELECT COUNT(*) as count, COALESCE(SUM(claim_amount), 0) as amount FROM insurance_claims WHERE status = 'pending'");
    const [approved] = await pool.execute("SELECT COUNT(*) as count, COALESCE(SUM(approved_amount), 0) as amount FROM insurance_claims WHERE status = 'approved'");
    const [rejected] = await pool.execute("SELECT COUNT(*) as count, COALESCE(SUM(claim_amount), 0) as amount FROM insurance_claims WHERE status = 'rejected'");
    
    res.json({
      total: { count: total[0]?.count || 0, amount: total[0]?.amount || 0 },
      pending: { count: pending[0]?.count || 0, amount: pending[0]?.amount || 0 },
      approved: { count: approved[0]?.count || 0, amount: approved[0]?.amount || 0 },
      rejected: { count: rejected[0]?.count || 0, amount: rejected[0]?.amount || 0 }
    });
  } catch (err) {
    console.error('getInsuranceClaimsSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch insurance claims summary' });
  }
}

export async function addInsuranceClaim(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureInsuranceClaimsTable(pool);
    const { 
      patient_id, patient_name, insurance_provider, policy_number,
      claim_number, claim_amount, claim_date, submitted_date, diagnosis, treatment,
      treatment_type, documents, notes, remarks
    } = req.body;
    
    // Generate claim number if not provided
    const [lastClaim] = await pool.execute('SELECT MAX(id) as max_id FROM insurance_claims');
    const nextId = (lastClaim[0]?.max_id || 0) + 1;
    const generatedClaimNumber = claim_number || `CLM-${String(nextId).padStart(5, '0')}`;
    
    const [result] = await pool.execute(
      `INSERT INTO insurance_claims 
       (patient_id, patient_name, insurance_provider, policy_number, claim_number, 
        claim_amount, claim_date, submitted_date, diagnosis, treatment, treatment_type, documents, notes, remarks, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [patient_id || null, patient_name, insurance_provider, policy_number, generatedClaimNumber,
       claim_amount, claim_date || new Date().toISOString().split('T')[0],
       submitted_date || new Date().toISOString().split('T')[0],
       diagnosis || null, treatment || null, treatment_type || treatment || null,
       JSON.stringify(documents || []), notes || null, remarks || notes || null]
    );
    
    res.json({ success: true, id: result.insertId, claim_number: generatedClaimNumber });
  } catch (err) {
    console.error('addInsuranceClaim error:', err);
    res.status(500).json({ error: 'Failed to add insurance claim' });
  }
}

export async function updateInsuranceClaimStatus(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureInsuranceClaimsTable(pool);
    const { id } = req.params;
    const { status, approved_amount, rejection_reason } = req.body;

    const normalizedStatus = status === 'partially_approved' ? 'partial' : status;
    
    let query = 'UPDATE insurance_claims SET status = ?';
    const params = [normalizedStatus];
    
    if (status === 'approved' && approved_amount !== undefined) {
      query += ', approved_amount = ?, approved_date = NOW()';
      params.push(approved_amount);
    }
    
    if (status === 'rejected' && rejection_reason) {
      query += ', rejection_reason = ?';
      params.push(rejection_reason);
    }
    
    query += ', updated_at = NOW() WHERE id = ?';
    params.push(id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (err) {
    console.error('updateInsuranceClaimStatus error:', err);
    res.status(500).json({ error: 'Failed to update insurance claim status' });
  }
}
