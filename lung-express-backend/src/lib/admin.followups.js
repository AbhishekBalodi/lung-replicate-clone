/**
 * Follow-ups & Care Plans Backend Logic
 * Handles patient follow-ups and care plan management
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// FOLLOW-UPS
// ============================================

export async function getFollowUpsSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [total] = await pool.execute('SELECT COUNT(*) as count FROM follow_ups');
    const [pending] = await pool.execute("SELECT COUNT(*) as count FROM follow_ups WHERE status = 'pending'");
    const [overdue] = await pool.execute("SELECT COUNT(*) as count FROM follow_ups WHERE status = 'pending' AND follow_up_date < CURDATE()");
    const [today] = await pool.execute("SELECT COUNT(*) as count FROM follow_ups WHERE follow_up_date = CURDATE()");
    
    res.json({
      total: total[0]?.count || 0,
      pending: pending[0]?.count || 0,
      overdue: overdue[0]?.count || 0,
      today: today[0]?.count || 0
    });
  } catch (err) {
    console.error('getFollowUpsSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch follow-ups summary' });
  }
}

export async function getFollowUpsList(req, res) {
  try {
    const pool = getTenantPool(req);
    const { status, search, doctor_id } = req.query;
    
    let query = `
      SELECT f.*, p.full_name as patient_name, p.phone, p.email
      FROM follow_ups f
      LEFT JOIN patients p ON p.id = f.patient_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (status && status !== 'all') {
      if (status === 'overdue') {
        conditions.push("f.status = 'pending' AND f.follow_up_date < CURDATE()");
      } else {
        conditions.push('f.status = ?');
        params.push(status);
      }
    }
    
    if (search) {
      conditions.push('(p.full_name LIKE ? OR f.reason LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (doctor_id) {
      conditions.push('f.doctor_id = ?');
      params.push(doctor_id);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY f.follow_up_date ASC';
    
    const [rows] = await pool.execute(query, params);
    
    // Mark overdue items
    const now = new Date();
    const enrichedRows = rows.map(row => ({
      ...row,
      status: row.status === 'pending' && new Date(row.follow_up_date) < now ? 'overdue' : row.status
    }));
    
    res.json({ followUps: enrichedRows });
  } catch (err) {
    console.error('getFollowUpsList error:', err);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
}

export async function addFollowUp(req, res) {
  try {
    const pool = getTenantPool(req);
    const { patient_id, patient_name, follow_up_date, reason, notes, doctor_id, reminder_sent } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO follow_ups (patient_id, patient_name, follow_up_date, reason, notes, doctor_id, reminder_sent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [patient_id || null, patient_name, follow_up_date, reason, notes || null, doctor_id || null, reminder_sent || false]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addFollowUp error:', err);
    res.status(500).json({ error: 'Failed to add follow-up' });
  }
}

export async function updateFollowUp(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { follow_up_date, reason, notes, status, reminder_sent } = req.body;
    
    await pool.execute(
      `UPDATE follow_ups SET follow_up_date = ?, reason = ?, notes = ?, status = ?, reminder_sent = ?, updated_at = NOW()
       WHERE id = ?`,
      [follow_up_date, reason, notes, status, reminder_sent, id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('updateFollowUp error:', err);
    res.status(500).json({ error: 'Failed to update follow-up' });
  }
}

export async function markFollowUpComplete(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    
    await pool.execute(
      "UPDATE follow_ups SET status = 'completed', completed_at = NOW() WHERE id = ?",
      [id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('markFollowUpComplete error:', err);
    res.status(500).json({ error: 'Failed to mark follow-up complete' });
  }
}

// ============================================
// CARE PLANS
// ============================================

export async function getCarePlans(req, res) {
  try {
    const pool = getTenantPool(req);
    const { patient_id, status, search } = req.query;
    
    let query = `
      SELECT cp.*, COALESCE(p.full_name, cp.patient_name) as patient_name
      FROM care_plans cp
      LEFT JOIN patients p ON p.id = cp.patient_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (patient_id) {
      conditions.push('cp.patient_id = ?');
      params.push(patient_id);
    }
    
    if (status) {
      conditions.push('cp.status = ?');
      params.push(status);
    }
    
    if (search) {
      conditions.push('(p.full_name LIKE ? OR cp.title LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY cp.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json({ carePlans: rows });
  } catch (err) {
    console.error('getCarePlans error:', err);
    res.status(500).json({ error: 'Failed to fetch care plans' });
  }
}

export async function addCarePlan(req, res) {
  try {
    const pool = getTenantPool(req);
    const { patient_id, patient_name, title, description, goals, interventions, start_date, end_date, status, doctor_id } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO care_plans (patient_id, patient_name, title, description, goals, interventions, start_date, end_date, status, doctor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id || null, patient_name, title, description || null, goals || null, interventions || null, start_date || null, end_date || null, status || 'active', doctor_id || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addCarePlan error:', err);
    res.status(500).json({ error: 'Failed to add care plan' });
  }
}

export async function updateCarePlan(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { title, description, goals, interventions, start_date, end_date, status } = req.body;
    
    await pool.execute(
      `UPDATE care_plans SET title = ?, description = ?, goals = ?, interventions = ?, start_date = ?, end_date = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, goals, interventions, start_date, end_date, status, id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('updateCarePlan error:', err);
    res.status(500).json({ error: 'Failed to update care plan' });
  }
}
