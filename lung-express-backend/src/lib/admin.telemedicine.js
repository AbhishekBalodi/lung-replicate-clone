/**
 * Telemedicine Backend Logic
 * Handles telemedicine sessions management
 */

import { getTenantPool } from './tenant-db.js';

// Get telemedicine sessions summary
export async function getTelemedicineSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    const { doctor_id } = req.query;

    let baseQuery = 'FROM telemedicine_sessions';
    const conditions = [];
    const params = [];

    if (doctor_id) {
      conditions.push('doctor_id = ?');
      params.push(doctor_id);
    }

    const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    const [[todayResult]] = await pool.execute(
      `SELECT COUNT(*) as count ${baseQuery} ${whereClause} ${conditions.length ? 'AND' : 'WHERE'} DATE(scheduled_time) = CURDATE() AND status IN ('scheduled', 'in-progress')`,
      params
    );

    const [[videoResult]] = await pool.execute(
      `SELECT COUNT(*) as count ${baseQuery} ${whereClause} ${conditions.length ? 'AND' : 'WHERE'} type = 'video' AND status = 'scheduled'`,
      params
    );

    const [[chatResult]] = await pool.execute(
      `SELECT COUNT(*) as count ${baseQuery} ${whereClause} ${conditions.length ? 'AND' : 'WHERE'} type = 'chat' AND status = 'scheduled'`,
      params
    );

    const [[completedResult]] = await pool.execute(
      `SELECT COUNT(*) as count ${baseQuery} ${whereClause} ${conditions.length ? 'AND' : 'WHERE'} status = 'completed'`,
      params
    );

    res.json({
      today: todayResult?.count || 0,
      video: videoResult?.count || 0,
      chat: chatResult?.count || 0,
      completed: completedResult?.count || 0,
    });
  } catch (err) {
    console.error('getTelemedicineSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch telemedicine summary' });
  }
}

// Get telemedicine sessions list
export async function getTelemedicineSessions(req, res) {
  try {
    const pool = getTenantPool(req);
    const { status, search, doctor_id } = req.query;

    let query = `
      SELECT ts.*, p.full_name as patient_name, p.phone, p.email
      FROM telemedicine_sessions ts
      LEFT JOIN patients p ON p.id = ts.patient_id
    `;

    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      if (status === 'upcoming') {
        conditions.push("ts.status IN ('scheduled', 'in-progress')");
      } else if (status === 'past') {
        conditions.push("ts.status IN ('completed', 'cancelled')");
      } else {
        conditions.push('ts.status = ?');
        params.push(status);
      }
    }

    if (search) {
      conditions.push('(p.full_name LIKE ? OR ts.notes LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (doctor_id) {
      conditions.push('ts.doctor_id = ?');
      params.push(doctor_id);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ts.scheduled_time DESC';

    const [rows] = await pool.execute(query, params);
    res.json({ sessions: rows });
  } catch (err) {
    console.error('getTelemedicineSessions error:', err);
    res.status(500).json({ error: 'Failed to fetch telemedicine sessions' });
  }
}

// Add new telemedicine session
export async function addTelemedicineSession(req, res) {
  try {
    const pool = getTenantPool(req);
    const { patient_id, patient_name, type, scheduled_time, duration, notes, doctor_id } = req.body;

    if (!patient_name || !type || !scheduled_time) {
      return res.status(400).json({ error: 'patient_name, type, and scheduled_time are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO telemedicine_sessions (patient_id, patient_name, type, scheduled_time, duration, notes, doctor_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [patient_id || null, patient_name, type, scheduled_time, duration || '30 min', notes || null, doctor_id || null]
    );

    const [rows] = await pool.execute(
      `SELECT ts.*, COALESCE(p.full_name, ts.patient_name) as patient_name
       FROM telemedicine_sessions ts
       LEFT JOIN patients p ON p.id = ts.patient_id
       WHERE ts.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, id: result.insertId, session: rows[0] || null });
  } catch (err) {
    console.error('addTelemedicineSession error:', err);
    res.status(500).json({ error: 'Failed to add telemedicine session' });
  }
}

// Update telemedicine session status
export async function updateTelemedicineSession(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { status, notes } = req.body;

    await pool.execute(
      `UPDATE telemedicine_sessions SET status = ?, notes = ?, updated_at = NOW() WHERE id = ?`,
      [status, notes, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('updateTelemedicineSession error:', err);
    res.status(500).json({ error: 'Failed to update telemedicine session' });
  }
}
