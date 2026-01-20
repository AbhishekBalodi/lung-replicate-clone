import { getTenantPool } from './tenant-db.js';

/* ============================================================
   ROOMS MANAGEMENT - KPIs, Lists, and Analytics
   ============================================================ */

/**
 * GET /api/dashboard/rooms/summary
 * Returns room statistics by department
 */
export async function getRoomsSummary(req, res) {
  try {
    const db = getTenantPool(req);

    // Total rooms
    const [[{ totalRooms }]] = await db.query(
      `SELECT COUNT(*) AS totalRooms FROM rooms`
    );

    // Rooms by status
    const [statusCounts] = await db.query(`
      SELECT status, COUNT(*) AS count 
      FROM rooms 
      GROUP BY status
    `);

    // Room types with counts
    const [roomTypes] = await db.query(`
      SELECT 
        rt.id,
        rt.name,
        rt.price_per_day,
        COUNT(r.id) AS totalRooms,
        SUM(CASE WHEN r.status = 'vacant' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN r.status = 'occupied' THEN 1 ELSE 0 END) AS occupied,
        SUM(CASE WHEN r.status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance
      FROM room_types rt
      LEFT JOIN rooms r ON r.room_type_id = rt.id
      GROUP BY rt.id, rt.name, rt.price_per_day
    `);

    // Calculate occupancy rate
    const occupied = statusCounts.find(s => s.status === 'occupied')?.count || 0;
    const occupancyRate = totalRooms > 0 ? ((occupied / totalRooms) * 100).toFixed(1) : 0;

    res.json({
      totalRooms,
      occupied,
      available: statusCounts.find(s => s.status === 'vacant')?.count || 0,
      maintenance: statusCounts.find(s => s.status === 'maintenance')?.count || 0,
      occupancyRate: Number(occupancyRate),
      roomTypes
    });
  } catch (error) {
    console.error('❌ Rooms summary error:', error);
    res.status(500).json({ error: 'Failed to load rooms summary' });
  }
}

/**
 * GET /api/dashboard/rooms/list
 * Returns all rooms with patient/doctor info if occupied
 */
export async function getRoomsList(req, res) {
  try {
    const db = getTenantPool(req);
    const { type, status, search } = req.query;

    let query = `
      SELECT 
        r.id,
        r.room_number,
        r.status,
        r.bed_count,
        r.notes,
        rt.name AS room_type,
        rt.price_per_day,
        ra.patient_name,
        ra.from_date,
        ra.to_date,
        d.name AS doctor_name
      FROM rooms r
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN room_allotments ra ON ra.room_id = r.id AND ra.status = 'active'
      LEFT JOIN doctors d ON ra.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (type && type !== 'all') {
      query += ` AND rt.name = ?`;
      params.push(type);
    }
    if (status && status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (r.room_number LIKE ? OR ra.patient_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY r.room_number ASC`;

    const [rooms] = await db.query(query, params);

    res.json({ rooms });
  } catch (error) {
    console.error('❌ Rooms list error:', error);
    res.status(500).json({ error: 'Failed to load rooms list' });
  }
}

/**
 * GET /api/dashboard/rooms/allotments
 * Returns current and past room allotments
 */
export async function getRoomAllotments(req, res) {
  try {
    const db = getTenantPool(req);
    const { status = 'active' } = req.query;

    const [allotments] = await db.query(`
      SELECT 
        ra.id,
        ra.patient_name,
        ra.from_date,
        ra.to_date,
        ra.status,
        ra.notes,
        r.room_number,
        rt.name AS room_type,
        d.name AS doctor_name
      FROM room_allotments ra
      JOIN rooms r ON ra.room_id = r.id
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN doctors d ON ra.doctor_id = d.id
      WHERE ra.status = ?
      ORDER BY ra.from_date DESC
    `, [status]);

    res.json({ allotments });
  } catch (error) {
    console.error('❌ Room allotments error:', error);
    res.status(500).json({ error: 'Failed to load room allotments' });
  }
}

/**
 * POST /api/dashboard/rooms
 * Add new room
 */
export async function addRoom(req, res) {
  try {
    const db = getTenantPool(req);
    const { room_number, room_type_id, bed_count, status, notes } = req.body;

    if (!room_number) {
      return res.status(400).json({ error: 'Room number is required' });
    }

    const [result] = await db.query(`
      INSERT INTO rooms (room_number, room_type_id, bed_count, status, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [
      room_number,
      room_type_id || null,
      bed_count || 1,
      status || 'vacant',
      notes || null
    ]);

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('❌ Add room error:', error);
    res.status(500).json({ error: 'Failed to add room' });
  }
}

/**
 * POST /api/dashboard/rooms/allotments
 * Add new room allotment
 */
export async function addRoomAllotment(req, res) {
  try {
    const db = getTenantPool(req);
    const { room_id, patient_name, patient_user_id, doctor_id, from_date, to_date, notes } = req.body;

    if (!room_id || !patient_name || !from_date) {
      return res.status(400).json({ error: 'Room, patient name, and from date are required' });
    }

    // Update room status to occupied
    await db.query(`UPDATE rooms SET status = 'occupied' WHERE id = ?`, [room_id]);

    const [result] = await db.query(`
      INSERT INTO room_allotments (room_id, patient_name, patient_user_id, doctor_id, from_date, to_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `, [
      room_id,
      patient_name,
      patient_user_id || null,
      doctor_id || null,
      from_date,
      to_date || null,
      notes || null
    ]);

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('❌ Add room allotment error:', error);
    res.status(500).json({ error: 'Failed to add room allotment' });
  }
}
