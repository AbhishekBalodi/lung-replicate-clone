/**
 * Tasks & Notifications Backend Logic
 * Handles tasks and notifications management
 */

import { getTenantPool } from './tenant-db.js';

// Get tasks summary
export async function getTasksSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    const { doctor_id } = req.query;

    let baseCondition = '';
    const params = [];

    if (doctor_id) {
      baseCondition = ' WHERE doctor_id = ?';
      params.push(doctor_id);
    }

    const [[totalResult]] = await pool.execute(`SELECT COUNT(*) as count FROM tasks${baseCondition}`, params);
    const [[pendingResult]] = await pool.execute(`SELECT COUNT(*) as count FROM tasks${baseCondition ? baseCondition + ' AND' : ' WHERE'} status = 'pending'`, params);
    const [[highPriorityResult]] = await pool.execute(`SELECT COUNT(*) as count FROM tasks${baseCondition ? baseCondition + ' AND' : ' WHERE'} priority = 'high' AND status = 'pending'`, params);

    res.json({
      total: totalResult?.count || 0,
      pending: pendingResult?.count || 0,
      highPriority: highPriorityResult?.count || 0,
    });
  } catch (err) {
    console.error('getTasksSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks summary' });
  }
}

// Get tasks list
export async function getTasksList(req, res) {
  try {
    const pool = getTenantPool(req);
    const { status, search, doctor_id } = req.query;

    let query = `
      SELECT t.*, p.full_name as patient_name
      FROM tasks t
      LEFT JOIN patients p ON p.id = t.patient_id
    `;

    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push('t.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(t.title LIKE ? OR t.description LIKE ? OR p.full_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (doctor_id) {
      conditions.push('t.doctor_id = ?');
      params.push(doctor_id);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY FIELD(t.priority, "high", "medium", "low"), t.due_date ASC';

    const [rows] = await pool.execute(query, params);
    res.json({ tasks: rows });
  } catch (err) {
    console.error('getTasksList error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

// Add task
export async function addTask(req, res) {
  try {
    const pool = getTenantPool(req);
    const { type, title, description, patient_id, due_date, priority, doctor_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO tasks (type, title, description, patient_id, due_date, priority, doctor_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [type || 'general', title, description || null, patient_id || null, due_date || null, priority || 'medium', doctor_id || null]
    );

    const [rows] = await pool.execute(
      `SELECT t.*, COALESCE(p.full_name, '') as patient_name
       FROM tasks t
       LEFT JOIN patients p ON p.id = t.patient_id
       WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, id: result.insertId, task: rows[0] || null });
  } catch (err) {
    console.error('addTask error:', err);
    res.status(500).json({ error: 'Failed to add task' });
  }
}

// Complete task
export async function completeTask(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;

    await pool.execute("UPDATE tasks SET status = 'completed', completed_at = NOW() WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('completeTask error:', err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
}

// Delete task
export async function deleteTask(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;

    await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}

// Get notifications summary
export async function getNotificationsSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    const { user_id } = req.query;

    let baseCondition = '';
    const params = [];

    if (user_id) {
      baseCondition = ' WHERE user_id = ?';
      params.push(user_id);
    }

    const [[totalResult]] = await pool.execute(`SELECT COUNT(*) as count FROM notifications${baseCondition}`, params);
    const [[unreadResult]] = await pool.execute(`SELECT COUNT(*) as count FROM notifications${baseCondition ? baseCondition + ' AND' : ' WHERE'} is_read = FALSE`, params);

    res.json({
      total: totalResult?.count || 0,
      unread: unreadResult?.count || 0,
    });
  } catch (err) {
    console.error('getNotificationsSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications summary' });
  }
}

// Get notifications list
export async function getNotificationsList(req, res) {
  try {
    const pool = getTenantPool(req);
    const { user_id } = req.query;

    let query = 'SELECT * FROM notifications';
    const params = [];

    if (user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const [rows] = await pool.execute(query, params);
    res.json({ notifications: rows });
  } catch (err) {
    console.error('getNotificationsList error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

// Mark notification as read
export async function markNotificationRead(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;

    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('markNotificationRead error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead(req, res) {
  try {
    const pool = getTenantPool(req);
    const { user_id } = req.body;

    let query = 'UPDATE notifications SET is_read = TRUE';
    const params = [];

    if (user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    }

    await pool.execute(query, params);
    res.json({ success: true });
  } catch (err) {
    console.error('markAllNotificationsRead error:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}

// Dismiss notification
export async function dismissNotification(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;

    await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('dismissNotification error:', err);
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
}
