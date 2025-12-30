import { Router } from 'express';
import { getConnection } from '../lib/tenant-db.js';
import { requireTenant } from '../middleware/tenant-resolver.js';
const router = Router();
router.use(requireTenant);

async function ensureTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      resource_type ENUM('doctor','hospital','service') NOT NULL,
      resource_id INT NOT NULL,
      patient_user_id INT,
      rating TINYINT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

router.get('/', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  } finally { conn.release(); }
});

router.post('/', async (req, res) => {
  const { resource_type, resource_id, patient_user_id = null, rating = 5, comment = '' } = req.body || {};
  if (!resource_type || !resource_id || !rating) return res.status(400).json({ error: 'resource_type, resource_id and rating required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO reviews (resource_type, resource_id, patient_user_id, rating, comment) VALUES (?, ?, ?, ?, ?)', [resource_type, resource_id, patient_user_id, rating, comment]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    res.status(500).json({ error: 'Failed to create review' });
  } finally { conn.release(); }
});

export default router;