/**
 * Telemedicine Backend Logic
 * Handles telemedicine sessions management
 */

import { getTenantPool } from './tenant-db.js';

// Helper to check schema columns
async function getTelemedicineColumnInfo(pool) {
  const [columns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'telemedicine_sessions'
  `).catch(() => [[]]);
  const colSet = new Set((columns || []).map((c) => c.COLUMN_NAME));
  return {
    hasSessionType: colSet.has('session_type'),
    hasScheduledDate: colSet.has('scheduled_date'),
    hasScheduledTime: colSet.has('scheduled_time'),
    hasType: colSet.has('type'),
  };
}

// Get telemedicine sessions summary
export async function getTelemedicineSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    const { doctor_id } = req.query;
    
    const colInfo = await getTelemedicineColumnInfo(pool);
    const typeCol = colInfo.hasSessionType ? 'session_type' : (colInfo.hasType ? 'type' : null);
    const dateCol = colInfo.hasScheduledDate ? 'scheduled_date' : 'DATE(scheduled_time)';

    let baseQuery = 'FROM telemedicine_sessions';
    const conditions = [];
    const params = [];

    if (doctor_id) {
      conditions.push('doctor_id = ?');
      params.push(doctor_id);
    }

    const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    const [[todayResult]] = await pool.execute(
      `SELECT COUNT(*) as count ${baseQuery} ${whereClause} ${conditions.length ? 'AND' : 'WHERE'} ${dateCol} = CURDATE() AND status IN ('scheduled', 'in-progress')`,
      params
    );

    let videoCount = 0;
    let chatCount = 0;
    
    if (typeCol) {
      const [[videoResult]] = await pool.execute(
        `SELECT COUNT(*) as count ${baseQuery} ${whereClause} ${conditions.length ? 'AND' : 'WHERE'} ${typeCol} = 'video' AND status = 'scheduled'`,
        params
      );
      videoCount = videoResult?.count || 0;

      const [[chatResult]] = await pool.execute(
        `SELECT COUNT(*) as count ${baseQuery} ${whereClause} ${conditions.length ? 'AND' : 'WHERE'} ${typeCol} = 'chat' AND status = 'scheduled'`,
        params
      );
      chatCount = chatResult?.count || 0;
    }

    const [[completedResult]] = await pool.execute(
      `SELECT COUNT(*) as count ${baseQuery} ${whereClause} ${conditions.length ? 'AND' : 'WHERE'} status = 'completed'`,
      params
    );

    res.json({
      today: todayResult?.count || 0,
      video: videoCount,
      chat: chatCount,
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

    const colInfo = await getTelemedicineColumnInfo(pool);
    const typeCol = colInfo.hasSessionType ? 'ts.session_type' : (colInfo.hasType ? 'ts.type' : 'NULL');

    let query = `
      SELECT 
        ts.id,
        ts.patient_id,
        ts.patient_name,
        ts.doctor_id,
        ${typeCol} AS session_type,
        ${colInfo.hasScheduledDate ? 'ts.scheduled_date' : 'DATE(ts.scheduled_time)'} AS scheduled_date,
        ${colInfo.hasScheduledTime ? 'ts.scheduled_time' : 'TIME(ts.scheduled_time)'} AS scheduled_time,
        ts.duration,
        ts.status,
        ts.meeting_link,
        ts.notes,
        ts.created_at,
        ts.updated_at,
        COALESCE(p.full_name, ts.patient_name) as patient_display_name, 
        p.phone, 
        p.email
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
      conditions.push('(p.full_name LIKE ? OR ts.notes LIKE ? OR ts.patient_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (doctor_id) {
      conditions.push('ts.doctor_id = ?');
      params.push(doctor_id);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const orderCol = colInfo.hasScheduledDate ? 'ts.scheduled_date DESC, ts.scheduled_time DESC' : 'ts.scheduled_time DESC';
    query += ' ORDER BY ' + orderCol;

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
    const { patient_id, patient_name, type, session_type, scheduled_time, scheduled_date, scheduled_time_only, duration, notes, doctor_id } = req.body;

    const sessionTypeValue = session_type || type || 'video';

    // Determine if we have scheduled_date/scheduled_time columns or just scheduled_time
    const colInfo = await getTelemedicineColumnInfo(pool);
    
    // Build insert based on schema
    if (colInfo.hasScheduledDate && colInfo.hasScheduledTime) {
      // New schema with separate date and time columns
      let dateVal = scheduled_date;
      let timeVal = scheduled_time_only || scheduled_time;
      
      // If scheduled_time is a datetime string, parse it
      if (!dateVal && scheduled_time && scheduled_time.includes('T')) {
        const dt = new Date(scheduled_time);
        dateVal = dt.toISOString().split('T')[0];
        timeVal = dt.toTimeString().slice(0, 5);
      }

      if (!patient_name || !dateVal) {
        return res.status(400).json({ error: 'patient_name and scheduled_date are required' });
      }

      const typeCol = colInfo.hasSessionType ? 'session_type' : '';
      const typeParams = colInfo.hasSessionType ? [sessionTypeValue] : [];

      const [result] = await pool.execute(
        colInfo.hasSessionType
          ? `INSERT INTO telemedicine_sessions (patient_id, patient_name, session_type, scheduled_date, scheduled_time, duration, notes, doctor_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`
          : `INSERT INTO telemedicine_sessions (patient_id, patient_name, scheduled_date, scheduled_time, duration, notes, doctor_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
        colInfo.hasSessionType
          ? [patient_id || null, patient_name, sessionTypeValue, dateVal, timeVal || '09:00', duration || '30 min', notes || null, doctor_id || null]
          : [patient_id || null, patient_name, dateVal, timeVal || '09:00', duration || '30 min', notes || null, doctor_id || null]
      );

      const [rows] = await pool.execute(
        `SELECT ts.*, COALESCE(p.full_name, ts.patient_name) as patient_name
         FROM telemedicine_sessions ts
         LEFT JOIN patients p ON p.id = ts.patient_id
         WHERE ts.id = ?`,
        [result.insertId]
      );

      return res.status(201).json({ success: true, id: result.insertId, session: rows[0] || null });
    } else {
      // Legacy schema with single scheduled_time datetime column
      if (!patient_name || !scheduled_time) {
        return res.status(400).json({ error: 'patient_name and scheduled_time are required' });
      }

      const typeCol = colInfo.hasType ? 'type' : '';
      
      const [result] = await pool.execute(
        colInfo.hasType
          ? `INSERT INTO telemedicine_sessions (patient_id, patient_name, type, scheduled_time, duration, notes, doctor_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`
          : `INSERT INTO telemedicine_sessions (patient_id, patient_name, scheduled_time, duration, notes, doctor_id, status)
             VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
        colInfo.hasType
          ? [patient_id || null, patient_name, sessionTypeValue, scheduled_time, duration || '30 min', notes || null, doctor_id || null]
          : [patient_id || null, patient_name, scheduled_time, duration || '30 min', notes || null, doctor_id || null]
      );

      const [rows] = await pool.execute(
        `SELECT ts.*, COALESCE(p.full_name, ts.patient_name) as patient_name
         FROM telemedicine_sessions ts
         LEFT JOIN patients p ON p.id = ts.patient_id
         WHERE ts.id = ?`,
        [result.insertId]
      );

      return res.status(201).json({ success: true, id: result.insertId, session: rows[0] || null });
    }
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
    const { status, notes, meeting_link } = req.body;

    const updates = [];
    const params = [];
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (meeting_link !== undefined) {
      updates.push('meeting_link = ?');
      params.push(meeting_link);
    }
    
    updates.push('updated_at = NOW()');
    params.push(id);

    await pool.execute(
      `UPDATE telemedicine_sessions SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true });
  } catch (err) {
    console.error('updateTelemedicineSession error:', err);
    res.status(500).json({ error: 'Failed to update telemedicine session' });
  }
}

// Get telemedicine chat messages for a session
export async function getTelemedicineChat(req, res) {
  try {
    const pool = getTenantPool(req);
    const { sessionId } = req.params;

    // Check if telemedicine_messages table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'telemedicine_messages'
    `).catch(() => [[]]);

    if (!tables || tables.length === 0) {
      return res.json({ messages: [] });
    }

    const [messages] = await pool.execute(`
      SELECT 
        id,
        sender_type,
        message,
        is_read,
        created_at as timestamp
      FROM telemedicine_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `, [sessionId]);

    res.json({ messages });
  } catch (err) {
    console.error('getTelemedicineChat error:', err);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
}

// Send telemedicine chat message
export async function sendTelemedicineMessage(req, res) {
  try {
    const pool = getTenantPool(req);
    const { sessionId } = req.params;
    const { sender_type, sender_id, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if telemedicine_messages table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'telemedicine_messages'
    `).catch(() => [[]]);

    if (!tables || tables.length === 0) {
      return res.status(400).json({ error: 'Chat not available for this tenant' });
    }

    const [result] = await pool.execute(`
      INSERT INTO telemedicine_messages (session_id, sender_type, sender_id, message)
      VALUES (?, ?, ?, ?)
    `, [sessionId, sender_type || 'patient', sender_id || null, message]);

    res.json({ 
      success: true, 
      messageId: result.insertId,
      message: {
        id: result.insertId,
        sender_type: sender_type || 'patient',
        message,
        is_read: false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('sendTelemedicineMessage error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
}
