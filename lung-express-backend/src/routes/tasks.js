import { Router } from 'express';
import { getConnection } from '../lib/tenant-db.js';
import { requireTenant } from '../middleware/tenant-resolver.js';
const router = Router();
router.use(requireTenant);

async function ensureTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS pending_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      due_date DATETIME,
      priority ENUM('low','medium','high') DEFAULT 'medium',
      status ENUM('pending','done','cancelled') DEFAULT 'pending',
      assigned_to_user_id INT,
      created_by_user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// List tasks
router.get('/', async (req, res) => {
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const [rows] = await conn.query('SELECT * FROM pending_tasks ORDER BY status, due_date IS NULL, due_date ASC, priority DESC, created_at DESC');
    res.json({ items: rows });
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  } finally { conn.release(); }
});

// Create task
router.post('/', async (req, res) => {
  const { title, description = '', due_date = null, priority = 'medium', assigned_to_user_id = null } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('INSERT INTO pending_tasks (title, description, due_date, priority, assigned_to_user_id, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?)', [title, description, due_date, priority, assigned_to_user_id, req.headers['x-user-id'] || null]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  } finally { conn.release(); }
});

// Update task (partial)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body || {};
  const allowed = ['title','description','due_date','priority','status','assigned_to_user_id'];
  const updates = Object.keys(fields).filter(k => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'no valid fields to update' });
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    const sets = updates.map(k => `${k} = ?`).join(', ');
    const values = updates.map(k => fields[k]);
    values.push(id);
    await conn.execute(`UPDATE pending_tasks SET ${sets} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  } finally { conn.release(); }
});

// Delete task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await getConnection(req);
  try {
    await ensureTables(conn);
    await conn.execute('DELETE FROM pending_tasks WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  } finally { conn.release(); }
});

export default router;
