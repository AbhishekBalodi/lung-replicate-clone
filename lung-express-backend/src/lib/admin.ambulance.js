/**
 * Ambulance Management Backend Logic
 * Handles ambulance calls, fleet management, and dispatches
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// AMBULANCE CALLS
// ============================================

export async function getAmbulanceCallsSummary(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [totalCalls] = await pool.execute('SELECT COUNT(*) as count FROM ambulance_calls');
    const [activeCalls] = await pool.execute("SELECT COUNT(*) as count FROM ambulance_calls WHERE status IN ('pending', 'dispatched', 'en_route')");
    const [completedToday] = await pool.execute("SELECT COUNT(*) as count FROM ambulance_calls WHERE status = 'completed' AND DATE(created_at) = CURDATE()");
    
    // Average response time calculation
    const [avgResponse] = await pool.execute(`
      SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, dispatched_at)) as avg_minutes 
      FROM ambulance_calls 
      WHERE dispatched_at IS NOT NULL
    `);
    
    res.json({
      totalCalls: totalCalls[0]?.count || 0,
      activeCalls: activeCalls[0]?.count || 0,
      completedToday: completedToday[0]?.count || 0,
      avgResponseTime: avgResponse[0]?.avg_minutes ? `${Math.round(avgResponse[0].avg_minutes)} min` : 'N/A'
    });
  } catch (err) {
    console.error('getAmbulanceCallsSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch ambulance calls summary' });
  }
}

export async function getAmbulanceCallsList(req, res) {
  try {
    const pool = getTenantPool(req);
    const { status, date } = req.query;
    
    let query = `
      SELECT ac.*, a.vehicle_number, a.driver_name, a.driver_contact
      FROM ambulance_calls ac
      LEFT JOIN ambulances a ON a.id = ac.ambulance_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (status && status !== 'all') {
      conditions.push('ac.status = ?');
      params.push(status);
    }
    
    if (date === 'today') {
      conditions.push('DATE(ac.created_at) = CURDATE()');
    } else if (date === 'week') {
      conditions.push('ac.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
    } else if (date === 'month') {
      conditions.push('ac.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY ac.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json({ calls: rows });
  } catch (err) {
    console.error('getAmbulanceCallsList error:', err);
    res.status(500).json({ error: 'Failed to fetch ambulance calls' });
  }
}

export async function addAmbulanceCall(req, res) {
  try {
    const pool = getTenantPool(req);
    const { patient_name, phone, pickup_location, drop_location, reason, priority, ambulance_id, notes } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO ambulance_calls (patient_name, phone, pickup_location, drop_location, reason, priority, ambulance_id, notes, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [patient_name, phone, pickup_location, drop_location, reason, priority || 'normal', ambulance_id || null, notes || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addAmbulanceCall error:', err);
    res.status(500).json({ error: 'Failed to add ambulance call' });
  }
}

export async function updateAmbulanceCallStatus(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { status, ambulance_id } = req.body;
    
    let query = 'UPDATE ambulance_calls SET status = ?';
    const params = [status];
    
    if (status === 'dispatched') {
      query += ', dispatched_at = NOW()';
    } else if (status === 'completed') {
      query += ', completed_at = NOW()';
    }
    
    if (ambulance_id) {
      query += ', ambulance_id = ?';
      params.push(ambulance_id);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (err) {
    console.error('updateAmbulanceCallStatus error:', err);
    res.status(500).json({ error: 'Failed to update ambulance call status' });
  }
}

// ============================================
// AMBULANCE FLEET
// ============================================

export async function getAmbulanceFleetList(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [rows] = await pool.execute(`
      SELECT * FROM ambulances ORDER BY created_at DESC
    `);
    
    res.json({ fleet: rows });
  } catch (err) {
    console.error('getAmbulanceFleetList error:', err);
    res.status(500).json({ error: 'Failed to fetch ambulance fleet' });
  }
}

export async function addAmbulance(req, res) {
  try {
    const pool = getTenantPool(req);
    const { vehicle_number, model, driver_name, driver_contact, status, current_location, notes } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO ambulances (vehicle_number, model, driver_name, driver_contact, status, current_location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vehicle_number, model || null, driver_name || null, driver_contact || null, status || 'available', current_location || null, notes || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addAmbulance error:', err);
    res.status(500).json({ error: 'Failed to add ambulance' });
  }
}

export async function updateAmbulance(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { vehicle_number, model, driver_name, driver_contact, status, current_location, notes } = req.body;
    
    await pool.execute(
      `UPDATE ambulances SET vehicle_number = ?, model = ?, driver_name = ?, driver_contact = ?, status = ?, current_location = ?, notes = ?
       WHERE id = ?`,
      [vehicle_number, model, driver_name, driver_contact, status, current_location, notes, id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('updateAmbulance error:', err);
    res.status(500).json({ error: 'Failed to update ambulance' });
  }
}

export async function getAmbulanceDetails(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    
    const [ambulance] = await pool.execute('SELECT * FROM ambulances WHERE id = ?', [id]);
    
    if (!ambulance.length) {
      return res.status(404).json({ error: 'Ambulance not found' });
    }
    
    // Get recent trips
    const [recentTrips] = await pool.execute(`
      SELECT * FROM ambulance_calls WHERE ambulance_id = ? ORDER BY created_at DESC LIMIT 10
    `, [id]);
    
    res.json({ ambulance: ambulance[0], recentTrips });
  } catch (err) {
    console.error('getAmbulanceDetails error:', err);
    res.status(500).json({ error: 'Failed to fetch ambulance details' });
  }
}
