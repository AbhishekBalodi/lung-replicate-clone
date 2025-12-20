import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { 
  platformPool, 
  createTenantSchema, 
  generateTenantCode, 
  generateVerificationToken 
} from '../lib/platform-db.js';

const router = Router();

// Validation schema for tenant registration
const tenantSchema = z.object({
  name: z.string().min(2).max(255),
  type: z.enum(['hospital', 'doctor']),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  customDomain: z.string().max(255).optional(),
  // Admin user details
  adminName: z.string().min(2).max(255),
  adminEmail: z.string().email().max(255),
  adminPassword: z.string().min(8).max(100),
  adminPhone: z.string().max(20).optional(),
});

/**
 * POST /api/tenants/register
 * Register a new tenant (hospital or doctor)
 */
router.post('/register', async (req, res) => {
  try {
    const data = tenantSchema.parse(req.body);
    
    // Check if email already exists
    const [existing] = await platformPool.execute(
      'SELECT id FROM tenants WHERE email = ?',
      [data.email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A tenant with this email already exists' });
    }

    // Generate unique tenant code
    const tenantCode = await generateTenantCode(data.name, data.type);
    
    // Start transaction
    const connection = await platformPool.getConnection();
    await connection.beginTransaction();

    try {
      // Create tenant record
      const [tenantResult] = await connection.execute(
        `INSERT INTO tenants (tenant_code, name, type, email, phone, address, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [tenantCode, data.name, data.type, data.email, data.phone || null, data.address || null]
      );
      
      const tenantId = tenantResult.insertId;

      // Create default settings
      await connection.execute(
        `INSERT INTO tenant_settings (tenant_id, clinic_email, clinic_phone) VALUES (?, ?, ?)`,
        [tenantId, data.email, data.phone || null]
      );

      // Hash password and create admin user
      const passwordHash = await bcrypt.hash(data.adminPassword, 10);
      const adminRole = data.type === 'hospital' ? 'super_admin' : 'admin';
      
      await connection.execute(
        `INSERT INTO tenant_users (tenant_id, email, password_hash, phone, name, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tenantId, data.adminEmail, passwordHash, data.adminPhone || null, data.adminName, adminRole]
      );

      // Add custom domain if provided
      let domainInfo = null;
      if (data.customDomain) {
        const verificationToken = generateVerificationToken();
        await connection.execute(
          `INSERT INTO tenant_domains (tenant_id, domain, is_primary, verification_token) 
           VALUES (?, ?, TRUE, ?)`,
          [tenantId, data.customDomain, verificationToken]
        );
        domainInfo = {
          domain: data.customDomain,
          verificationToken,
          verificationStatus: 'pending'
        };
      }

      // Create tenant database schema with appropriate template
      await createTenantSchema(tenantCode, data.type);

      // Activate tenant
      await connection.execute(
        `UPDATE tenants SET status = 'active' WHERE id = ?`,
        [tenantId]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Tenant registered successfully',
        tenant: {
          id: tenantId,
          tenantCode,
          name: data.name,
          type: data.type,
          email: data.email,
          status: 'active'
        },
        domain: domainInfo,
        nextSteps: domainInfo ? [
          `Add a TXT record to your DNS: _saas-verify.${data.customDomain} = ${domainInfo.verificationToken}`,
          'Once verified, your website will be live at your custom domain'
        ] : [
          'Your website is ready! You can add a custom domain later from settings.'
        ]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Tenant registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * GET /api/tenants
 * List all tenants (platform admin only)
 */
router.get('/', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    
    let query = `
      SELECT t.*, 
             (SELECT domain FROM tenant_domains WHERE tenant_id = t.id AND is_primary = TRUE LIMIT 1) as primary_domain,
             (SELECT COUNT(*) FROM tenant_users WHERE tenant_id = t.id) as user_count
      FROM tenants t 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (t.name LIKE ? OR t.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await platformPool.execute(query, params);
    res.json({ tenants: rows });

  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

/**
 * GET /api/tenants/:id
 * Get single tenant details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [tenants] = await platformPool.execute(
      'SELECT * FROM tenants WHERE id = ?',
      [id]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const [domains] = await platformPool.execute(
      'SELECT * FROM tenant_domains WHERE tenant_id = ?',
      [id]
    );

    const [users] = await platformPool.execute(
      'SELECT id, email, name, role, is_active, last_login, created_at FROM tenant_users WHERE tenant_id = ?',
      [id]
    );

    const [settings] = await platformPool.execute(
      'SELECT * FROM tenant_settings WHERE tenant_id = ?',
      [id]
    );

    res.json({
      tenant: tenants[0],
      domains,
      users,
      settings: settings[0] || null
    });

  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

/**
 * POST /api/tenants/:id/domains
 * Add a custom domain to tenant
 */
router.post('/:id/domains', async (req, res) => {
  try {
    const { id } = req.params;
    const { domain, isPrimary } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // Check if domain already exists
    const [existing] = await platformPool.execute(
      'SELECT id FROM tenant_domains WHERE domain = ?',
      [domain]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'This domain is already registered' });
    }

    const verificationToken = generateVerificationToken();

    // If setting as primary, unset other primary domains
    if (isPrimary) {
      await platformPool.execute(
        'UPDATE tenant_domains SET is_primary = FALSE WHERE tenant_id = ?',
        [id]
      );
    }

    await platformPool.execute(
      `INSERT INTO tenant_domains (tenant_id, domain, is_primary, verification_token) 
       VALUES (?, ?, ?, ?)`,
      [id, domain, isPrimary || false, verificationToken]
    );

    res.status(201).json({
      success: true,
      domain,
      verificationToken,
      instructions: [
        `Add a TXT record to your DNS:`,
        `Host: _saas-verify.${domain}`,
        `Value: ${verificationToken}`,
        'DNS changes may take up to 48 hours to propagate.'
      ]
    });

  } catch (error) {
    console.error('Error adding domain:', error);
    res.status(500).json({ error: 'Failed to add domain' });
  }
});

/**
 * POST /api/tenants/:id/domains/:domainId/verify
 * Verify domain ownership via DNS
 */
router.post('/:id/domains/:domainId/verify', async (req, res) => {
  try {
    const { id, domainId } = req.params;

    const [domains] = await platformPool.execute(
      'SELECT * FROM tenant_domains WHERE id = ? AND tenant_id = ?',
      [domainId, id]
    );

    if (domains.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    const domain = domains[0];

    // In production, you would verify the DNS TXT record here
    // For now, we'll simulate verification
    // const dns = await import('dns').then(m => m.promises);
    // const records = await dns.resolveTxt(`_saas-verify.${domain.domain}`);
    // const verified = records.flat().includes(domain.verification_token);

    // Simulate verification (in production, implement actual DNS check)
    const verified = true; // Replace with actual DNS verification

    if (verified) {
      await platformPool.execute(
        `UPDATE tenant_domains 
         SET verification_status = 'verified', verified_at = NOW() 
         WHERE id = ?`,
        [domainId]
      );

      res.json({
        success: true,
        message: 'Domain verified successfully',
        domain: domain.domain
      });
    } else {
      await platformPool.execute(
        `UPDATE tenant_domains SET verification_status = 'failed' WHERE id = ?`,
        [domainId]
      );

      res.status(400).json({
        error: 'Domain verification failed',
        message: 'DNS TXT record not found. Please ensure the record is correctly configured.'
      });
    }

  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * PATCH /api/tenants/:id/status
 * Update tenant status (activate/suspend)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await platformPool.execute(
      'UPDATE tenants SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true, status });

  } catch (error) {
    console.error('Error updating tenant status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

/**
 * POST /api/tenants/:id/doctors
 * Add a doctor to hospital tenant
 */
router.post('/:id/doctors', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, qualifications, bio, consultationFee, password } = req.body;

    // Verify tenant is a hospital
    const [tenants] = await platformPool.execute(
      'SELECT type FROM tenants WHERE id = ?',
      [id]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (tenants[0].type !== 'hospital') {
      return res.status(400).json({ error: 'Only hospital tenants can have multiple doctors' });
    }

    const connection = await platformPool.getConnection();
    await connection.beginTransaction();

    try {
      // Add to hospital_doctors
      const [doctorResult] = await connection.execute(
        `INSERT INTO hospital_doctors (tenant_id, name, email, phone, specialization, qualifications, bio, consultation_fee) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, email, phone || null, specialization || null, qualifications || null, bio || null, consultationFee || null]
      );

      const doctorId = doctorResult.insertId;

      // Create user account for doctor if password provided
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await connection.execute(
          `INSERT INTO tenant_users (tenant_id, email, password_hash, phone, name, role, doctor_id) 
           VALUES (?, ?, ?, ?, ?, 'admin', ?)`,
          [id, email, passwordHash, phone || null, name, doctorId]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        doctor: {
          id: doctorId,
          name,
          email,
          specialization
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({ error: 'Failed to add doctor' });
  }
});

/**
 * GET /api/tenants/:id/doctors
 * List doctors in a hospital tenant
 */
router.get('/:id/doctors', async (req, res) => {
  try {
    const { id } = req.params;

    const [doctors] = await platformPool.execute(
      'SELECT * FROM hospital_doctors WHERE tenant_id = ? AND is_active = TRUE ORDER BY name',
      [id]
    );

    res.json({ doctors });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

export default router;
