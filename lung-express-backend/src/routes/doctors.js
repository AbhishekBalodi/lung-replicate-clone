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
    return res.status(403).json({
      error: 'This operation is only allowed for hospital tenants'
    });
  }
  next();
}

/**
 * GET /api/doctors
 * Hospital: list doctors
 */
router.get('/', hospitalOnly, async (req, res) => {
  try {
    const tenantPool = getTenantPool(req);

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
 * Hospital: create doctor
 */
router.post('/', hospitalOnly, async (req, res) => {
  try {
    const tenantPool = getTenantPool(req);
    const {
      name,
      email,
      phone,
      password,
      specialization,
      qualifications,
      bio,
      consultation_fee
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    /**
     * 1️⃣ Check email uniqueness globally (platform DB)
     */
    const [existingUsers] = await platformPool.execute(
      'SELECT id FROM tenant_users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: 'A user with this email already exists'
      });
    }

    /**
     * 2️⃣ Create platform user
     */
    const passwordHash = await bcrypt.hash(password, 10);

    const [userResult] = await platformPool.execute(
  `
  INSERT INTO tenant_users
  (tenant_id, email, password_hash, name, phone, role, is_active)
  VALUES (?, ?, ?, ?, ?, 'admin', TRUE)
  `,
  [
    req.tenant.id,
    email,
    passwordHash,
    name,
    phone || null
  ]
);


    const tenantUserId = userResult.insertId;

    /**
     * 3️⃣ Create doctor inside HOSPITAL tenant DB
     */
    const [doctorResult] = await tenantPool.execute(
      `
      INSERT INTO doctors
      (platform_doctor_id, name, email, phone, specialization, qualifications, bio, consultation_fee, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `,
      [
        tenantUserId,
        name,
        email,
        phone || null,
        specialization || null,
        qualifications || null,
        bio || null,
        consultation_fee || null
      ]
    );

    /**
     * 4️⃣ Link tenant_user → doctor
     */
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
 * Hospital: update doctor
 */
router.put('/:id', hospitalOnly, async (req, res) => {
  try {
    const tenantPool = getTenantPool(req);
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      password,
      specialization,
      qualifications,
      bio,
      consultation_fee,
      is_active
    } = req.body;

    const [doctors] = await tenantPool.execute(
      'SELECT * FROM doctors WHERE id = ?',
      [id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = doctors[0];

    await tenantPool.execute(
      `
      UPDATE doctors SET
        name = ?,
        email = ?,
        phone = ?,
        specialization = ?,
        qualifications = ?,
        bio = ?,
        consultation_fee = ?,
        is_active = ?
      WHERE id = ?
      `,
      [
        name ?? doctor.name,
        email ?? doctor.email,
        phone ?? doctor.phone,
        specialization ?? doctor.specialization,
        qualifications ?? doctor.qualifications,
        bio ?? doctor.bio,
        consultation_fee ?? doctor.consultation_fee,
        is_active ?? doctor.is_active,
        id
      ]
    );

    /**
     * Sync platform user
     */
    if (doctor.platform_doctor_id) {
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
        values.push(doctor.platform_doctor_id);
        await platformPool.execute(
          `UPDATE tenant_users SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

/**
 * DELETE /api/doctors/:id
 * Hospital: deactivate doctor
 */
router.delete('/:id', hospitalOnly, async (req, res) => {
  try {
    const tenantPool = getTenantPool(req);
    const { id } = req.params;

    const [doctors] = await tenantPool.execute(
      'SELECT * FROM doctors WHERE id = ?',
      [id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = doctors[0];

    await tenantPool.execute(
      'UPDATE doctors SET is_active = FALSE WHERE id = ?',
      [id]
    );

    if (doctor.platform_doctor_id) {
      await platformPool.execute(
        'UPDATE tenant_users SET is_active = FALSE WHERE id = ?',
        [doctor.platform_doctor_id]
      );
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

export default router;
