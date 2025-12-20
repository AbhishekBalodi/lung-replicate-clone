import { Router } from 'express';
import bcrypt from 'bcrypt';
import { platformPool } from '../lib/platform-db.js';

const router = Router();

/**
 * POST /api/platform/auth/login
 * Platform admin login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [admins] = await platformPool.execute(
      'SELECT * FROM platform_admins WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = admins[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await platformPool.execute(
      'UPDATE platform_admins SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    res.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        userType: 'platform_admin'
      }
    });

  } catch (error) {
    console.error('Platform login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/platform/auth/tenant-login
 * Tenant user login (Super Admin / Admin / Patient)
 */
router.post('/tenant-login', async (req, res) => {
  try {
    const { email, password, phone, tenantCode } = req.body;

    // If no tenant code, fall back to legacy Doctor Mann authentication
    if (!tenantCode) {
      // Legacy fallback for Doctor Mann (original system before SaaS)
      const LEGACY_ADMIN_EMAIL = 'abhishekbalodi729@gmail.com';
      const LEGACY_ADMIN_PASSWORD = '9560720890';

      if (email && password) {
        // Admin login for legacy Doctor Mann
        if (email === LEGACY_ADMIN_EMAIL && password === LEGACY_ADMIN_PASSWORD) {
          return res.json({
            success: true,
            user: {
              id: null,
              email: LEGACY_ADMIN_EMAIL,
              name: 'Dr. Mann Admin',
              role: 'super_admin',
              phone: '',
              userType: 'legacy_admin'
            },
            tenant: {
              id: 0,
              code: 'doctor_mann',
              name: 'Dr. Mann Clinic',
              type: 'doctor'
            }
          });
        }
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (email && phone) {
        // Patient login for legacy Doctor Mann - check Doctor_Mann database
        const legacyPool = (await import('../lib/db.js')).pool;
        const [rows] = await legacyPool.execute(
          'SELECT * FROM appointments WHERE email = ? AND phone = ? LIMIT 1',
          [email.trim(), phone.trim()]
        );

        if (rows.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials. Use your email and phone number.' });
        }

        const patient = rows[0];
        return res.json({
          success: true,
          user: {
            id: null,
            email: patient.email,
            name: patient.full_name,
            role: 'patient',
            phone: patient.phone,
            userType: 'legacy_patient'
          },
          tenant: {
            id: 0,
            code: 'doctor_mann',
            name: 'Dr. Mann Clinic',
            type: 'doctor'
          }
        });
      }

      return res.status(400).json({ error: 'Email and password (or phone for patients) are required' });
    }

    // Get tenant
    const [tenants] = await platformPool.execute(
      'SELECT * FROM tenants WHERE tenant_code = ? AND status = ?',
      [tenantCode, 'active']
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant not found or inactive' });
    }

    const tenant = tenants[0];

    // Check for admin/super_admin login (email + password)
    if (email && password) {
      const [users] = await platformPool.execute(
        `SELECT * FROM tenant_users 
         WHERE tenant_id = ? AND email = ? AND role IN ('super_admin', 'admin') AND is_active = TRUE`,
        [tenant.id, email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await platformPool.execute(
        'UPDATE tenant_users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );

      // Get doctor info if applicable
      let doctorInfo = null;
      if (user.doctor_id) {
        const [doctors] = await platformPool.execute(
          'SELECT * FROM hospital_doctors WHERE id = ?',
          [user.doctor_id]
        );
        if (doctors.length > 0) {
          doctorInfo = doctors[0];
        }
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          doctorId: user.doctor_id,
          doctorInfo,
          userType: 'tenant_user'
        },
        tenant: {
          id: tenant.id,
          code: tenant.tenant_code,
          name: tenant.name,
          type: tenant.type
        }
      });
    }

    // Check for patient login (email + phone)
    if (email && phone) {
      const [users] = await platformPool.execute(
        `SELECT * FROM tenant_users 
         WHERE tenant_id = ? AND email = ? AND phone = ? AND role = 'patient' AND is_active = TRUE`,
        [tenant.id, email.trim(), phone.trim()]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials. Use your email and phone number.' });
      }

      const user = users[0];

      // Update last login
      await platformPool.execute(
        'UPDATE tenant_users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          userType: 'patient'
        },
        tenant: {
          id: tenant.id,
          code: tenant.tenant_code,
          name: tenant.name,
          type: tenant.type
        }
      });
    }

    return res.status(400).json({ error: 'Email and password (or phone for patients) are required' });

  } catch (error) {
    console.error('Tenant login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/platform/auth/create-admin
 * Create a new platform admin (super_admin only)
 */
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    // TODO: Add authentication middleware to verify caller is super_admin

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const [existing] = await platformPool.execute(
      'SELECT id FROM platform_admins WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await platformPool.execute(
      `INSERT INTO platform_admins (email, password_hash, name, role) VALUES (?, ?, ?, ?)`,
      [email, passwordHash, name, role || 'support']
    );

    res.status(201).json({
      success: true,
      admin: {
        id: result.insertId,
        email,
        name,
        role: role || 'support'
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

export default router;
