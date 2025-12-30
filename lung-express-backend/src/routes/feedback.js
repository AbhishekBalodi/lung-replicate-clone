import { Router } from 'express';
import { getConnection } from '../lib/tenant-db.js';
import { requireTenant } from '../middleware/tenant-resolver.js';
const router = Router();
router.use(requireTenant);

async function ensureTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_user_id INT,
      subject VARCHAR(255),
      message TEXT,
      status ENUM('new','resolved') DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

router.get('/', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT * FROM feedback ORDER BY created_at DESC');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/feedback error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  } finally { conn.release(); }
});

router.post('/', async (req, res) => {
  const { patient_user_id = null, subject = '', message = '', status = 'new' } = req.body || {};
  if (!subject && !message) return res.status(400).json({ error: 'subject or message required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO feedback (patient_user_id, subject, message, status) VALUES (?, ?, ?, ?)', [patient_user_id, subject, message, status]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/feedback error:', err);
    res.status(500).json({ error: 'Failed to create feedback' });
  } finally { conn.release(); }
});

export default router;
