import { Router } from 'express';
import bcrypt from 'bcrypt';
import { platformPool } from '../lib/platform-db.js';
import { getTenantPool } from '../lib/tenant-db.js';

const router = Router();

/**
 * GET /api/doctors
 * Get all doctors for the current hospital tenant
 * Only accessible by super_admin
 */
router.get('/', async (req, res) => {
  try {
    const tenantCode = req.headers['x-tenant-code'] || req.query.tenantCode;
    
    if (!tenantCode) {
      return res.status(400).json({ error: 'Tenant code is required' });
    }

    // Get tenant info
    const [tenants] = await platformPool.execute(
      'SELECT * FROM tenants WHERE tenant_code = ? AND status = ?',
      [tenantCode, 'active']
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = tenants[0];

    if (tenant.type !== 'hospital') {
      return res.status(400).json({ error: 'This endpoint is only for hospital tenants' });
    }

    // Get doctors from tenant database
    const tenantPool = await getTenantPool(tenantCode);
    const [doctors] = await tenantPool.execute(
      'SELECT * FROM doctors ORDER BY created_at DESC'
    );

    res.json({ success: true, doctors });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

/**
 * POST /api/doctors
 * Create a new doctor in the hospital
 * Only accessible by super_admin
 */
router.post('/', async (req, res) => {
  try {
    const tenantCode = req.headers['x-tenant-code'] || req.query.tenantCode;
    const { name, email, phone, password, specialization, qualifications, bio, consultation_fee } = req.body;

    if (!tenantCode) {
      return res.status(400).json({ error: 'Tenant code is required' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Get tenant info
    const [tenants] = await platformPool.execute(
      'SELECT * FROM tenants WHERE tenant_code = ? AND status = ?',
      [tenantCode, 'active']
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = tenants[0];

    if (tenant.type !== 'hospital') {
      return res.status(400).json({ error: 'This endpoint is only for hospital tenants' });
    }

    // Check if doctor email already exists in tenant_users
    const [existingUsers] = await platformPool.execute(
      'SELECT id FROM tenant_users WHERE tenant_id = ? AND email = ?',
      [tenant.id, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create doctor in tenant_users table (platform database) with role 'admin'
    const [userResult] = await platformPool.execute(
      `INSERT INTO tenant_users (tenant_id, email, password_hash, name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'admin', TRUE)`,
      [tenant.id, email, passwordHash, name, phone || null]
    );

    const tenantUserId = userResult.insertId;

    // Create doctor in tenant's doctors table
    const tenantPool = await getTenantPool(tenantCode);
    const [doctorResult] = await tenantPool.execute(
      `INSERT INTO doctors (platform_doctor_id, name, email, phone, specialization, qualifications, bio, consultation_fee, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [tenantUserId, name, email, phone || null, specialization || null, qualifications || null, bio || null, consultation_fee || null]
    );

    // Update tenant_users with doctor_id reference
    await platformPool.execute(
      'UPDATE tenant_users SET doctor_id = ? WHERE id = ?',
      [doctorResult.insertId, tenantUserId]
    );

    res.status(201).json({
      success: true,
      doctor: {
        id: doctorResult.insertId,
        platform_doctor_id: tenantUserId,
        name,
        email,
        phone,
        specialization,
        qualifications,
        bio,
        consultation_fee,
        is_active: true
      }
    });

  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

/**
 * PUT /api/doctors/:id
 * Update a doctor's details
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantCode = req.headers['x-tenant-code'] || req.query.tenantCode;
    const { name, email, phone, password, specialization, qualifications, bio, consultation_fee, is_active } = req.body;

    if (!tenantCode) {
      return res.status(400).json({ error: 'Tenant code is required' });
    }

    // Get tenant info
    const [tenants] = await platformPool.execute(
      'SELECT * FROM tenants WHERE tenant_code = ? AND status = ?',
      [tenantCode, 'active']
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = tenants[0];

    // Get doctor from tenant database
    const tenantPool = await getTenantPool(tenantCode);
    const [doctors] = await tenantPool.execute(
      'SELECT * FROM doctors WHERE id = ?',
      [id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = doctors[0];

    // Update doctor in tenant's doctors table
    await tenantPool.execute(
      `UPDATE doctors SET 
        name = ?, email = ?, phone = ?, specialization = ?, 
        qualifications = ?, bio = ?, consultation_fee = ?, is_active = ?
       WHERE id = ?`,
      [
        name || doctor.name,
        email || doctor.email,
        phone !== undefined ? phone : doctor.phone,
        specialization !== undefined ? specialization : doctor.specialization,
        qualifications !== undefined ? qualifications : doctor.qualifications,
        bio !== undefined ? bio : doctor.bio,
        consultation_fee !== undefined ? consultation_fee : doctor.consultation_fee,
        is_active !== undefined ? is_active : doctor.is_active,
        id
      ]
    );

    // Update corresponding tenant_user if exists
    if (doctor.platform_doctor_id) {
      const updates = [];
      const values = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone);
      }
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        updates.push('password_hash = ?');
        values.push(passwordHash);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(is_active);
      }

      if (updates.length > 0) {
        values.push(doctor.platform_doctor_id);
        await platformPool.execute(
          `UPDATE tenant_users SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }
    }

    res.json({ success: true, message: 'Doctor updated successfully' });

  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

/**
 * DELETE /api/doctors/:id
 * Delete a doctor (soft delete by setting is_active = false)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantCode = req.headers['x-tenant-code'] || req.query.tenantCode;

    if (!tenantCode) {
      return res.status(400).json({ error: 'Tenant code is required' });
    }

    // Get tenant info
    const [tenants] = await platformPool.execute(
      'SELECT * FROM tenants WHERE tenant_code = ? AND status = ?',
      [tenantCode, 'active']
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Get doctor from tenant database
    const tenantPool = await getTenantPool(tenantCode);
    const [doctors] = await tenantPool.execute(
      'SELECT * FROM doctors WHERE id = ?',
      [id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = doctors[0];

    // Soft delete - set is_active = false
    await tenantPool.execute(
      'UPDATE doctors SET is_active = FALSE WHERE id = ?',
      [id]
    );

    // Also deactivate the tenant_user
    if (doctor.platform_doctor_id) {
      await platformPool.execute(
        'UPDATE tenant_users SET is_active = FALSE WHERE id = ?',
        [doctor.platform_doctor_id]
      );
    }

    res.json({ success: true, message: 'Doctor deactivated successfully' });

  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

export default router;
