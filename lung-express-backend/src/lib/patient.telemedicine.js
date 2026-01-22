import { getTenantPool } from './tenant-db.js';

/**
 * Telemedicine Chat and Video APIs for Patient Dashboard
 */

/**
 * GET /api/dashboard/patient/telemedicine/chat/:sessionId
 * Get chat messages for a telemedicine session
 */
export async function getTelemedicineChat(req, res) {
  try {
    const db = getTenantPool(req);
    const { sessionId } = req.params;
    const { email } = req.query;

    if (!email || !sessionId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify patient owns this session
    const [[session]] = await db.query(`
      SELECT ts.id, ts.patient_id, ts.doctor_id, d.name as doctor_name
      FROM telemedicine_sessions ts
      LEFT JOIN doctors d ON ts.doctor_id = d.id
      LEFT JOIN patients p ON ts.patient_id = p.id
      WHERE ts.id = ? AND p.email = ?
    `, [sessionId, email]);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get chat messages
    const [messages] = await db.query(`
      SELECT 
        id,
        sender_type,
        sender_id,
        message,
        created_at as timestamp,
        is_read
      FROM telemedicine_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `, [sessionId]);

    // Mark doctor messages as read
    await db.query(`
      UPDATE telemedicine_messages 
      SET is_read = TRUE 
      WHERE session_id = ? AND sender_type = 'doctor'
    `, [sessionId]);

    res.json({ 
      messages,
      session: {
        id: session.id,
        doctor_name: session.doctor_name,
        doctor_id: session.doctor_id
      }
    });
  } catch (error) {
    console.error('❌ Telemedicine chat error:', error);
    res.status(500).json({ error: 'Failed to load chat messages' });
  }
}

/**
 * POST /api/dashboard/patient/telemedicine/chat/:sessionId
 * Send a chat message in a telemedicine session
 */
export async function sendTelemedicineMessage(req, res) {
  try {
    const db = getTenantPool(req);
    const { sessionId } = req.params;
    const { email, message } = req.body;

    if (!email || !sessionId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get patient ID
    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify session exists and belongs to patient
    const [[session]] = await db.query(`
      SELECT id FROM telemedicine_sessions WHERE id = ? AND patient_id = ?
    `, [sessionId, patient.id]);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Insert message
    const [result] = await db.query(`
      INSERT INTO telemedicine_messages 
      (session_id, sender_type, sender_id, message)
      VALUES (?, 'patient', ?, ?)
    `, [sessionId, patient.id, message]);

    res.json({ 
      success: true, 
      message: {
        id: result.insertId,
        sender_type: 'patient',
        message,
        timestamp: new Date().toISOString(),
        is_read: false
      }
    });
  } catch (error) {
    console.error('❌ Send telemedicine message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

/**
 * POST /api/dashboard/patient/telemedicine/start-video/:sessionId
 * Generate a video call room for a telemedicine session
 * Uses a simple room-based approach that can work with free services like Jitsi Meet
 */
export async function startVideoCall(req, res) {
  try {
    const db = getTenantPool(req);
    const { sessionId } = req.params;
    const { email } = req.body;

    if (!email || !sessionId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get patient and verify session
    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const [[session]] = await db.query(`
      SELECT ts.id, ts.status, ts.meeting_link, d.name as doctor_name
      FROM telemedicine_sessions ts
      LEFT JOIN doctors d ON ts.doctor_id = d.id
      WHERE ts.id = ? AND ts.patient_id = ?
    `, [sessionId, patient.id]);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Generate a unique room ID using session ID and timestamp
    const roomId = `teleconsult-${sessionId}-${Date.now()}`;
    
    // Use Jitsi Meet (free, no API key required)
    const meetingLink = `https://meet.jit.si/${roomId}`;

    // Update session with meeting link and status
    await db.query(`
      UPDATE telemedicine_sessions 
      SET meeting_link = ?, status = 'in-progress'
      WHERE id = ?
    `, [meetingLink, sessionId]);

    res.json({ 
      success: true,
      meetingLink,
      roomId,
      provider: 'jitsi',
      doctorName: session.doctor_name
    });
  } catch (error) {
    console.error('❌ Start video call error:', error);
    res.status(500).json({ error: 'Failed to start video call' });
  }
}

/**
 * POST /api/dashboard/patient/telemedicine/end-video/:sessionId
 * End a video call session
 */
export async function endVideoCall(req, res) {
  try {
    const db = getTenantPool(req);
    const { sessionId } = req.params;

    await db.query(`
      UPDATE telemedicine_sessions 
      SET status = 'completed'
      WHERE id = ?
    `, [sessionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('❌ End video call error:', error);
    res.status(500).json({ error: 'Failed to end video call' });
  }
}

/**
 * GET /api/dashboard/patient/telemedicine/doctors
 * Get available doctors for telemedicine booking
 */
export async function getTelemedicineDoctors(req, res) {
  try {
    const db = getTenantPool(req);

    // Schema-aware: older tenants may not have doctors.profile_photo_url yet
    const [columns] = await db.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'doctors'
    `).catch(() => [[]]);
    const colSet = new Set((columns || []).map((c) => c.COLUMN_NAME));
    const hasProfilePhotoUrl = colSet.has('profile_photo_url');

    const [doctors] = await db.query(`
      SELECT 
        id,
        name,
        specialization,
        consultation_fee,
        ${hasProfilePhotoUrl ? 'profile_photo_url' : 'NULL'} AS profile_photo_url
      FROM doctors
      WHERE is_active = TRUE
      ORDER BY name ASC
    `);

    res.json({ doctors });
  } catch (error) {
    console.error('❌ Telemedicine doctors error:', error);
    res.status(500).json({ error: 'Failed to load doctors' });
  }
}
