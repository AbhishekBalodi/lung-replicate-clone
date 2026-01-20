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
