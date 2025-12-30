import { Router } from 'express';
import { getConnection } from '../lib/tenant-db.js';
import { requireTenant } from '../middleware/tenant-resolver.js';
const router = Router();
router.use(requireTenant);

async function ensureTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS room_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price_per_day DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_number VARCHAR(50) NOT NULL,
      room_type_id INT,
      bed_count INT DEFAULT 1,
      status ENUM('vacant','occupied','maintenance') DEFAULT 'vacant',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (room_type_id),
      FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS room_allotments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id INT NOT NULL,
      patient_user_id INT,
      patient_name VARCHAR(255),
      doctor_id INT,
      from_date DATETIME NOT NULL,
      to_date DATETIME,
      status ENUM('active','completed','cancelled') DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (room_id), INDEX (patient_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

/* Room types */
router.get('/types', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT * FROM room_types ORDER BY name');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/rooms/types error:', err);
    res.status(500).json({ error: 'Failed to fetch room types' });
  } finally { conn.release(); }
});

router.post('/types', async (req, res) => {
  const { name, description = '', price_per_day = 0 } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO room_types (name, description, price_per_day) VALUES (?, ?, ?)', [name, description, price_per_day]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/rooms/types error:', err);
    res.status(500).json({ error: 'Failed to add room type' });
  } finally { conn.release(); }
});

/* Rooms */
router.get('/', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT r.*, rt.name as room_type_name FROM rooms r LEFT JOIN room_types rt ON rt.id = r.room_type_id ORDER BY r.room_number');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/rooms error:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  } finally { conn.release(); }
});

router.post('/', async (req, res) => {
  const { room_number, room_type_id = null, bed_count = 1, status = 'vacant', notes = '' } = req.body || {};
  if (!room_number) return res.status(400).json({ error: 'room_number required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO rooms (room_number, room_type_id, bed_count, status, notes) VALUES (?, ?, ?, ?, ?)', [room_number, room_type_id, bed_count, status, notes]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/rooms error:', err);
    res.status(500).json({ error: 'Failed to add room' });
  } finally { conn.release(); }
});

/* Room allotments */
router.get('/allotments', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT ra.*, r.room_number FROM room_allotments ra LEFT JOIN rooms r ON r.id = ra.room_id ORDER BY ra.created_at DESC');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/rooms/allotments error:', err);
    res.status(500).json({ error: 'Failed to fetch allotments' });
  } finally { conn.release(); }
});

router.post('/allotments', async (req, res) => {
  const { room_id, patient_user_id = null, patient_name = '', doctor_id = null, from_date, to_date = null, status = 'active', notes = '' } = req.body || {};
  if (!room_id || !from_date) return res.status(400).json({ error: 'room_id and from_date required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO room_allotments (room_id, patient_user_id, patient_name, doctor_id, from_date, to_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [room_id, patient_user_id, patient_name, doctor_id, from_date, to_date, status, notes]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/rooms/allotments error:', err);
    res.status(500).json({ error: 'Failed to create allotment' });
  } finally { conn.release(); }
});

export default router;