const express = require('express');
const router = express.Router();
const { getTenantPool } = require('../utils/tenant-db');

// Default tabs for doctors
const DEFAULT_DOCTOR_TABS = [
  'dashboard', 'appointments', 'calendar', 'patients', 'medicines', 
  'lab_tests', 'procedures', 'consultation', 'completed', 'emr', 
  'follow_ups', 'telemedicine', 'schedule', 'tasks', 'analytics', 
  'communication', 'emergency', 'profile', 'ambulance', 'staff', 
  'pharmacy', 'blood_bank', 'billing', 'rooms'
];

// Default tabs for patients
const DEFAULT_PATIENT_TABS = [
  'dashboard', 'appointments', 'records', 'prescriptions', 
  'lab_reports', 'billing', 'timeline', 'communication', 
  'notifications', 'profile', 'telemedicine', 'feedback', 'settings'
];

// GET doctor tab access
router.get('/doctor/:doctorId/tabs', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const pool = getTenantPool(req);
    
    const [rows] = await pool.query(
      'SELECT enabled_tabs FROM doctor_tab_access WHERE doctor_id = ?',
      [doctorId]
    );
    
    if (rows.length === 0) {
      // Return default tabs if no record exists
      return res.json({ tabs: DEFAULT_DOCTOR_TABS });
    }
    
    const tabs = rows[0].enabled_tabs ? JSON.parse(rows[0].enabled_tabs) : DEFAULT_DOCTOR_TABS;
    res.json({ tabs });
  } catch (error) {
    console.error('Error fetching doctor tab access:', error);
    // Return defaults on error
    res.json({ tabs: DEFAULT_DOCTOR_TABS });
  }
});

// PUT doctor tab access
router.put('/doctor/:doctorId/tabs', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { tabs } = req.body;
    const pool = getTenantPool(req);
    
    // Ensure dashboard is always included
    const finalTabs = tabs.includes('dashboard') ? tabs : ['dashboard', ...tabs];
    
    // Upsert the record
    await pool.query(`
      INSERT INTO doctor_tab_access (doctor_id, enabled_tabs, updated_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE enabled_tabs = VALUES(enabled_tabs), updated_at = NOW()
    `, [doctorId, JSON.stringify(finalTabs)]);
    
    res.json({ success: true, tabs: finalTabs });
  } catch (error) {
    console.error('Error updating doctor tab access:', error);
    res.status(500).json({ error: 'Failed to update tab access' });
  }
});

// GET patient tab access
router.get('/patient/:patientId/tabs', async (req, res) => {
  try {
    const { patientId } = req.params;
    const pool = getTenantPool(req);
    
    const [rows] = await pool.query(
      'SELECT enabled_tabs FROM patient_tab_access WHERE patient_id = ?',
      [patientId]
    );
    
    if (rows.length === 0) {
      // Return default tabs if no record exists
      return res.json({ tabs: DEFAULT_PATIENT_TABS });
    }
    
    const tabs = rows[0].enabled_tabs ? JSON.parse(rows[0].enabled_tabs) : DEFAULT_PATIENT_TABS;
    res.json({ tabs });
  } catch (error) {
    console.error('Error fetching patient tab access:', error);
    // Return defaults on error
    res.json({ tabs: DEFAULT_PATIENT_TABS });
  }
});

// PUT patient tab access
router.put('/patient/:patientId/tabs', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { tabs } = req.body;
    const pool = getTenantPool(req);
    
    // Ensure dashboard is always included
    const finalTabs = tabs.includes('dashboard') ? tabs : ['dashboard', ...tabs];
    
    // Upsert the record
    await pool.query(`
      INSERT INTO patient_tab_access (patient_id, enabled_tabs, updated_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE enabled_tabs = VALUES(enabled_tabs), updated_at = NOW()
    `, [patientId, JSON.stringify(finalTabs)]);
    
    res.json({ success: true, tabs: finalTabs });
  } catch (error) {
    console.error('Error updating patient tab access:', error);
    res.status(500).json({ error: 'Failed to update tab access' });
  }
});

// GET patient dashboard access (is_active equivalent)
router.get('/patient/:patientId/access', async (req, res) => {
  try {
    const { patientId } = req.params;
    const pool = getTenantPool(req);
    
    const [rows] = await pool.query(
      'SELECT is_active FROM patients WHERE id = ?',
      [patientId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json({ is_active: rows[0].is_active !== 0 });
  } catch (error) {
    console.error('Error fetching patient access:', error);
    res.status(500).json({ error: 'Failed to fetch patient access' });
  }
});

// PUT patient dashboard access
router.put('/patient/:patientId/access', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { is_active } = req.body;
    const pool = getTenantPool(req);
    
    await pool.query(
      'UPDATE patients SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [is_active ? 1 : 0, patientId]
    );
    
    res.json({ success: true, is_active });
  } catch (error) {
    console.error('Error updating patient access:', error);
    res.status(500).json({ error: 'Failed to update patient access' });
  }
});

module.exports = router;
