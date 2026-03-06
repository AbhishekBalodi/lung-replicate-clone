import { Router } from 'express';
import bcrypt from 'bcrypt';
import { platformPool } from '../lib/platform-db.js';
import { getTenantPool } from '../lib/tenant-db.js';

const router = Router();

/**
 * Middleware: allow ONLY hospital tenants
 */
function hospitalOnly(req, res, next) {
  if (!req.tenant || req.tenant.type !== 'hospital') {
    return res.status(403).json({ error: 'This operation is only allowed for hospital tenants' });
  }
  next();
}

/**
 * Ensure hospital_staff table exists in tenant DB
 */
async function ensureStaffTable(pool) {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS hospital_staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        role VARCHAR(100) DEFAULT 'staff',
        department VARCHAR(100),
        designation VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        platform_user_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    console.warn('ensureStaffTable warning:', e.message);
  }
}

/**
 * GET /api/staff
 * List all staff members
 */
router.get('/', hospitalOnly, async (req, res) => {
  try {
    const tenantPool = getTenantPool(req);
    await ensureStaffTable(tenantPool);

    const { search, status } = req.query;
    let query = 'SELECT * FROM hospital_staff WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status === 'active') {
      query += ' AND is_active = 1';
    } else if (status === 'inactive') {
      query += ' AND is_active = 0';
    }

    query += ' ORDER BY created_at DESC';
    const [staff] = await tenantPool.execute(query, params);
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

/**
 * POST /api/staff
 * Create staff member with platform login credentials
 */
router.post('/', hospitalOnly, async (req, res) => {
  try {
    const tenantPool = getTenantPool(req);
    await ensureStaffTable(tenantPool);

    const { name, email, phone, password, role, department, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check email uniqueness in platform
    const [existingUsers] = await platformPool.execute(
      'SELECT id FROM tenant_users WHERE email = ?',
      [email.trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Create platform user (role = admin so they can log in to doctor/admin dashboard)
    const passwordHash = await bcrypt.hash(password, 10);
    const [userResult] = await platformPool.execute(
      `INSERT INTO tenant_users (tenant_id, email, password_hash, name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'admin', TRUE)`,
      [req.tenant.id, email.trim(), passwordHash, name, phone || null]
    );
    const platformUserId = userResult.insertId;

    // Create staff in tenant DB
    const [staffResult] = await tenantPool.execute(
      `INSERT INTO hospital_staff (name, email, phone, role, department, designation, is_active, platform_user_id)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [name, email.trim(), phone || null, role || 'staff', department || null, designation || null, platformUserId]
    );

    res.status(201).json({
      success: true,
      staff: {
        id: staffResult.insertId,
        platform_user_id: platformUserId,
        name,
        email: email.trim(),
        phone,
        role: role || 'staff',
        department,
        designation,
        is_active: true
      }
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

/**
 * PUT /api/staff/:id
 * Update staff member
 */
router.put('/:id', hospitalOnly, async (req, res) => {
  try {
    const tenantPool = getTenantPool(req);
    const { id } = req.params;
    const { name, email, phone, password, role, department, designation, is_active } = req.body;

    const [staff] = await tenantPool.execute('SELECT * FROM hospital_staff WHERE id = ?', [id]);
    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const staffMember = staff[0];

    await tenantPool.execute(
      `UPDATE hospital_staff SET
        name = ?, email = ?, phone = ?, role = ?, department = ?, designation = ?, is_active = ?
       WHERE id = ?`,
      [
        name ?? staffMember.name,
        email ?? staffMember.email,
        phone ?? staffMember.phone,
        role ?? staffMember.role,
        department ?? staffMember.department,
        designation ?? staffMember.designation,
        is_active ?? staffMember.is_active,
        id
      ]
    );

    // Sync platform user
    if (staffMember.platform_user_id) {
      const updates = [];
      const values = [];
      if (name) { updates.push('name = ?'); values.push(name); }
      if (email) { updates.push('email = ?'); values.push(email); }
      if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
      if (password) {
        const hash = await bcrypt.hash(password, 10);
        updates.push('password_hash = ?');
        values.push(hash);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(is_active);
      }
      if (updates.length > 0) {
        values.push(staffMember.platform_user_id);
        await platformPool.execute(
          `UPDATE tenant_users SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

/**
 * DELETE /api/staff/:id
 * Deactivate staff member
 */
router.delete('/:id', hospitalOnly, async (req, res) => {
  try {
    const tenantPool = getTenantPool(req);
    const { id } = req.params;

    const [staff] = await tenantPool.execute('SELECT * FROM hospital_staff WHERE id = ?', [id]);
    if (staff.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    await tenantPool.execute('UPDATE hospital_staff SET is_active = FALSE WHERE id = ?', [id]);

    if (staff[0].platform_user_id) {
      await platformPool.execute(
        'UPDATE tenant_users SET is_active = FALSE WHERE id = ?',
        [staff[0].platform_user_id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

export default router;
