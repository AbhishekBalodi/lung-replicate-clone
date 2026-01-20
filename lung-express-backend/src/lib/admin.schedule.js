/**
 * Doctor Schedule & Availability Backend Logic
 * Handles schedule slots and leave management
 */

import { getTenantPool } from './tenant-db.js';

// Get schedule slots
export async function getScheduleSlots(req, res) {
  try {
    const pool = getTenantPool(req);
    const { doctor_id } = req.query;

    let query = 'SELECT * FROM doctor_schedule';
    const params = [];

    if (doctor_id) {
      query += ' WHERE doctor_id = ?';
      params.push(doctor_id);
    }

    query += ' ORDER BY FIELD(day, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), start_time';

    const [rows] = await pool.execute(query, params);
    res.json({ slots: rows });
  } catch (err) {
    console.error('getScheduleSlots error:', err);
    res.status(500).json({ error: 'Failed to fetch schedule slots' });
  }
}

// Add schedule slot
export async function addScheduleSlot(req, res) {
  try {
    const pool = getTenantPool(req);
    const { day, start_time, end_time, slot_duration, is_active, doctor_id } = req.body;

    if (!day || !start_time || !end_time) {
      return res.status(400).json({ error: 'day, start_time, and end_time are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO doctor_schedule (day, start_time, end_time, slot_duration, is_active, doctor_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [day, start_time, end_time, slot_duration || 15, is_active !== false, doctor_id || null]
    );

    const [rows] = await pool.execute('SELECT * FROM doctor_schedule WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, id: result.insertId, slot: rows[0] || null });
  } catch (err) {
    console.error('addScheduleSlot error:', err);
    res.status(500).json({ error: 'Failed to add schedule slot' });
  }
}

// Update schedule slot
export async function updateScheduleSlot(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { day, start_time, end_time, slot_duration, is_active } = req.body;

    await pool.execute(
      `UPDATE doctor_schedule SET day = ?, start_time = ?, end_time = ?, slot_duration = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [day, start_time, end_time, slot_duration, is_active, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('updateScheduleSlot error:', err);
    res.status(500).json({ error: 'Failed to update schedule slot' });
  }
}

// Delete schedule slot
export async function deleteScheduleSlot(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;

    await pool.execute('DELETE FROM doctor_schedule WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('deleteScheduleSlot error:', err);
    res.status(500).json({ error: 'Failed to delete schedule slot' });
  }
}

// Toggle slot active status
export async function toggleSlotActive(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;

    await pool.execute('UPDATE doctor_schedule SET is_active = NOT is_active WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('toggleSlotActive error:', err);
    res.status(500).json({ error: 'Failed to toggle slot status' });
  }
}

// Get leave requests
export async function getLeaveRequests(req, res) {
  try {
    const pool = getTenantPool(req);
    const { doctor_id, status } = req.query;

    let query = 'SELECT * FROM leave_requests';
    const conditions = [];
    const params = [];

    if (doctor_id) {
      conditions.push('doctor_id = ?');
      params.push(doctor_id);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY start_date DESC';

    const [rows] = await pool.execute(query, params);
    res.json({ leaves: rows });
  } catch (err) {
    console.error('getLeaveRequests error:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
}

// Add leave request
export async function addLeaveRequest(req, res) {
  try {
    const pool = getTenantPool(req);
    const { start_date, end_date, reason, doctor_id } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO leave_requests (start_date, end_date, reason, doctor_id, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [start_date, end_date, reason || null, doctor_id || null]
    );

    const [rows] = await pool.execute('SELECT * FROM leave_requests WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, id: result.insertId, leave: rows[0] || null });
  } catch (err) {
    console.error('addLeaveRequest error:', err);
    res.status(500).json({ error: 'Failed to add leave request' });
  }
}

// Update leave request status
export async function updateLeaveRequest(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute('UPDATE leave_requests SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('updateLeaveRequest error:', err);
    res.status(500).json({ error: 'Failed to update leave request' });
  }
}

// Get schedule settings
export async function getScheduleSettings(req, res) {
  try {
    const pool = getTenantPool(req);
    const { doctor_id } = req.query;

    let query = 'SELECT * FROM schedule_settings';
    const params = [];

    if (doctor_id) {
      query += ' WHERE doctor_id = ?';
      params.push(doctor_id);
    }

    query += ' LIMIT 1';

    const [rows] = await pool.execute(query, params);
    
    // Return defaults if no settings found
    const settings = rows[0] || {
      default_slot_duration: 15,
      buffer_time: 5,
      booking_window_days: 30,
      cancellation_hours: 24,
    };

    res.json({ settings });
  } catch (err) {
    console.error('getScheduleSettings error:', err);
    res.status(500).json({ error: 'Failed to fetch schedule settings' });
  }
}

// Save schedule settings
export async function saveScheduleSettings(req, res) {
  try {
    const pool = getTenantPool(req);
    const { default_slot_duration, buffer_time, booking_window_days, cancellation_hours, doctor_id } = req.body;

    // Upsert settings
    await pool.execute(
      `INSERT INTO schedule_settings (doctor_id, default_slot_duration, buffer_time, booking_window_days, cancellation_hours)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         default_slot_duration = VALUES(default_slot_duration),
         buffer_time = VALUES(buffer_time),
         booking_window_days = VALUES(booking_window_days),
         cancellation_hours = VALUES(cancellation_hours),
         updated_at = NOW()`,
      [doctor_id || null, default_slot_duration, buffer_time, booking_window_days, cancellation_hours]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('saveScheduleSettings error:', err);
    res.status(500).json({ error: 'Failed to save schedule settings' });
  }
}
