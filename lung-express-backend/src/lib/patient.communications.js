import { getTenantPool } from './tenant-db.js';

/* ============================================================
   PATIENT COMMUNICATIONS APIs
   Telemedicine, Messages, Notifications
   ============================================================ */

/**
 * GET /api/dashboard/patient/telemedicine/sessions
 */
export async function getPatientTelemedicineSessions(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, status } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    // Get patient ID first
    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.json({ upcomingSessions: [], pastSessions: [] });
    }

    // Schema-aware: older tenant schemas may not have telemedicine_sessions.session_type
    const [tsColumns] = await db.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'telemedicine_sessions'
    `).catch(() => [[]]);
    const tsColSet = new Set((tsColumns || []).map((c) => c.COLUMN_NAME));
    const hasSessionType = tsColSet.has('session_type');

    let query = `
      SELECT 
        ts.id,
        ${hasSessionType ? 'ts.session_type' : 'NULL'} AS session_type,
        ts.scheduled_date,
        ts.scheduled_time,
        ts.status,
        ts.meeting_link,
        ts.notes,
        ts.created_at,
        d.name AS doctor_name,
        d.specialization
      FROM telemedicine_sessions ts
      LEFT JOIN doctors d ON ts.doctor_id = d.id
      WHERE ts.patient_id = ?
    `;
    const params = [patient.id];

    if (status && status !== 'all') {
      query += ` AND ts.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY ts.scheduled_date DESC, ts.scheduled_time DESC`;

    const [sessions] = await db.query(query, params);

    const upcomingSessions = sessions.filter(s => 
      s.status === 'scheduled' && new Date(s.scheduled_date) >= new Date()
    );
    const pastSessions = sessions.filter(s => 
      s.status === 'completed' || new Date(s.scheduled_date) < new Date()
    );

    res.json({ upcomingSessions, pastSessions });
  } catch (error) {
    console.error('❌ Patient telemedicine sessions error:', error);
    res.status(500).json({ error: 'Failed to load telemedicine sessions' });
  }
}

/**
 * POST /api/dashboard/patient/telemedicine/sessions
 */
export async function bookTelemedicineSession(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, doctor_id, session_type, scheduled_date, scheduled_time, notes } = req.body;

    if (!email || !doctor_id || !scheduled_date || !scheduled_time) {
      return res.status(400).json({ error: 'Missing required fields: email, doctor_id, scheduled_date, and scheduled_time are required' });
    }

    // Check if telemedicine_sessions table exists
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'telemedicine_sessions'
    `).catch(() => [[]]);

    if (!tables || tables.length === 0) {
      console.error('❌ telemedicine_sessions table does not exist in this tenant schema');
      return res.status(400).json({ error: 'Telemedicine is not available for this tenant. Please contact support to enable it.' });
    }

    const [[patient]] = await db.query(
      `SELECT id, full_name FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found. Please ensure you have a patient profile.' });
    }

    // Schema-aware insert: handle tenants without session_type column
    const [tsColumns] = await db.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'telemedicine_sessions'
    `).catch(() => [[]]);
    const tsColSet = new Set((tsColumns || []).map((c) => c.COLUMN_NAME));
    const hasSessionType = tsColSet.has('session_type');
    const hasPatientName = tsColSet.has('patient_name');

    // Build insert query based on available columns
    let insertCols = ['patient_id', 'doctor_id', 'scheduled_date', 'scheduled_time', 'status'];
    let insertPlaceholders = ['?', '?', '?', '?', "'scheduled'"];
    let insertValues = [patient.id, doctor_id, scheduled_date, scheduled_time];

    if (hasSessionType) {
      insertCols.push('session_type');
      insertPlaceholders.push('?');
      insertValues.push(session_type || 'video');
    }

    if (hasPatientName) {
      insertCols.push('patient_name');
      insertPlaceholders.push('?');
      insertValues.push(patient.full_name || 'Patient');
    }

    if (notes) {
      insertCols.push('notes');
      insertPlaceholders.push('?');
      insertValues.push(notes);
    }

    const insertQuery = `
      INSERT INTO telemedicine_sessions (${insertCols.join(', ')})
      VALUES (${insertPlaceholders.join(', ')})
    `;

    console.log('📋 Booking telemedicine session:', { email, doctor_id, scheduled_date, scheduled_time, session_type });

    const [result] = await db.query(insertQuery, insertValues);

    console.log('✅ Telemedicine session booked successfully:', result.insertId);

    res.json({ 
      success: true, 
      message: 'Telemedicine session booked successfully',
      sessionId: result.insertId
    });
  } catch (error) {
    console.error('❌ Book telemedicine session error:', error);
    res.status(500).json({ error: `Failed to book session: ${error.message}` });
  }
}

