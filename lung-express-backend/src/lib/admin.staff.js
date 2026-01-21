import { getTenantPool } from './tenant-db.js';

/* ============================================================
   STAFF MANAGEMENT - Doctors count as staff in hospital context
   ============================================================ */

/**
 * GET /api/dashboard/staff/summary
 * Returns staff statistics
 */
export async function getStaffSummary(req, res) {
  try {
    const db = getTenantPool(req);

    // Total doctors (as staff)
    const [[{ totalDoctors }]] = await db.query(
      `SELECT COUNT(*) AS totalDoctors FROM doctors`
    );

    // Active doctors
    const [[{ activeDoctors }]] = await db.query(
      `SELECT COUNT(*) AS activeDoctors FROM doctors WHERE is_active = 1`
    );

    // New doctors this month
    const [[{ newThisMonth }]] = await db.query(`
      SELECT COUNT(*) AS newThisMonth
      FROM doctors
      WHERE MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
    `);

    // Doctors by specialization
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
 * Returns all staff (doctors) with their stats
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
    if (status === 'active') {
      query += ` AND d.is_active = 1`;
    } else if (status === 'inactive') {
      query += ` AND d.is_active = 0`;
    }
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
 * Add new staff member (doctor)
 */
export async function addStaff(req, res) {
  try {
    const db = getTenantPool(req);
    const { 
      name, email, phone, specialization, qualifications, 
      consultation_fee, bio, platform_doctor_id 
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await db.query(`
      INSERT INTO doctors 
      (name, email, phone, specialization, qualifications, consultation_fee, bio, platform_doctor_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [
      name, 
      email || null, 
      phone || null, 
      specialization || null, 
      qualifications || null,
      consultation_fee || null,
      bio || null,
      platform_doctor_id || 0
    ]);

    res.status(201).json({ 
      success: true, 
      message: 'Staff member added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('❌ Add staff error:', error);
    res.status(500).json({ error: 'Failed to add staff member' });
  }
}

/**
 * PUT /api/dashboard/staff/:id
 * Update staff member (doctor)
 */
export async function updateStaff(req, res) {
  try {
    const db = getTenantPool(req);
    const { id } = req.params;
    const { 
      name, email, phone, specialization, qualifications, 
      consultation_fee, bio, is_active 
    } = req.body;

    await db.query(`
      UPDATE doctors SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        specialization = COALESCE(?, specialization),
        qualifications = COALESCE(?, qualifications),
        consultation_fee = COALESCE(?, consultation_fee),
        bio = COALESCE(?, bio),
        is_active = COALESCE(?, is_active),
        updated_at = NOW()
      WHERE id = ?
    `, [name, email, phone, specialization, qualifications, consultation_fee, bio, is_active, id]);

    res.json({ success: true, message: 'Staff member updated successfully' });
  } catch (error) {
    console.error('❌ Update staff error:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
}

/**
 * DELETE /api/dashboard/staff/:id
 * Delete staff member (doctor)
 */
export async function deleteStaff(req, res) {
  try {
    const db = getTenantPool(req);
    const { id } = req.params;

    // Soft delete by setting is_active = false
    await db.query(`UPDATE doctors SET is_active = FALSE WHERE id = ?`, [id]);

    res.json({ success: true, message: 'Staff member deactivated successfully' });
  } catch (error) {
    console.error('❌ Delete staff error:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
}
