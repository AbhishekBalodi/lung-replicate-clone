import { getTenantPool } from './tenant-db.js';

/**
 * GET /api/dashboard/patient/doctors
 * Fetch all active doctors for appointment booking
 * Returns doctors with their specialties from the tenant database
 */
export async function getPatientDoctors(req, res) {
  try {
    const db = getTenantPool(req);
    const tenantType = req.tenant?.type;
    const tenantCode = req.tenant?.tenant_code || 'unknown';
    
    console.log(`📋 Fetching doctors for tenant: ${tenantCode}, type: ${tenantType}`);

    // Check if doctors table exists first
    const [tables] = await db.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'doctors'
    `);
    
    const hasDoctorsTable = tables.length > 0;
    console.log(`  └─ Has doctors table: ${hasDoctorsTable}`);

    if (hasDoctorsTable) {
      // Hospital tenant OR doctor tenant with doctors table
      // NOTE: some older schemas may not have profile_photo_url yet.
      // Make query schema-aware to prevent ER_BAD_FIELD_ERROR.
      const [columns] = await db.query(`
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'doctors'
      `);

      const colSet = new Set(columns.map((c) => c.COLUMN_NAME));
      const hasProfilePhotoUrl = colSet.has('profile_photo_url');

      const [doctors] = await db.query(`
        SELECT 
          id,
          name,
          specialization,
          qualifications,
          consultation_fee,
          ${hasProfilePhotoUrl ? 'profile_photo_url' : 'NULL'} AS profile_photo_url
        FROM doctors
        WHERE is_active = TRUE OR is_active IS NULL
        ORDER BY name ASC
      `);

      console.log(`  └─ Found ${doctors.length} doctors`);

      // Get unique specializations for filtering
      const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

      res.json({ 
        doctors, 
        specializations,
        tenantType: tenantType || 'doctor'
      });
    } else {
      // Individual doctor tenant - get doctor info from tenant_settings
      console.log(`  └─ No doctors table, trying tenant_settings`);
      
      const [[tenantSettings]] = await db.query(`
        SELECT 
          doctor_name,
          doctor_specialty,
          doctor_degrees,
          consultation_fee,
          doctor_photo
        FROM tenant_settings
        LIMIT 1
      `).catch(() => [[null]]);

      if (tenantSettings && tenantSettings.doctor_name) {
        console.log(`  └─ Found tenant settings doctor: ${tenantSettings.doctor_name}`);
        res.json({
          doctors: [{
            id: 1,
            name: tenantSettings.doctor_name,
            specialization: tenantSettings.doctor_specialty,
            qualifications: tenantSettings.doctor_degrees,
            consultation_fee: tenantSettings.consultation_fee,
            profile_photo_url: tenantSettings.doctor_photo
          }],
          specializations: tenantSettings.doctor_specialty ? [tenantSettings.doctor_specialty] : [],
          tenantType: 'doctor'
        });
      } else {
        console.log(`  └─ No tenant settings found, returning empty`);
        res.json({ 
          doctors: [], 
          specializations: [],
          tenantType: 'doctor'
        });
      }
    }
  } catch (error) {
    console.error('❌ Patient doctors error:', error);
    res.status(500).json({ error: 'Failed to load doctors' });
  }
}

/**
 * GET /api/dashboard/patient/specializations
 * Fetch unique doctor specializations for the tenant
 */
export async function getPatientSpecializations(req, res) {
  try {
    const db = getTenantPool(req);
    const tenantCode = req.tenant?.tenant_code || 'unknown';

    console.log(`📋 Fetching specializations for tenant: ${tenantCode}`);

    // Check if doctors table exists
    const [tables] = await db.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'doctors'
    `);
    
    if (tables.length > 0) {
      // Has doctors table
      // Schema-aware: ensure specialization column exists
      const [columns] = await db.query(`
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'doctors'
      `);
      const colSet = new Set(columns.map((c) => c.COLUMN_NAME));
      if (!colSet.has('specialization')) {
        return res.json({ specializations: [] });
      }

      const [results] = await db.query(`
        SELECT DISTINCT specialization
        FROM doctors
        WHERE (is_active = TRUE OR is_active IS NULL) 
          AND specialization IS NOT NULL 
          AND specialization != ''
        ORDER BY specialization ASC
      `);

      console.log(`  └─ Found ${results.length} specializations`);

      res.json({ 
        specializations: results.map(r => r.specialization)
      });
    } else {
      // Individual doctor tenant - get from tenant_settings
      const [[tenantSettings]] = await db.query(`
        SELECT doctor_specialty
        FROM tenant_settings
        LIMIT 1
      `).catch(() => [[null]]);

      res.json({ 
        specializations: tenantSettings?.doctor_specialty ? [tenantSettings.doctor_specialty] : []
      });
    }
  } catch (error) {
    console.error('❌ Patient specializations error:', error);
    res.status(500).json({ error: 'Failed to load specializations' });
  }
}
