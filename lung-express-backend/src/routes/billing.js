import { Router } from 'express';
import { getConnection } from '../lib/tenant-db.js';
import { requireTenant } from '../middleware/tenant-resolver.js';
const router = Router();
router.use(requireTenant);

async function ensureTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_number VARCHAR(100) NOT NULL UNIQUE,
      patient_id INT NULL,
      patient_name VARCHAR(255),
      patient_email VARCHAR(255),
      patient_phone VARCHAR(20),
      created_by_user_id INT,
      status ENUM('draft','unpaid','paid','cancelled') DEFAULT 'draft',
      sub_total DECIMAL(12,2) DEFAULT 0,
      tax DECIMAL(12,2) DEFAULT 0,
      discount DECIMAL(12,2) DEFAULT 0,
      total DECIMAL(12,2) DEFAULT 0,
      issued_date DATE DEFAULT CURRENT_DATE,
      due_date DATE NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      description VARCHAR(512) NOT NULL,
      quantity DECIMAL(10,2) DEFAULT 1,
      unit_price DECIMAL(12,2) DEFAULT 0,
      line_total DECIMAL(12,2) DEFAULT 0,
      service_type VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      payment_method_id INT,
      transaction_reference VARCHAR(255),
      paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by_user_id INT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // seed minimal methods
  await conn.query(`INSERT INTO payment_methods (name, code)
    SELECT 'Cash','cash' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE code = 'cash')`);
  await conn.query(`INSERT INTO payment_methods (name, code)
    SELECT 'Card','card' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE code = 'card')`);
}

// List invoices
router.get('/invoices', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT * FROM invoices ORDER BY issued_date DESC, created_at DESC');
    res.json({ invoices: rows });
  } catch (err) {
    console.error('GET /api/billing/invoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  } finally { conn.release(); }
});

// Create invoice
router.post('/invoices', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const { invoice_number, patient_id = null, patient_name, patient_email, patient_phone, items = [], issued_date = null, due_date = null, notes = '' } = req.body || {};
    if (!invoice_number) return res.status(400).json({ error: 'invoice_number required' });

    // compute totals
    let sub_total = 0;
    for (const it of items) {
      const qty = parseFloat(it.quantity) || 1;
      const price = parseFloat(it.unit_price) || 0;
      const line = qty * price;
      sub_total += line;
    }
    const tax = 0; const discount = 0; // extend later
    const total = sub_total + tax - discount;

    const [result] = await conn.execute('INSERT INTO invoices (invoice_number, patient_id, patient_name, patient_email, patient_phone, created_by_user_id, status, sub_total, tax, discount, total, issued_date, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [invoice_number, patient_id, patient_name, patient_email, patient_phone, req.headers['x-user-id'] || null, 'unpaid', sub_total, tax, discount, total, issued_date, due_date, notes]);
    const invoiceId = result.insertId;

    for (const it of items) {
      const qty = parseFloat(it.quantity) || 1; const price = parseFloat(it.unit_price) || 0; const line = qty * price;
      await conn.execute('INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total, service_type) VALUES (?, ?, ?, ?, ?, ?)', [invoiceId, it.description, qty, price, line, it.service_type || null]);
    }

    res.status(201).json({ success: true, id: invoiceId });
  } catch (err) {
    console.error('POST /api/billing/invoices error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  } finally { conn.release(); }
});

// Get invoice detail
router.get('/invoices/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [invoices] = await conn.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (invoices.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    const invoice = invoices[0];
    const [items] = await conn.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
    const [payments] = await conn.query('SELECT p.*, pm.name as payment_method FROM payments p LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id WHERE p.invoice_id = ?', [id]);
    res.json({ invoice, items, payments });
  } catch (err) {
    console.error('GET /api/billing/invoices/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  } finally { conn.release(); }
});

// Record payment
router.post('/payments', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const { invoice_id, amount, payment_method_id = null, transaction_reference = '', notes = '' } = req.body || {};
    if (!invoice_id || !amount) return res.status(400).json({ error: 'invoice_id and amount required' });

    const [invRows] = await conn.query('SELECT * FROM invoices WHERE id = ?', [invoice_id]);
    if (invRows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    const invoice = invRows[0];

    await conn.execute('INSERT INTO payments (invoice_id, amount, payment_method_id, transaction_reference, created_by_user_id, notes) VALUES (?, ?, ?, ?, ?, ?)', [invoice_id, amount, payment_method_id, transaction_reference, req.headers['x-user-id'] || null, notes]);

    // update invoice status if fully paid
    const [paidRows] = await conn.query('SELECT SUM(amount) as paid_total FROM payments WHERE invoice_id = ?', [invoice_id]);
    const paid_total = paidRows[0].paid_total || 0;
    if (parseFloat(paid_total) >= parseFloat(invoice.total)) {
      await conn.execute('UPDATE invoices SET status = ? WHERE id = ?', ['paid', invoice_id]);
    } else {
      await conn.execute('UPDATE invoices SET status = ? WHERE id = ?', ['unpaid', invoice_id]);
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/billing/payments error:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  } finally { conn.release(); }
});

// List payments
router.get('/payments', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT p.*, pm.name as payment_method FROM payments p LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id ORDER BY paid_at DESC');
    res.json({ payments: rows });
  } catch (err) {
    console.error('GET /api/billing/payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  } finally { conn.release(); }
});

export default router;
