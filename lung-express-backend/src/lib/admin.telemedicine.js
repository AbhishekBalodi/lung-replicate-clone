/**
 * Telemedicine Backend Logic
 * Handles telemedicine sessions management
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// ENSURE TABLE EXISTS + MISSING COLUMNS
// ============================================
async function ensureTelemedicineTables(pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telemedicine_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        patient_name VARCHAR(255),
        doctor_id INT,
        appointment_id INT,
        session_type VARCHAR(20) DEFAULT 'video',
        scheduled_date DATE,
        scheduled_time TIME,
        duration VARCHAR(20) DEFAULT '30 min',
        status VARCHAR(20) DEFAULT 'scheduled',
        meeting_link VARCHAR(500),
        recording_url VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telemedicine_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        sender_type VARCHAR(20) DEFAULT 'patient',
        sender_id INT,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tele_messages_session (session_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Ensure missing columns on existing tables
    const colInfo = await _getRawColumnSet(pool);
    const alters = [];
    if (!colInfo.has('meeting_link')) alters.push('ADD COLUMN meeting_link VARCHAR(500) DEFAULT NULL');
    if (!colInfo.has('patient_name')) alters.push("ADD COLUMN patient_name VARCHAR(255) DEFAULT NULL");
    if (!colInfo.has('session_type')) alters.push("ADD COLUMN session_type VARCHAR(20) DEFAULT 'video'");
    if (!colInfo.has('scheduled_date')) alters.push('ADD COLUMN scheduled_date DATE DEFAULT NULL');
    if (!colInfo.has('appointment_id')) alters.push('ADD COLUMN appointment_id INT DEFAULT NULL');
    if (!colInfo.has('recording_url')) alters.push('ADD COLUMN recording_url VARCHAR(500) DEFAULT NULL');
    if (!colInfo.has('doctor_id')) alters.push('ADD COLUMN doctor_id INT DEFAULT NULL');

    if (alters.length) {
      await pool.query(`ALTER TABLE telemedicine_sessions ${alters.join(', ')}`);
    }
  } catch (e) {
    console.warn('ensureTelemedicineTables warning:', e.message);
  }
}

// Raw column set helper
async function _getRawColumnSet(pool) {
  try {
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'telemedicine_sessions'
    `);
    return new Set((columns || []).map(c => c.COLUMN_NAME));
  } catch {
    return new Set();
  }
}

// Helper to check schema columns
async function getTelemedicineColumnInfo(pool) {
  const colSet = await _getRawColumnSet(pool);
  return {
    hasSessionType: colSet.has('session_type'),
    hasScheduledDate: colSet.has('scheduled_date'),
    hasScheduledTime: colSet.has('scheduled_time'),
    hasType: colSet.has('type'),
    hasMeetingLink: colSet.has('meeting_link'),
    hasPatientName: colSet.has('patient_name'),
    hasAppointmentId: colSet.has('appointment_id'),
    hasRecordingUrl: colSet.has('recording_url'),
    hasDoctorId: colSet.has('doctor_id'),
  };
}

// Get telemedicine sessions summary
export async function getTelemedicineSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureTelemedicineTables(pool);
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
    await ensureTelemedicineTables(pool);
    const { status, search, doctor_id } = req.query;

    const colInfo = await getTelemedicineColumnInfo(pool);
    const typeCol = colInfo.hasSessionType ? 'ts.session_type' : (colInfo.hasType ? 'ts.type' : "'video'");

    let query = `
      SELECT 
        ts.id,
        ts.patient_id,
        ${colInfo.hasPatientName ? 'ts.patient_name' : "NULL AS patient_name"},
        ${colInfo.hasDoctorId ? 'ts.doctor_id' : 'NULL AS doctor_id'},
        ${colInfo.hasAppointmentId ? 'ts.appointment_id' : 'NULL AS appointment_id'},
        ${typeCol} AS session_type,
        ${colInfo.hasScheduledDate ? 'ts.scheduled_date' : 'DATE(ts.scheduled_time)'} AS scheduled_date,
        ${colInfo.hasScheduledTime ? 'ts.scheduled_time' : 'TIME(ts.scheduled_time)'} AS scheduled_time,
        ts.duration,
        ts.status,
        ${colInfo.hasMeetingLink ? 'ts.meeting_link' : 'NULL AS meeting_link'},
        ${colInfo.hasRecordingUrl ? 'ts.recording_url' : 'NULL AS recording_url'},
        ts.notes,
        ts.created_at,
        ts.updated_at,
        COALESCE(p.full_name, ${colInfo.hasPatientName ? 'ts.patient_name' : "NULL"}) as patient_display_name, 
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
      const searchCondition = colInfo.hasPatientName
        ? '(p.full_name LIKE ? OR ts.notes LIKE ? OR ts.patient_name LIKE ?)'
        : '(p.full_name LIKE ? OR ts.notes LIKE ?)';
      conditions.push(searchCondition);
      params.push(`%${search}%`, `%${search}%`);
      if (colInfo.hasPatientName) params.push(`%${search}%`);
    }

    if (doctor_id && colInfo.hasDoctorId) {
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
    await ensureTelemedicineTables(pool);
    const { patient_id, patient_name, type, session_type, scheduled_time, scheduled_date, scheduled_time_only, duration, notes, doctor_id, appointment_id } = req.body;

    const sessionTypeValue = session_type || type || 'video';
    const colInfo = await getTelemedicineColumnInfo(pool);
    
    // Build columns and values dynamically
    const cols = [];
    const placeholders = [];
    const vals = [];

    cols.push('patient_id'); placeholders.push('?'); vals.push(patient_id || null);
    if (colInfo.hasPatientName) { cols.push('patient_name'); placeholders.push('?'); vals.push(patient_name || null); }
    if (colInfo.hasSessionType) { cols.push('session_type'); placeholders.push('?'); vals.push(sessionTypeValue); }
    else if (colInfo.hasType) { cols.push('type'); placeholders.push('?'); vals.push(sessionTypeValue); }
    if (colInfo.hasDoctorId) { cols.push('doctor_id'); placeholders.push('?'); vals.push(doctor_id || null); }
    if (colInfo.hasAppointmentId && appointment_id) { cols.push('appointment_id'); placeholders.push('?'); vals.push(appointment_id); }

    // Handle date/time
    if (colInfo.hasScheduledDate) {
      let dateVal = scheduled_date;
      let timeVal = scheduled_time_only || scheduled_time;
      if (!dateVal && scheduled_time && scheduled_time.includes('T')) {
        const dt = new Date(scheduled_time);
        dateVal = dt.toISOString().split('T')[0];
        timeVal = dt.toTimeString().slice(0, 5);
      }
      cols.push('scheduled_date'); placeholders.push('?'); vals.push(dateVal || null);
      if (colInfo.hasScheduledTime) { cols.push('scheduled_time'); placeholders.push('?'); vals.push(timeVal || '09:00'); }
    } else if (colInfo.hasScheduledTime) {
      cols.push('scheduled_time'); placeholders.push('?'); vals.push(scheduled_time || null);
    }

    cols.push('duration'); placeholders.push('?'); vals.push(duration || '30 min');
    cols.push('notes'); placeholders.push('?'); vals.push(notes || null);
    cols.push('status'); placeholders.push('?'); vals.push('scheduled');

    if (!patient_name && !patient_id) {
      return res.status(400).json({ error: 'Patient selection is required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO telemedicine_sessions (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`,
      vals
    );

    // Build select with same schema awareness
    const selectCols = [
      'ts.id', 'ts.patient_id',
      colInfo.hasPatientName ? 'ts.patient_name' : 'NULL AS patient_name',
      colInfo.hasSessionType ? 'ts.session_type' : (colInfo.hasType ? 'ts.type AS session_type' : "'video' AS session_type"),
      colInfo.hasScheduledDate ? 'ts.scheduled_date' : 'DATE(ts.scheduled_time) AS scheduled_date',
      colInfo.hasScheduledTime ? 'ts.scheduled_time' : 'NULL AS scheduled_time',
      'ts.duration', 'ts.status',
      colInfo.hasMeetingLink ? 'ts.meeting_link' : 'NULL AS meeting_link',
      'ts.notes', 'ts.created_at', 'ts.updated_at',
      `COALESCE(p.full_name, ${colInfo.hasPatientName ? 'ts.patient_name' : 'NULL'}) as patient_display_name`,
      'p.phone', 'p.email'
    ];

    const [rows] = await pool.execute(
      `SELECT ${selectCols.join(', ')} FROM telemedicine_sessions ts LEFT JOIN patients p ON p.id = ts.patient_id WHERE ts.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, id: result.insertId, session: rows[0] || null });
  } catch (err) {
    console.error('addTelemedicineSession error:', err);
    res.status(500).json({ error: 'Failed to add telemedicine session' });
  }
}

// Update telemedicine session status
export async function updateTelemedicineSession(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureTelemedicineTables(pool);
    const { id } = req.params;
    const { status, notes, meeting_link, recording_url } = req.body;
    const colInfo = await getTelemedicineColumnInfo(pool);

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
    if (meeting_link !== undefined && colInfo.hasMeetingLink) {
      updates.push('meeting_link = ?');
      params.push(meeting_link);
    }
    if (recording_url !== undefined && colInfo.hasRecordingUrl) {
      updates.push('recording_url = ?');
      params.push(recording_url);
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
    await ensureTelemedicineTables(pool);
    const { sessionId } = req.params;

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
    await ensureTelemedicineTables(pool);
    const { sessionId } = req.params;
    const { sender_type, sender_id, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
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

// Get appointments for telemedicine session creation (dropdown)
export async function getTelemedicineAppointments(req, res) {
  try {
    const pool = getTenantPool(req);
    // Get upcoming appointments that can be linked to telemedicine
    const [rows] = await pool.execute(`
      SELECT a.id, a.full_name, a.email, a.phone, a.appointment_date, a.appointment_time, a.selected_doctor, a.message, a.status,
             p.id as patient_id
      FROM appointments a
      LEFT JOIN patients p ON p.email = a.email OR p.phone = a.phone
      WHERE a.status IS NULL OR a.status NOT IN ('done', 'cancelled')
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).catch(() => [[]]);
    res.json({ appointments: rows || [] });
  } catch (err) {
    console.error('getTelemedicineAppointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
}
