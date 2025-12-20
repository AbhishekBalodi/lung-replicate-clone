import { Router } from 'express';
import { getPool } from '../lib/tenant-db.js';
import { platformPool } from '../lib/platform-db.js';

const router = Router();

/**
 * POST /api/auth/login
 * body: { email, password, loginType: 'admin' | 'patient' }
 * 
 * For multi-tenant: Admin credentials come from tenant_users table in platform DB
 */
router.post('/login', async (req, res) => {
  const { email, password, loginType } = req.body;

  if (!email || !password || !loginType) {
    return res.status(400).json({ error: 'Email, password, and loginType are required' });
  }

  try {
    const pool = getPool(req);

    if (loginType === 'admin') {
      // Check if we have a tenant context
      if (req.tenant) {
        // Multi-tenant mode: Check tenant_users table
        const [users] = await platformPool.execute(
          `SELECT tu.*, t.name as tenant_name 
           FROM tenant_users tu 
           JOIN tenants t ON tu.tenant_id = t.id 
           WHERE tu.email = ? AND tu.tenant_id = ? AND tu.status = 'active'`,
          [email.trim(), req.tenant.id]
        );

        if (users.length === 0) {
          return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        const user = users[0];
        
        // For now, simple password check (in production, use bcrypt)
        // The password should be hashed in tenant_users table
        const bcrypt = await import('bcryptjs');
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        return res.json({
          success: true,
          userType: 'admin',
          user: {
            id: user.id,
            email: user.email,
            name: user.full_name || 'Admin',
            role: user.role,
            tenantId: req.tenant.id,
            tenantName: user.tenant_name
          }
        });
      } else {
        // Fallback for development without tenant context (Doctor Mann)
        const ADMIN_EMAIL = 'abhishekbalodi729@gmail.com';
        const ADMIN_PASSWORD = '9560720890';

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return res.json({
            success: true,
            userType: 'admin',
            user: {
              email: ADMIN_EMAIL,
              name: 'Admin',
              role: 'admin'
            }
          });
        } else {
          return res.status(401).json({ error: 'Invalid admin credentials' });
        }
      }
    } else if (loginType === 'patient') {
      // Patient login - check appointments table (email + phone as password)
      const [rows] = await pool.execute(
        'SELECT * FROM appointments WHERE email = ? AND phone = ? LIMIT 1',
        [email.trim(), password.trim()]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid patient credentials. Please use your email and phone number.' });
      }

      const patient = rows[0];

      // Get patient ID from patients table
      const [patientRows] = await pool.execute(
        'SELECT id FROM patients WHERE email = ? AND phone = ? LIMIT 1',
        [email.trim(), password.trim()]
      );

      let patientId = null;
      if (patientRows.length > 0) {
        patientId = patientRows[0].id;
      }

      return res.json({
        success: true,
        userType: 'patient',
        user: {
          id: patientId,
          email: patient.email,
          phone: patient.phone,
          name: patient.full_name,
          role: 'patient'
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid login type' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
