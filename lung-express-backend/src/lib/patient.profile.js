import { getTenantPool } from './tenant-db.js';

/* ============================================================
   PATIENT PROFILE & SETTINGS APIs
   ============================================================ */

/**
 * GET /api/dashboard/patient/profile
 */
export async function getPatientProfile(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(`
      SELECT 
        id, full_name, email, phone, date_of_birth, gender, 
        blood_group, address, avatar_url, created_at
      FROM patients 
      WHERE email = ? 
      LIMIT 1
    `, [email]);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get emergency contact
    const [[emergencyContact]] = await db.query(`
      SELECT name, relationship, phone
      FROM patient_emergency_contacts
      WHERE patient_id = ?
      LIMIT 1
    `, [patient.id]);

    // Get family members
    const [familyMembers] = await db.query(`
      SELECT id, name, relationship, age, date_of_birth
      FROM patient_family_members
      WHERE patient_id = ?
    `, [patient.id]);

    res.json({
      profile: patient,
      emergencyContact: emergencyContact || null,
      familyMembers
    });
  } catch (error) {
    console.error('❌ Patient profile error:', error);
    res.status(500).json({ error: 'Failed to load patient profile' });
  }
}

/**
 * PUT /api/dashboard/patient/profile
 */
export async function updatePatientProfile(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, full_name, phone, date_of_birth, gender, blood_group, address } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    await db.query(`
      UPDATE patients 
      SET full_name = ?, phone = ?, date_of_birth = ?, gender = ?, 
          blood_group = ?, address = ?, updated_at = NOW()
      WHERE email = ?
    `, [full_name, phone, date_of_birth, gender, blood_group, address, email]);

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('❌ Update patient profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * PUT /api/dashboard/patient/emergency-contact
 */
export async function updateEmergencyContact(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, name, relationship, phone } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Upsert emergency contact
    await db.query(`
      INSERT INTO patient_emergency_contacts (patient_id, name, relationship, phone)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name = ?, relationship = ?, phone = ?
    `, [patient.id, name, relationship, phone, name, relationship, phone]);

    res.json({ success: true, message: 'Emergency contact updated' });
  } catch (error) {
    console.error('❌ Update emergency contact error:', error);
    res.status(500).json({ error: 'Failed to update emergency contact' });
  }
}

/**
 * POST /api/dashboard/patient/family-members
 */
export async function addFamilyMember(req, res) {
  try {
    const db = getTenantPool(req);
    const { email, name, relationship, age, date_of_birth } = req.body;

    if (!email || !name || !relationship) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const [result] = await db.query(`
      INSERT INTO patient_family_members (patient_id, name, relationship, age, date_of_birth)
      VALUES (?, ?, ?, ?, ?)
    `, [patient.id, name, relationship, age || null, date_of_birth || null]);

    res.json({ 
      success: true, 
      message: 'Family member added',
      memberId: result.insertId
    });
  } catch (error) {
    console.error('❌ Add family member error:', error);
    res.status(500).json({ error: 'Failed to add family member' });
  }
}

/**
 * GET /api/dashboard/patient/settings
 */
export async function getPatientSettings(req, res) {
  try {
    const db = getTenantPool(req);
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.json({ settings: getDefaultSettings() });
    }

    const [[settings]] = await db.query(`
      SELECT * FROM patient_settings WHERE patient_id = ? LIMIT 1
    `, [patient.id]);

    res.json({ settings: settings || getDefaultSettings() });
  } catch (error) {
    console.error('❌ Patient settings error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
}

/**
 * PUT /api/dashboard/patient/settings
 */
export async function updatePatientSettings(req, res) {
  try {
    const db = getTenantPool(req);
    const { 
      email, 
      appointment_reminders, 
      medicine_reminders, 
      lab_reports_notifications,
      payment_reminders,
      sms_notifications,
      promotional_emails,
      two_factor_enabled,
      language
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Patient email required' });
    }

    const [[patient]] = await db.query(
      `SELECT id FROM patients WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await db.query(`
      INSERT INTO patient_settings 
      (patient_id, appointment_reminders, medicine_reminders, lab_reports_notifications,
       payment_reminders, sms_notifications, promotional_emails, two_factor_enabled, language)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        appointment_reminders = ?, medicine_reminders = ?, lab_reports_notifications = ?,
        payment_reminders = ?, sms_notifications = ?, promotional_emails = ?, 
        two_factor_enabled = ?, language = ?
    `, [
      patient.id, appointment_reminders, medicine_reminders, lab_reports_notifications,
      payment_reminders, sms_notifications, promotional_emails, two_factor_enabled, language,
      appointment_reminders, medicine_reminders, lab_reports_notifications,
      payment_reminders, sms_notifications, promotional_emails, two_factor_enabled, language
    ]);

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('❌ Update patient settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

function getDefaultSettings() {
  return {
    appointment_reminders: true,
    medicine_reminders: true,
    lab_reports_notifications: true,
    payment_reminders: true,
    sms_notifications: true,
    promotional_emails: false,
    two_factor_enabled: false,
    language: 'en'
  };
}
