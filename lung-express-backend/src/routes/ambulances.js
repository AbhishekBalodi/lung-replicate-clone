import { Router } from 'express';
import { getConnection, getPool } from '../lib/tenant-db.js';
import { requireTenant } from '../middleware/tenant-resolver.js';
const router = Router();
router.use(requireTenant);

async function ensureTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS ambulances (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vehicle_number VARCHAR(50) NOT NULL,
      model VARCHAR(255),
      driver_name VARCHAR(255),
      driver_contact VARCHAR(20),
      status ENUM('available','on-trip','maintenance','offline') DEFAULT 'available',
      current_location VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

router.get('/', async (req, res) => {
  try {
    const conn = await getConnection(req);
    try {
      await ensureTables(conn);
      const [rows] = await conn.query('SELECT * FROM ambulances ORDER BY id DESC');
      res.json({ items: rows });
    } finally { conn.release(); }
  } catch (err) {
    console.error('GET /api/ambulances error:', err);
    res.status(500).json({ error: 'Failed to fetch ambulances' });
  }
});

router.post('/', async (req, res) => {
  const { vehicle_number, model = '', driver_name = '', driver_contact = '', status = 'available', current_location = '', notes = '' } = req.body || {};
  if (!vehicle_number) return res.status(400).json({ error: 'vehicle_number required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO ambulances (vehicle_number, model, driver_name, driver_contact, status, current_location, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [vehicle_number, model, driver_name, driver_contact, status, current_location, notes]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/ambulances error:', err);
    res.status(500).json({ error: 'Failed to add ambulance' });
  } finally { conn.release(); }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body || {};
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const sets = [];
    const vals = [];
    for (const k in fields) {
      sets.push(`${k} = ?`);
      vals.push(fields[k]);
    }
    if (!sets.length) return res.status(400).json({ error: 'no fields to update' });
    vals.push(id);
    await conn.execute(`UPDATE ambulances SET ${sets.join(', ')} WHERE id = ?`, vals);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/ambulances/:id error:', err);
    res.status(500).json({ error: 'Failed to update ambulance' });
  } finally { conn.release(); }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('DELETE FROM ambulances WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/ambulances/:id error:', err);
    res.status(500).json({ error: 'Failed to delete ambulance' });
  } finally { conn.release(); }
});

export default router;