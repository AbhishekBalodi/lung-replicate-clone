import { Router } from 'express';
import { getPool } from '../lib/tenant-db.js';
import { platformPool } from '../lib/platform-db.js';

const router = Router();

/**
 * POST /api/auth/login
 * body: { email, password, loginType }
 *
 * loginType:
 *  - admin
 *  - super_admin
 *  - patient
 */
router.post('/login', async (req, res) => {
  const { email, password, loginType } = req.body;

  if (!email || !password || !loginType) {
    return res.status(400).json({ error: 'Email, password, and loginType are required' });
  }

  try {
    const tenantPool = getPool(req);

    /* ============================================================
       🔐 ADMIN LOGIN (TENANT USERS)
       ============================================================ */
    if (loginType === 'admin') {
      if (!req.tenant) {
        return res.status(400).json({ error: 'Tenant context missing' });
      }

      const [users] = await platformPool.execute(
        `SELECT tu.*, t.name AS tenant_name
         FROM tenant_users tu
         JOIN tenants t ON tu.tenant_id = t.id
         WHERE tu.email = ? AND tu.tenant_id = ? AND tu.status = 'active'
         LIMIT 1`,
        [email.trim(), req.tenant.id]
      );

      if (!users.length) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      const user = users[0];
      const bcrypt = await import('bcryptjs');
      const valid = await bcrypt.compare(password, user.password_hash);

      if (!valid) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.full_name || 'Admin',
        role: user.role,
        userType: 'admin',
        tenantId: req.tenant.id,
        tenantName: user.tenant_name,
      };

      return res.json({
        success: true,
        userType: 'admin',
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name || 'Admin',
          role: user.role,
          tenantId: req.tenant.id,
          tenantName: user.tenant_name,
        },
      });
    }

    /* ============================================================
       👑 SUPER ADMIN LOGIN (PLATFORM)
       ============================================================ */
    if (loginType === 'super_admin') {
      const [rows] = await platformPool.execute(
        `SELECT * FROM platform_users WHERE email = ? AND status = 'active' LIMIT 1`,
        [email.trim()]
      );

      if (!rows.length) {
        return res.status(401).json({ error: 'Invalid super admin credentials' });
      }

      const user = rows[0];
      const bcrypt = await import('bcryptjs');
      const valid = await bcrypt.compare(password, user.password_hash);

      if (!valid) {
        return res.status(401).json({ error: 'Invalid super admin credentials' });
      }

      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.full_name || 'Super Admin',
        role: 'super_admin',
        userType: 'super_admin',
      };

      return res.json({
        success: true,
        userType: 'super_admin',
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name || 'Super Admin',
          role: 'super_admin',
        },
      });
    }

    /* ============================================================
       🧑‍⚕️ PATIENT LOGIN (EMAIL + PHONE)
       ============================================================ */
    if (loginType === 'patient') {
      const [patients] = await tenantPool.execute(
        `SELECT * FROM patients 
         WHERE email = ? AND phone = ?
         LIMIT 1`,
        [email.trim(), password.trim()]
      );

      if (!patients.length) {
        return res.status(401).json({
          error: 'Invalid patient credentials. Use the email and phone number used during appointment booking.',
        });
      }

      const patient = patients[0];

      req.session.user = {
        id: patient.id,
        email: patient.email,
        phone: patient.phone,
        name: patient.full_name,
        role: 'patient',
        userType: 'patient',
        tenantId: req.tenant?.id || null,
      };

      return res.json({
        success: true,
        userType: 'patient',
        user: {
          id: patient.id,
          email: patient.email,
          phone: patient.phone,
          name: patient.full_name,
          role: 'patient',
        },
      });
    }

    return res.status(400).json({ error: 'Invalid login type' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/* ============================================================
   🚪 LOGOUT
   ============================================================ */
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('saas.sid');
    res.json({ success: true });
  });
});

export default router;
