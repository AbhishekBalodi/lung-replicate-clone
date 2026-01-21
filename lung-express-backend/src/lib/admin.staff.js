import { getTenantPool } from './tenant-db.js';

/* ============================================================
   STAFF MANAGEMENT - Doctors count as staff in hospital context
   ============================================================ */

/**
 * GET /api/dashboard/staff/summary
 */
export async function getStaffSummary(req, res) {
  try {
    const db = getTenantPool(req);

    const [[{ totalDoctors }]] = await db.query(
      `SELECT COUNT(*) AS totalDoctors FROM doctors`
    );

    const [[{ activeDoctors }]] = await db.query(
      `SELECT COUNT(*) AS activeDoctors FROM doctors WHERE is_active = 1`
    );

    const [[{ newThisMonth }]] = await db.query(`
      SELECT COUNT(*) AS newThisMonth
      FROM doctors
      WHERE MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
    `);

    const [bySpecialization] = await db.query(`
      SELECT 
        COALESCE(specialization, 'General') AS specialization,
        COUNT(*) AS count
      FROM doctors
      WHERE is_active = 1
      GROUP BY specialization
      ORDER BY count DESC
    `);

    res.json({
      totalStaff: totalDoctors,
      activeStaff: activeDoctors,
      newThisMonth,
      byDepartment: bySpecialization
    });
  } catch (error) {
    console.error('❌ Staff summary error:', error);
    res.status(500).json({ error: 'Failed to load staff summary' });
  }
}

/**
 * GET /api/dashboard/staff/list
 */
export async function getStaffList(req, res) {
  try {
    const db = getTenantPool(req);
    const { search, status, department } = req.query;

    let query = `
      SELECT 
        d.id,
        d.name,
        d.email,
        d.phone,
        d.specialization,
        d.qualifications,
        d.consultation_fee,
        d.is_active,
        d.created_at,
        (SELECT COUNT(*) FROM appointments a WHERE a.doctor_id = d.id) AS totalAppointments,
        (SELECT COUNT(*) FROM patients p WHERE p.doctor_id = d.id) AS totalPatients
      FROM doctors d
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (d.name LIKE ? OR d.email LIKE ? OR d.phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status === 'active') query += ` AND d.is_active = 1`;
    if (status === 'inactive') query += ` AND d.is_active = 0`;

    if (department && department !== 'all') {
      query += ` AND d.specialization = ?`;
      params.push(department);
    }

    query += ` ORDER BY d.name ASC`;

    const [staff] = await db.query(query, params);
    res.json({ staff });
  } catch (error) {
    console.error('❌ Staff list error:', error);
    res.status(500).json({ error: 'Failed to load staff list' });
  }
}

/**
 * POST /api/dashboard/staff
 */
export async function addStaff(req, res) {
  try {
    const db = getTenantPool(req);
    const {
      name,
      email,
      phone,
      specialization,
      qualifications,
      consultation_fee
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO doctors
       (name, email, phone, specialization, qualifications, consultation_fee, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name, email, phone, specialization, qualifications, consultation_fee]
    );

    res.status(201).json({
      message: 'Staff added successfully',
      staffId: result.insertId
    });
  } catch (error) {
    console.error('❌ Add staff error:', error);
    res.status(500).json({ error: 'Failed to add staff' });
  }
}

/**
 * PUT /api/dashboard/staff/:id
 */
export async function updateStaff(req, res) {
  try {
    const db = getTenantPool(req);
    const { id } = req.params;

    await db.query(
      `UPDATE doctors SET ? WHERE id = ?`,
      [req.body, id]
    );

    res.json({ message: 'Staff updated successfully' });
  } catch (error) {
    console.error('❌ Update staff error:', error);
    res.status(500).json({ error: 'Failed to update staff' });
  }
}

/**
 * DELETE /api/dashboard/staff/:id
 */
export async function deleteStaff(req, res) {
  try {
    const db = getTenantPool(req);
    const { id } = req.params;

    await db.query(
      `UPDATE doctors SET is_active = 0 WHERE id = ?`,
      [id]
    );

    res.json({ message: 'Staff deactivated successfully' });
  } catch (error) {
    console.error('❌ Delete staff error:', error);
    res.status(500).json({ error: 'Failed to delete staff' });
  }
}
