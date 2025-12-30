import { Router } from 'express';
import { getConnection } from '../lib/tenant-db.js';
import { requireTenant } from '../middleware/tenant-resolver.js';
const router = Router();
router.use(requireTenant);

async function ensureTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS pharmacy_medicines (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(255),
      sku VARCHAR(100),
      unit_type VARCHAR(50) DEFAULT 'tablet',
      unit_price DECIMAL(10,2) DEFAULT 0,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS pharmacy_inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      medicine_id INT NOT NULL,
      quantity DECIMAL(10,2) DEFAULT 0,
      batch_number VARCHAR(100),
      expiry_date DATE,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (medicine_id),
      FOREIGN KEY (medicine_id) REFERENCES pharmacy_medicines(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

/* Medicines catalog */
router.get('/medicines', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT * FROM pharmacy_medicines ORDER BY name');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/pharmacy/medicines error:', err);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  } finally { conn.release(); }
});

router.post('/medicines', async (req, res) => {
  const { name, brand = '', sku = '', unit_type = 'tablet', unit_price = 0, description = '' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO pharmacy_medicines (name, brand, sku, unit_type, unit_price, description) VALUES (?, ?, ?, ?, ?, ?)', [name, brand, sku, unit_type, unit_price, description]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/pharmacy/medicines error:', err);
    res.status(500).json({ error: 'Failed to add medicine' });
  } finally { conn.release(); }
});

/* Inventory */
router.get('/inventory', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT pi.*, pm.name FROM pharmacy_inventory pi JOIN pharmacy_medicines pm ON pm.id = pi.medicine_id ORDER BY pm.name');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/pharmacy/inventory error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  } finally { conn.release(); }
});

router.post('/inventory', async (req, res) => {
  const { medicine_id, quantity = 0, batch_number = '', expiry_date = null } = req.body || {};
  if (!medicine_id) return res.status(400).json({ error: 'medicine_id required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO pharmacy_inventory (medicine_id, quantity, batch_number, expiry_date) VALUES (?, ?, ?, ?)', [medicine_id, quantity, batch_number, expiry_date]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/pharmacy/inventory error:', err);
    // Detect MySQL FK error and return helpful message
    if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid medicine_id' });
    }
    res.status(500).json({ error: 'Failed to add inventory' });
  } finally { conn.release(); }
});

export default router;