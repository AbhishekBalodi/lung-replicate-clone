/**
 * Invoices & Payments Backend Logic
 * Handles invoices, payments, and payment history
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// INVOICES
// ============================================

export async function getInvoicesSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [total] = await pool.execute('SELECT COUNT(*) as count, SUM(total) as amount FROM invoices');
    const [paid] = await pool.execute("SELECT COUNT(*) as count, SUM(total) as amount FROM invoices WHERE status = 'paid'");
    const [unpaid] = await pool.execute("SELECT COUNT(*) as count, SUM(total) as amount FROM invoices WHERE status = 'unpaid'");
    const [thisMonth] = await pool.execute(`
      SELECT COUNT(*) as count, SUM(total) as amount 
      FROM invoices 
      WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    `);
    
    res.json({
      totalInvoices: total[0]?.count || 0,
      totalAmount: total[0]?.amount || 0,
      paidCount: paid[0]?.count || 0,
      paidAmount: paid[0]?.amount || 0,
      unpaidCount: unpaid[0]?.count || 0,
      unpaidAmount: unpaid[0]?.amount || 0,
      thisMonthCount: thisMonth[0]?.count || 0,
      thisMonthAmount: thisMonth[0]?.amount || 0
    });
  } catch (err) {
    console.error('getInvoicesSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices summary' });
  }
}

export async function getInvoicesList(req, res) {
  try {
    const pool = getTenantPool(req);
    const { status, q } = req.query;
    
    let query = 'SELECT * FROM invoices';
    const conditions = [];
    const params = [];
    
    if (status && status !== 'ALL') {
      conditions.push('UPPER(status) = ?');
      params.push(status.toUpperCase());
    }
    
    if (q) {
      conditions.push('(invoice_number LIKE ? OR patient_name LIKE ? OR patient_email LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('getInvoicesList error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}

export async function getInvoiceById(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    
    const [invoices] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [id]);
    
    if (!invoices.length) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const [items] = await pool.execute('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
    const [payments] = await pool.execute(`
      SELECT p.*, pm.name as payment_method_name
      FROM payments p
      LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
      WHERE p.invoice_id = ?
      ORDER BY p.paid_at DESC
    `, [id]);
    
    res.json({ invoice: invoices[0], items, payments });
  } catch (err) {
    console.error('getInvoiceById error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
}

export async function createInvoice(req, res) {
  try {
    const pool = getTenantPool(req);
    const { patient_id, patient_name, patient_email, patient_phone, items, tax, discount, notes, due_date } = req.body;
    
    // Generate invoice number
    const [lastInvoice] = await pool.execute('SELECT MAX(id) as max_id FROM invoices');
    const nextId = (lastInvoice[0]?.max_id || 0) + 1;
    const invoice_number = `INV-${String(nextId).padStart(5, '0')}`;
    
    // Calculate totals
    const sub_total = items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
    const total = sub_total + (tax || 0) - (discount || 0);
    
    const [result] = await pool.execute(
      `INSERT INTO invoices (invoice_number, patient_id, patient_name, patient_email, patient_phone, sub_total, tax, discount, total, notes, due_date, status, issued_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', CURDATE())`,
      [invoice_number, patient_id || null, patient_name, patient_email || null, patient_phone || null, sub_total, tax || 0, discount || 0, total, notes || null, due_date || null]
    );
    
    const invoiceId = result.insertId;
    
    // Insert items
    if (items && items.length) {
      for (const item of items) {
        const line_total = item.quantity * item.unit_price;
        await pool.execute(
          `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total, service_type)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invoiceId, item.description, item.quantity, item.unit_price, line_total, item.service_type || null]
        );
      }
    }
    
    res.json({ success: true, id: invoiceId, invoice_number });
  } catch (err) {
    console.error('createInvoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
}

export async function updateInvoiceStatus(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.execute('UPDATE invoices SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('updateInvoiceStatus error:', err);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
}

// ============================================
// PAYMENTS
// ============================================

export async function getPaymentsHistory(req, res) {
  try {
    const pool = getTenantPool(req);
    const { from, to } = req.query;
    
    let query = `
      SELECT p.*, i.invoice_number, i.patient_name, pm.name as payment_method_name
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
      LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (from) {
      conditions.push('DATE(p.paid_at) >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push('DATE(p.paid_at) <= ?');
      params.push(to);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.paid_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json({ payments: rows });
  } catch (err) {
    console.error('getPaymentsHistory error:', err);
    res.status(500).json({ error: 'Failed to fetch payments history' });
  }
}

export async function addPayment(req, res) {
  try {
    const pool = getTenantPool(req);
    const { invoice_id, amount, payment_method_id, transaction_reference, notes } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO payments (invoice_id, amount, payment_method_id, transaction_reference, notes, paid_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [invoice_id, amount, payment_method_id || null, transaction_reference || null, notes || null]
    );
    
    // Check if invoice is fully paid
    const [invoice] = await pool.execute('SELECT total FROM invoices WHERE id = ?', [invoice_id]);
    const [paidTotal] = await pool.execute('SELECT SUM(amount) as paid FROM payments WHERE invoice_id = ?', [invoice_id]);
    
    if (paidTotal[0]?.paid >= invoice[0]?.total) {
      await pool.execute("UPDATE invoices SET status = 'paid' WHERE id = ?", [invoice_id]);
    } else if (paidTotal[0]?.paid > 0) {
      await pool.execute("UPDATE invoices SET status = 'partial' WHERE id = ?", [invoice_id]);
    }
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addPayment error:', err);
    res.status(500).json({ error: 'Failed to add payment' });
  }
}

export async function getPaymentMethods(req, res) {
  try {
    const pool = getTenantPool(req);
    const [rows] = await pool.execute('SELECT * FROM payment_methods WHERE is_active = TRUE');
    res.json({ methods: rows });
  } catch (err) {
    console.error('getPaymentMethods error:', err);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
}
