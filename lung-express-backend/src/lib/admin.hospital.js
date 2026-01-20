/**
 * Hospital Management Backend Logic
 * Handles hospital profile, departments, and infrastructure
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// HOSPITAL PROFILE
// ============================================

export async function getHospitalProfile(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [rows] = await pool.execute('SELECT * FROM hospital_profile LIMIT 1');
    res.json({ profile: rows[0] || null });
  } catch (err) {
    console.error('getHospitalProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch hospital profile' });
  }
}

export async function updateHospitalProfile(req, res) {
  try {
    const pool = getTenantPool(req);
    const { 
      name, tagline, address, city, state, country, postal_code, 
      phone, email, website, registration_number, 
      established_year, bed_count, description, logo_url, 
      accreditations, specializations, working_hours
    } = req.body;
    
    const [existing] = await pool.execute('SELECT id FROM hospital_profile LIMIT 1');
    
    if (existing.length) {
      await pool.execute(
        `UPDATE hospital_profile SET 
         name = ?, tagline = ?, address = ?, city = ?, state = ?, country = ?, postal_code = ?,
         phone = ?, email = ?, website = ?, registration_number = ?,
         established_year = ?, bed_count = ?, description = ?, logo_url = ?,
         accreditations = ?, specializations = ?, working_hours = ?, updated_at = NOW()
         WHERE id = ?`,
        [name, tagline, address, city, state, country, postal_code, phone, email, website, 
         registration_number, established_year, bed_count, description, logo_url,
         JSON.stringify(accreditations), JSON.stringify(specializations), JSON.stringify(working_hours), existing[0].id]
      );
    } else {
      await pool.execute(
        `INSERT INTO hospital_profile 
         (name, tagline, address, city, state, country, postal_code, phone, email, website, 
          registration_number, established_year, bed_count, description, logo_url, 
          accreditations, specializations, working_hours)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, tagline, address, city, state, country, postal_code, phone, email, website, 
         registration_number, established_year, bed_count, description, logo_url,
         JSON.stringify(accreditations), JSON.stringify(specializations), JSON.stringify(working_hours)]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('updateHospitalProfile error:', err);
    res.status(500).json({ error: 'Failed to update hospital profile' });
  }
}

// ============================================
// DEPARTMENTS
// ============================================

export async function getDepartments(req, res) {
  try {
    const pool = getTenantPool(req);
    const { search } = req.query;
    
    let query = `
      SELECT d.*, 
        (SELECT COUNT(*) FROM doctors doc WHERE doc.department_id = d.id) as doctor_count
      FROM departments d
    `;
    
    if (search) {
      query += ' WHERE d.name LIKE ? OR d.code LIKE ?';
    }
    
    query += ' ORDER BY d.name';
    
    const params = search ? [`%${search}%`, `%${search}%`] : [];
    const [rows] = await pool.execute(query, params);
    
    res.json({ departments: rows });
  } catch (err) {
    console.error('getDepartments error:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

export async function addDepartment(req, res) {
  try {
    const pool = getTenantPool(req);
    const { name, code, head_id, description, location, phone, email, is_active } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO departments (name, code, head_id, description, location, phone, email, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, code || null, head_id || null, description || null, location || null, phone || null, email || null, is_active !== false]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addDepartment error:', err);
    res.status(500).json({ error: 'Failed to add department' });
  }
}

export async function updateDepartment(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { name, code, head_id, description, location, phone, email, is_active } = req.body;
    
    await pool.execute(
      `UPDATE departments SET name = ?, code = ?, head_id = ?, description = ?, location = ?, phone = ?, email = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, code, head_id, description, location, phone, email, is_active, id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('updateDepartment error:', err);
    res.status(500).json({ error: 'Failed to update department' });
  }
}

export async function deleteDepartment(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    
    await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('deleteDepartment error:', err);
    res.status(500).json({ error: 'Failed to delete department' });
  }
}

// ============================================
// INFRASTRUCTURE
// ============================================

export async function getInfrastructure(req, res) {
  try {
    const pool = getTenantPool(req);
    
    const [facilities] = await pool.execute('SELECT * FROM hospital_facilities ORDER BY category, name');
    const [equipment] = await pool.execute('SELECT * FROM hospital_equipment ORDER BY category, name');
    
    // Summary stats
    const [roomStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_rooms,
        SUM(CASE WHEN status = 'vacant' THEN 1 ELSE 0 END) as vacant_rooms,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
        SUM(bed_count) as total_beds
      FROM rooms
    `);
    
    res.json({
      facilities,
      equipment,
      roomStats: roomStats[0] || {}
    });
  } catch (err) {
    console.error('getInfrastructure error:', err);
    res.status(500).json({ error: 'Failed to fetch infrastructure' });
  }
}

export async function addFacility(req, res) {
  try {
    const pool = getTenantPool(req);
    const { name, category, description, capacity, location, status } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO hospital_facilities (name, category, description, capacity, location, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category || 'general', description || null, capacity || null, location || null, status || 'active']
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addFacility error:', err);
    res.status(500).json({ error: 'Failed to add facility' });
  }
}

export async function addEquipment(req, res) {
  try {
    const pool = getTenantPool(req);
    const { name, category, model, serial_number, manufacturer, purchase_date, warranty_until, status, location, notes } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO hospital_equipment (name, category, model, serial_number, manufacturer, purchase_date, warranty_until, status, location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category || 'general', model || null, serial_number || null, manufacturer || null, purchase_date || null, warranty_until || null, status || 'operational', location || null, notes || null]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('addEquipment error:', err);
    res.status(500).json({ error: 'Failed to add equipment' });
  }
}