/**
 * GET /api/dashboard/patient/messages/conversations
 */
export async function getPatientConversations(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.json({ conversations: [] });
    }

    // Get unique conversations with doctors/hospital
    const [conversations] = await db.query(`
      SELECT 
        c.id,
        c.participant_type,
        c.participant_id,
        CASE 
          WHEN c.participant_type = 'doctor' THEN d.name
          ELSE 'Hospital Support'
        END AS participant_name,
        c.last_message,
        c.last_message_time,
        c.unread_count
      FROM patient_conversations c
      LEFT JOIN doctors d ON c.participant_type = 'doctor' AND c.participant_id = d.id
      WHERE c.patient_id = ?
      ORDER BY c.last_message_time DESC
    `, [patient.id]);

    res.json({ conversations });
  } catch (error) {
    console.error('❌ Patient conversations error:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
}

/**
 * GET /api/dashboard/patient/messages/:conversationId
 */
export async function getPatientMessages(req, res) {
  try {
    const db = getTenantPool(req);
    const { conversationId } = req.params;
    const { email } = req.query;

    if (!email || !conversationId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const [messages] = await db.query(`
      SELECT 
        m.id,
        m.sender_type,
        m.content,
        m.created_at AS timestamp,
        m.is_read
      FROM patient_messages m
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);

    // Mark messages as read
    await db.query(`
      UPDATE patient_messages 
      SET is_read = TRUE 
      WHERE conversation_id = ? AND sender_type != 'patient'
    `, [conversationId]);

    res.json({ messages });
  } catch (error) {
    console.error('❌ Patient messages error:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
}

/**
 * POST /api/dashboard/patient/messages
 */
export async function sendPatientMessage(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, conversation_id, content } = req.body;

    if (!email || !conversation_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const [result] = await db.query(`
      INSERT INTO patient_messages 
      (conversation_id, sender_type, sender_id, content)
      VALUES (?, 'patient', ?, ?)
    `, [conversation_id, patient.id, content]);

    // Update conversation last message
    await db.query(`
      UPDATE patient_conversations 
      SET last_message = ?, last_message_time = NOW() 
      WHERE id = ?
    `, [content.substring(0, 100), conversation_id]);

    res.json({ 
      success: true, 
      messageId: result.insertId,
      message: {
        id: result.insertId,
        sender_type: 'patient',
        content,
        timestamp: new Date().toISOString(),
        is_read: false
      }
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

/**
 * GET /api/dashboard/patient/notifications
 */
export async function getPatientNotifications(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.json({ notifications: [], unreadCount: 0 });
    }

    const [notifications] = await db.query(`
      SELECT 
        id,
        type,
        title,
        message,
        created_at AS timestamp,
        is_read AS read
      FROM patient_notifications
      WHERE patient_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [patient.id]);

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('❌ Patient notifications error:', error);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
}

/**
 * PUT /api/dashboard/patient/notifications/:id/read
 */
export async function markNotificationAsRead(req, res) {
  try {
    const db = getTenantPool(req);
    const { id } = req.params;

    await db.query(`
      UPDATE patient_notifications SET is_read = TRUE WHERE id = ?
    `, [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

/**
 * POST /api/dashboard/patient/notifications/read-all
 */
export async function markAllNotificationsRead(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.body;

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (patient) {
      await db.query(`
        UPDATE patient_notifications SET is_read = TRUE WHERE patient_id = ?
      `, [patient.id]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}

/**
 * DELETE /api/dashboard/patient/notifications/:id
 */
export async function deletePatientNotification(req, res) {
  try {
    const db = getTenantPool(req);
    const { id } = req.params;

    await db.query(`DELETE FROM patient_notifications WHERE id = ?`, [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
}
