import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
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

      // After commit: handle optional base64 uploads and metadata (if present in the registration request)
      try {
        // Helper to write base64 image (data URL or raw base64)
        const writeBase64Image = (base64Str, outPath) => {
          if (!base64Str) return false;
          // strip data:*/*;base64, if present
          const match = base64Str.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/);
          let buffer;
          if (match) {
            buffer = Buffer.from(match[3], 'base64');
          } else {
            // assume raw base64
            buffer = Buffer.from(base64Str, 'base64');
          }
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, buffer);
          return true;
        };

        const tenantAssetsDir = path.join(process.cwd(), 'public', 'tenants', tenantCode);
        fs.mkdirSync(tenantAssetsDir, { recursive: true });

        // Doctor-specific metadata
        const updates = [];
        const updateValues = [];

        if (req.body.doctorBio) { updates.push('doctor_bio = ?'); updateValues.push(req.body.doctorBio); }
        if (req.body.doctorSpecialty) { updates.push('doctor_specialty = ?'); updateValues.push(req.body.doctorSpecialty); }
        if (req.body.doctorDegrees) { updates.push('doctor_degrees = ?'); updateValues.push(req.body.doctorDegrees); }
        if (req.body.doctorAwards) { updates.push('doctor_awards = ?'); updateValues.push(req.body.doctorAwards); }
        if (req.body.doctorYearsExperience) { updates.push('doctor_years_experience = ?'); updateValues.push(req.body.doctorYearsExperience); }
        if (req.body.doctorAge) { updates.push('doctor_age = ?'); updateValues.push(req.body.doctorAge); }
        if (req.body.doctorGender) { updates.push('doctor_gender = ?'); updateValues.push(req.body.doctorGender); }

        // Doctor photo
        if (req.body.doctorPhotoBase64) {
          // determine extension from data URL
          const m = req.body.doctorPhotoBase64.match(/^data:image\/(png|jpeg|jpg);base64,/);
          const ext = m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'jpg';
          const fileName = `doctor_photo.${ext}`;
          const outPath = path.join(tenantAssetsDir, fileName);
          const wrote = writeBase64Image(req.body.doctorPhotoBase64, outPath);
          if (wrote) {
            const publicPath = `/tenants/${tenantCode}/${fileName}`;
            updates.push('doctor_photo_url = ?'); updateValues.push(publicPath);
          }
        }

        // Hospital logo
        if (req.body.logoBase64) {
          const m = req.body.logoBase64.match(/^data:image\/(png|jpeg|jpg);base64,/);
          const ext = m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'png';
          const fileName = `logo.${ext}`;
          const outPath = path.join(tenantAssetsDir, fileName);
          const wrote = writeBase64Image(req.body.logoBase64, outPath);
          if (wrote) {
            const publicPath = `/tenants/${tenantCode}/${fileName}`;
            await connection.execute('UPDATE tenants SET logo_url = ? WHERE id = ?', [publicPath, tenantId]);
          }
        }

        // Hospital hero
        if (req.body.heroBase64) {
          const m = req.body.heroBase64.match(/^data:image\/(png|jpeg|jpg);base64,/);
          const ext = m ? (m[1] === 'jpeg' ? 'jpg' : m[1]) : 'jpg';
          const fileName = `hero.${ext}`;
          const outPath = path.join(tenantAssetsDir, fileName);
          const wrote = writeBase64Image(req.body.heroBase64, outPath);
          if (wrote) {
            const publicPath = `/tenants/${tenantCode}/${fileName}`;
            await connection.execute('UPDATE tenants SET hero_image_url = ? WHERE id = ?', [publicPath, tenantId]);
          }
        }

        // If there are tenant-level updates (doctor metadata), persist them
        if (updates.length > 0) {
          updateValues.push(tenantId);
          await platformPool.execute(`UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`, updateValues);
        }

      } catch (err) {
        // Don't fail registration if asset write fails; log and continue
        console.error('Warning: failed to write registration-supplied assets:', err);
      }

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
 * PATCH /api/tenants/:id
 * Update tenant basic details (name, email, phone, address)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body || {};
    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { fields.push('address = ?'); values.push(address); }

    if (!fields.length) return res.status(400).json({ error: 'No valid fields to update' });

    values.push(id);
    await platformPool.execute(`UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating tenant:', err);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// -------------------------
// Tenant asset upload
// -------------------------

// Middleware: ensure the logged in user is an admin for this tenant
function ensureTenantAdmin(req, res, next) {
  const sessionUser = req.session?.user;
  if (!sessionUser) return res.status(401).json({ error: 'Unauthorized' });
  if (sessionUser.role !== 'admin' && sessionUser.role !== 'super_admin') return res.status(403).json({ error: 'Forbidden' });
  if (sessionUser.tenantId && String(sessionUser.tenantId) !== String(req.params.id)) return res.status(403).json({ error: 'Tenant mismatch' });
  next();
}

// multer storage for tenant assets
const tenantStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // resolve tenant code to folder name
      const tenantId = req.params.id;
      const [rows] = req.platformPool ? undefined : [];
      // Fetch tenant code from DB
      // We'll query the platform DB
      platformPool.execute('SELECT tenant_code FROM tenants WHERE id = ? LIMIT 1', [tenantId])
        .then(([rows]) => {
          const tenantCode = (rows && rows[0] && rows[0].tenant_code) || 'doctor_mann';
          const dest = path.join(process.cwd(), 'public', 'tenants', tenantCode);
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        }).catch(err => cb(err));
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const assetType = req.body.assetType || 'asset';
    const ext = path.extname(file.originalname) || '.jpg';
    const fileName = `${assetType}${ext}`;
    cb(null, fileName);
  }
});

const tenantUpload = multer({
  storage: tenantStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only JPG and PNG files are allowed'));
    cb(null, true);
  }
});

/**
 * POST /api/tenants/:id/assets
 * Upload an asset for tenant (logo, doctor_photo, hero, gallery)
 * body: assetType (string), file: single file
 */
router.post('/:id/assets', ensureTenantAdmin, tenantUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { id } = req.params;
    const assetType = req.body.assetType || 'asset';

    // determine public URL
    // fetch tenant_code
    const [rows] = await platformPool.execute('SELECT tenant_code FROM tenants WHERE id = ? LIMIT 1', [id]);
    const tenantCode = (rows && rows[0] && rows[0].tenant_code) || 'doctor_mann';

    const publicPath = `/tenants/${tenantCode}/${req.file.filename}`;

    // Run stricter validation + image processing (resize, convert, quality)
    try {
      // Use sharp to validate and resize
      const imagePath = path.join(process.cwd(), 'public', 'tenants', tenantCode, req.file.filename);
      const sharpImg = sharp(imagePath);
      const meta = await sharpImg.metadata();
      // Basic checks
      if (!meta || !meta.format || !['jpeg','png','jpg','webp'].includes(meta.format)) {
        // remove file
        try{ fs.unlinkSync(imagePath); }catch(e){}
        return res.status(400).json({ error: 'Uploaded file is not a valid image' });
      }

      // Determine target size based on assetType
      let resizeOptions = { width: 1200, height: null };
      if (assetType === 'logo') resizeOptions = { width: 600, height: null };
      if (assetType === 'doctor_photo') resizeOptions = { width: 600, height: 600 };
      if (assetType === 'hero') resizeOptions = { width: 1600, height: 600 };

      // Prevent extremely large images
      const MAX_DIMENSION = 4000;
      if ((meta.width && meta.width > MAX_DIMENSION) || (meta.height && meta.height > MAX_DIMENSION)) {
        // downsize aggressively
        resizeOptions = { width: 1600, height: null };
      }

      // Perform resize and convert to jpeg for consistency (preserve PNG if it has transparency)
      const isPng = meta.format === 'png';
      if (isPng) {
        await sharpImg.resize(resizeOptions.width, resizeOptions.height, { fit: 'cover' }).png({ quality: 90 }).toFile(imagePath + '.tmp');
      } else {
        await sharpImg.resize(resizeOptions.width, resizeOptions.height, { fit: assetType === 'doctor_photo' ? 'cover' : 'inside' }).jpeg({ quality: 85 }).toFile(imagePath + '.tmp');
      }

      // Replace original file
      try{ fs.unlinkSync(imagePath); }catch(e){}
      fs.renameSync(imagePath + '.tmp', imagePath);

    } catch (err) {
      console.error('Image processing failed:', err);
      try{ fs.unlinkSync(path.join(process.cwd(), 'public', 'tenants', tenantCode, req.file.filename)); }catch(e){}
      return res.status(500).json({ error: 'Image processing failed' });
    }

    // Map common asset types to tenant columns
    const columnMap = {
      logo: 'logo_url',
      doctor_photo: 'doctor_photo_url',
      hero: 'hero_image_url'
    };

    const column = columnMap[assetType] || null;

    if (column) {
      await platformPool.execute(`UPDATE tenants SET ${column} = ? WHERE id = ?`, [publicPath, id]);
    }

    res.json({ success: true, path: publicPath });
  } catch (err) {
    console.error('Error uploading tenant asset:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * PATCH /api/tenants/:id/users/:userId
 * Update tenant user details (email, name, phone, is_active, password)
 */
router.patch('/:id/users/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { email, name, phone, is_active, password } = req.body || {};
    const updates = [];
    const values = [];

    if (email) { updates.push('email = ?'); values.push(email); }
    if (name) { updates.push('name = ?'); values.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }

    // If password provided, hash and update
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(hash);
    }

    if (!updates.length) return res.status(400).json({ error: 'No valid fields to update' });

    values.push(userId);

    await platformPool.execute(`UPDATE tenant_users SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating tenant user:', err);
    res.status(500).json({ error: 'Failed to update tenant user' });
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

/**
 * PATCH /api/tenants/:id/doctors/:doctorId
 * Update metadata for a hospital doctor (platform table)
 */
router.patch('/:id/doctors/:doctorId', async (req, res) => {
  try {
    const { id, doctorId } = req.params;
    const {
      name,
      email,
      phone,
      specialization,
      qualifications,
      bio,
      consultation_fee,
      years_experience,
      degrees,
      awards,
      age,
      gender
    } = req.body || {};

    // verify tenant exists
    const [tenants] = await platformPool.execute('SELECT id FROM tenants WHERE id = ?', [id]);
    if (tenants.length === 0) return res.status(404).json({ error: 'Tenant not found' });

    // Fetch doctor
    const [doctors] = await platformPool.execute('SELECT * FROM hospital_doctors WHERE id = ? AND tenant_id = ?', [doctorId, id]);
    if (doctors.length === 0) return res.status(404).json({ error: 'Doctor not found for this tenant' });

    await platformPool.execute(
      `UPDATE hospital_doctors SET
         name = ?,
         email = ?,
         phone = ?,
         specialization = ?,
         qualifications = ?,
         bio = ?,
         consultation_fee = ?,
         years_experience = ?,
         degrees = ?,
         awards = ?,
         age = ?,
         gender = ?
       WHERE id = ? AND tenant_id = ?`,
      [
        name ?? doctors[0].name,
        email ?? doctors[0].email,
        phone ?? doctors[0].phone,
        specialization ?? doctors[0].specialization,
        qualifications ?? doctors[0].qualifications,
        bio ?? doctors[0].bio,
        consultation_fee ?? doctors[0].consultation_fee,
        years_experience ?? doctors[0].years_experience,
        degrees ? JSON.stringify(degrees) : doctors[0].degrees,
        awards ? JSON.stringify(awards) : doctors[0].awards,
        age ?? doctors[0].age,
        gender ?? doctors[0].gender,
        doctorId,
        id
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating hospital doctor:', err);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

/**
 * POST /api/tenants/:id/doctors/:doctorId/photo
 * Upload profile photo for a hospital doctor and update platform table
 */
const hospitalDoctorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const { id } = req.params;
      platformPool.execute('SELECT tenant_code FROM tenants WHERE id = ? LIMIT 1', [id])
        .then(([rows]) => {
          const tenantCode = (rows && rows[0] && rows[0].tenant_code) || 'doctor_mann';
          const dest = path.join(process.cwd(), 'public', 'tenants', tenantCode, 'hospital_doctors');
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        }).catch(err => cb(err));
    } catch (err) { cb(err); }
  },
  filename: (req, file, cb) => {
    const { doctorId } = req.params;
    const assetType = (req.body && req.body.assetType) || (req.query && req.query.assetType) || 'photo';
    const ext = path.extname(file.originalname) || '.jpg';
    const suffix = assetType === 'hero' ? '-hero' : '';
    cb(null, `${doctorId}${suffix}${ext}`);
  }
});

const hospitalDoctorUpload = multer({
  storage: hospitalDoctorStorage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only JPG and PNG files are allowed'));
    cb(null, true);
  }
});

router.post('/:id/doctors/:doctorId/photo', hospitalDoctorUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { id, doctorId } = req.params;
    const assetType = req.body.assetType || req.query.assetType || 'photo';

    // fetch tenant code
    const [rows] = await platformPool.execute('SELECT tenant_code FROM tenants WHERE id = ? LIMIT 1', [id]);
    const tenantCode = (rows && rows[0] && rows[0].tenant_code) || 'doctor_mann';
    const imagePath = path.join(process.cwd(), 'public', 'tenants', tenantCode, 'hospital_doctors', req.file.filename);

    // process with sharp
    try {
      const sharpImg = sharp(imagePath);
      const meta = await sharpImg.metadata();
      if (!meta || !meta.format || !['jpeg','png','jpg','webp'].includes(meta.format)) {
        try { fs.unlinkSync(imagePath); } catch (e) {}
        return res.status(400).json({ error: 'Uploaded file is not a valid image' });
      }

      // hero gets resized differently
      if (assetType === 'hero') {
        await sharpImg.resize(1600, 600, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(imagePath + '.tmp');
      } else {
        await sharpImg.resize(600, 600, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(imagePath + '.tmp');
      }

      try{ fs.unlinkSync(imagePath); }catch(e){}
      fs.renameSync(imagePath + '.tmp', imagePath);
    } catch (err) {
      console.error('Image processing failed:', err);
      try{ fs.unlinkSync(imagePath); }catch(e){}
      return res.status(500).json({ error: 'Image processing failed' });
    }

    const publicPath = `/tenants/${tenantCode}/hospital_doctors/${req.file.filename}`;

    // Update appropriate column
    if (assetType === 'hero') {
      await platformPool.execute('UPDATE hospital_doctors SET hero_image_url = ? WHERE id = ? AND tenant_id = ?', [publicPath, doctorId, id]);
    } else {
      await platformPool.execute('UPDATE hospital_doctors SET profile_photo_url = ? WHERE id = ? AND tenant_id = ?', [publicPath, doctorId, id]);
    }

    res.json({ success: true, photo_url: publicPath });
  } catch (err) {
    console.error('Error uploading hospital doctor photo:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * POST /api/tenants/:id/apply-hospital-schema
 * Re-apply hospital schema template to a tenant DB (adds missing tables)
 */
router.post('/:id/apply-hospital-schema', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch tenant
    const [tenants] = await platformPool.execute('SELECT * FROM tenants WHERE id = ?', [id]);
    if (tenants.length === 0) return res.status(404).json({ error: 'Tenant not found' });

    const tenant = tenants[0];
    if (tenant.type !== 'hospital') {
      return res.status(400).json({ error: 'This operation is only for hospital tenants' });
    }

    // Apply the hospital schema template to ensure missing tables are created
    await createTenantSchema(tenant.tenant_code, 'hospital');

    res.json({ success: true, message: 'Hospital schema applied to tenant (missing tables created)' });
  } catch (err) {
    console.error('Error applying hospital schema:', err);
    res.status(500).json({ error: 'Failed to apply schema', details: err.message });
  }
});

export default router;
