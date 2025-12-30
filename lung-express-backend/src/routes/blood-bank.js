import { Router } from "express";
import { getConnection } from "../lib/tenant-db.js";
import { requireTenant } from "../middleware/tenant-resolver.js";

const router = Router();
router.use(requireTenant);

async function ensureTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS blood_groups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      group_name VARCHAR(10) NOT NULL,
      rh_factor ENUM('+','-') DEFAULT '+',
      description VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS blood_stock (
      id INT AUTO_INCREMENT PRIMARY KEY,
      blood_group_id INT NOT NULL,
      units DECIMAL(10,2) DEFAULT 0,
      unit_type VARCHAR(20) DEFAULT 'ml',
      batch_number VARCHAR(100),
      expiry_date DATE,
      source ENUM('donation','purchase','other') DEFAULT 'donation',
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (blood_group_id),
      FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS blood_donors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(255),
      dob DATE,
      gender ENUM('male','female','other') DEFAULT 'male',
      blood_group_id INT,
      last_donation_date DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (blood_group_id),
      FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS blood_issued (
      id INT AUTO_INCREMENT PRIMARY KEY,
      blood_group_id INT,
      blood_stock_id INT,
      units DECIMAL(10,2) DEFAULT 0,
      unit_type VARCHAR(20) DEFAULT 'ml',
      issued_to_name VARCHAR(255),
      issued_to_contact VARCHAR(100),
      issued_by_user_id INT,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (blood_group_id),
      INDEX (blood_stock_id),
      FOREIGN KEY (blood_group_id) REFERENCES blood_groups(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

/* ----------------- Blood Groups ----------------- */
router.get('/groups', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT * FROM blood_groups ORDER BY group_name, rh_factor');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/blood-bank/groups error:', err);
    res.status(500).json({ error: 'Failed to fetch blood groups' });
  } finally {
    conn.release();
  }
});

router.post('/groups', async (req, res) => {
  const { group_name, rh_factor = '+', description = '' } = req.body || {};
  if (!group_name) return res.status(400).json({ error: 'group_name required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO blood_groups (group_name, rh_factor, description) VALUES (?, ?, ?)', [group_name, rh_factor, description]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/blood-bank/groups error:', err);
    res.status(500).json({ error: 'Failed to create blood group' });
  } finally { conn.release(); }
});

/* ----------------- Blood Stock ----------------- */
router.get('/stock', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT bs.*, bg.group_name, bg.rh_factor FROM blood_stock bs JOIN blood_groups bg ON bg.id = bs.blood_group_id ORDER BY bg.group_name');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/blood-bank/stock error:', err);
    res.status(500).json({ error: 'Failed to fetch blood stock' });
  } finally { conn.release(); }
});

router.post('/stock', async (req, res) => {
  const { blood_group_id, units = 0, unit_type = 'ml', batch_number = '', expiry_date = null, source = 'donation' } = req.body || {};
  if (!blood_group_id) return res.status(400).json({ error: 'blood_group_id required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO blood_stock (blood_group_id, units, unit_type, batch_number, expiry_date, source) VALUES (?, ?, ?, ?, ?, ?)', [blood_group_id, units, unit_type, batch_number, expiry_date, source]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/blood-bank/stock error:', err);
    res.status(500).json({ error: 'Failed to add stock' });
  } finally { conn.release(); }
});

/* ----------------- Donors ----------------- */
router.get('/donors', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT d.*, bg.group_name, bg.rh_factor FROM blood_donors d LEFT JOIN blood_groups bg ON bg.id = d.blood_group_id ORDER BY d.created_at DESC');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/blood-bank/donors error:', err);
    res.status(500).json({ error: 'Failed to fetch donors' });
  } finally { conn.release(); }
});

router.post('/donors', async (req, res) => {
  const { name, phone = '', email = '', dob = null, gender = 'male', blood_group_id = null, last_donation_date = null, notes = '' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO blood_donors (name, phone, email, dob, gender, blood_group_id, last_donation_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, phone, email, dob, gender, blood_group_id, last_donation_date, notes]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/blood-bank/donors error:', err);
    res.status(500).json({ error: 'Failed to add donor' });
  } finally { conn.release(); }
});

/* ----------------- Issued Records ----------------- */
router.get('/issued', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT bi.*, bg.group_name, bg.rh_factor FROM blood_issued bi LEFT JOIN blood_groups bg ON bg.id = bi.blood_group_id ORDER BY bi.created_at DESC');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/blood-bank/issued error:', err);
    res.status(500).json({ error: 'Failed to fetch issued records' });
  } finally { conn.release(); }
});

router.post('/issued', async (req, res) => {
  const { blood_group_id = null, blood_stock_id = null, units = 0, unit_type = 'ml', issued_to_name = '', issued_to_contact = '', issued_by_user_id = null, notes = '' } = req.body || {};
  if (!units) return res.status(400).json({ error: 'units required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO blood_issued (blood_group_id, blood_stock_id, units, unit_type, issued_to_name, issued_to_contact, issued_by_user_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [blood_group_id, blood_stock_id, units, unit_type, issued_to_name, issued_to_contact, issued_by_user_id, notes]);

    // Optionally decrement stock if a stock record is specified
    if (blood_stock_id) {
      await conn.execute('UPDATE blood_stock SET units = GREATEST(0, units - ?) WHERE id = ?', [units, blood_stock_id]);
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/blood-bank/issued error:', err);
    res.status(500).json({ error: 'Failed to record issued blood' });
  } finally { conn.release(); }
});

export default router;