import { getTenantPool } from './tenant-db.js';

/**
 * GET /api/dashboard/patient/doctors
 * Fetch all active doctors for appointment booking
 * Returns doctors with their specialties from the tenant database
 */
export async function getPatientDoctors(req, res) {
  try {
    const db = getTenantPool(req);
    const isHospital = req.tenant?.type === 'hospital';

    if (isHospital) {
      // Hospital tenant - get doctors from local doctors table
      const [doctors] = await db.query(`
        SELECT 
          id,
          name,
          specialization,
          qualifications,
          consultation_fee,
          profile_photo_url
        FROM doctors
        WHERE is_active = TRUE
        ORDER BY name ASC
      `);

      // Get unique specializations for filtering
      const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

      res.json({ 
        doctors, 
        specializations,
        tenantType: 'hospital'
      });
    } else {
      // Individual doctor tenant - get doctor info from tenant settings or tenants table
      // For individual doctors, there's typically one doctor
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
        // Fallback - try to get from doctors table if it exists
        const [doctors] = await db.query(`
          SELECT 
            id,
            name,
            specialization,
            qualifications,
            consultation_fee,
            profile_photo_url
          FROM doctors
          WHERE is_active = TRUE
          ORDER BY name ASC
        `).catch(() => [[]]);

        const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

        res.json({ 
          doctors, 
          specializations,
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
    const isHospital = req.tenant?.type === 'hospital';

    if (isHospital) {
      const [results] = await db.query(`
        SELECT DISTINCT specialization
        FROM doctors
        WHERE is_active = TRUE AND specialization IS NOT NULL AND specialization != ''
        ORDER BY specialization ASC
      `);

      res.json({ 
        specializations: results.map(r => r.specialization)
      });
    } else {
      // Individual doctor tenant
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
