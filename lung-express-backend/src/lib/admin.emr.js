/**
 * Electronic Medical Records (EMR) Backend Logic
 * Handles diagnosis notes, treatment plans, progress notes, and documents
 */

import { getTenantPool } from './tenant-db.js';

function normalizeJsonForMysql(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed);
    } catch {
      return JSON.stringify({ text: value });
    }
  }
  return JSON.stringify(value);
}

// ============================================
// ENSURE TABLES EXIST
// ============================================
async function ensureEMRTables(pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS diagnosis_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        patient_name VARCHAR(255),
        diagnosis TEXT NOT NULL,
        symptoms TEXT,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        doctor_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS treatment_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        patient_name VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        goals TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        doctor_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS progress_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        patient_name VARCHAR(255),
        note_type VARCHAR(50) DEFAULT 'general',
        content TEXT,
        vitals JSON,
        doctor_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medical_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        patient_name VARCHAR(255),
        title VARCHAR(255),
        document_type VARCHAR(50) DEFAULT 'other',
        file_url VARCHAR(500),
        file_name VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } catch (e) {
    console.warn('ensureEMRTables warning:', e.message);
  }
}

// ============================================
// DIAGNOSIS NOTES
// ============================================

export async function getDiagnosisNotes(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureEMRTables(pool);
    const { patient_id, search, status } = req.query;
    
    let query = `
      SELECT dn.*, COALESCE(p.full_name, dn.patient_name) as patient_name
      FROM diagnosis_notes dn
      LEFT JOIN patients p ON p.id = dn.patient_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (patient_id) {
      conditions.push('dn.patient_id = ?');
      params.push(patient_id);
    }
    
    if (search) {
      conditions.push('(p.full_name LIKE ? OR dn.diagnosis LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status) {
      conditions.push('dn.status = ?');
      params.push(status);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY dn.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json({ notes: rows });
  } catch (err) {
    console.error('getDiagnosisNotes error:', err);
    res.status(500).json({ error: 'Failed to fetch diagnosis notes' });
  }
}

export async function addDiagnosisNote(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureEMRTables(pool);
    const { patient_id, patient_name, diagnosis, symptoms, notes, status, doctor_id } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO diagnosis_notes (patient_id, patient_name, diagnosis, symptoms, notes, status, doctor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_id || null, patient_name, diagnosis, symptoms || null, notes || null, status || 'draft', doctor_id || null]
    );
    
    // Return created note for instant rendering
    const [rows] = await pool.execute(
      `SELECT dn.*, COALESCE(p.full_name, dn.patient_name) as patient_name
       FROM diagnosis_notes dn
       LEFT JOIN patients p ON p.id = dn.patient_id
       WHERE dn.id = ?`,
      [result.insertId]
    );
    
    res.json({ success: true, id: result.insertId, note: rows[0] || null });
  } catch (err) {
    console.error('addDiagnosisNote error:', err);
    res.status(500).json({ error: 'Failed to add diagnosis note' });
  }
}

export async function updateDiagnosisNote(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { diagnosis, symptoms, notes, status } = req.body;
    
    await pool.execute(
      `UPDATE diagnosis_notes SET diagnosis = ?, symptoms = ?, notes = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [diagnosis, symptoms, notes, status, id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('updateDiagnosisNote error:', err);
    res.status(500).json({ error: 'Failed to update diagnosis note' });
  }
}

export async function deleteDiagnosisNote(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    
    await pool.execute('DELETE FROM diagnosis_notes WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('deleteDiagnosisNote error:', err);
    res.status(500).json({ error: 'Failed to delete diagnosis note' });
  }
}

// ============================================
// TREATMENT PLANS
// ============================================

export async function getTreatmentPlans(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureEMRTables(pool);
    const { patient_id, search, status } = req.query;
    
    let query = `
      SELECT tp.*, COALESCE(p.full_name, tp.patient_name) as patient_name
      FROM treatment_plans tp
      LEFT JOIN patients p ON p.id = tp.patient_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (patient_id) {
      conditions.push('tp.patient_id = ?');
      params.push(patient_id);
    }
    
    if (search) {
      conditions.push('(p.full_name LIKE ? OR tp.title LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status) {
      conditions.push('tp.status = ?');
      params.push(status);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY tp.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json({ plans: rows });
  } catch (err) {
    console.error('getTreatmentPlans error:', err);
    res.status(500).json({ error: 'Failed to fetch treatment plans' });
  }
}

export async function addTreatmentPlan(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureEMRTables(pool);
    const { patient_id, patient_name, title, description, goals, start_date, end_date, status, doctor_id } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO treatment_plans (patient_id, patient_name, title, description, goals, start_date, end_date, status, doctor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id || null, patient_name, title, description || null, goals || null, start_date || null, end_date || null, status || 'active', doctor_id || null]
    );
    
    // Return created plan for instant rendering
    const [rows] = await pool.execute(
      `SELECT tp.*, COALESCE(p.full_name, tp.patient_name) as patient_name
       FROM treatment_plans tp
       LEFT JOIN patients p ON p.id = tp.patient_id
       WHERE tp.id = ?`,
      [result.insertId]
    );
    
    res.json({ success: true, id: result.insertId, plan: rows[0] || null });
  } catch (err) {
    console.error('addTreatmentPlan error:', err);
    res.status(500).json({ error: 'Failed to add treatment plan' });
  }
}

export async function updateTreatmentPlan(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    const { title, description, goals, start_date, end_date, status } = req.body;
    
    await pool.execute(
      `UPDATE treatment_plans SET title = ?, description = ?, goals = ?, start_date = ?, end_date = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, goals, start_date, end_date, status, id]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('updateTreatmentPlan error:', err);
    res.status(500).json({ error: 'Failed to update treatment plan' });
  }
}

// ============================================
// PROGRESS NOTES
// ============================================

export async function getProgressNotes(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureEMRTables(pool);
    const { patient_id, search } = req.query;
    
    let query = `
      SELECT pn.*, COALESCE(p.full_name, pn.patient_name) as patient_name
      FROM progress_notes pn
      LEFT JOIN patients p ON p.id = pn.patient_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (patient_id) {
      conditions.push('pn.patient_id = ?');
      params.push(patient_id);
    }
    
    if (search) {
      conditions.push('(p.full_name LIKE ? OR pn.note_type LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY pn.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json({ notes: rows });
  } catch (err) {
    console.error('getProgressNotes error:', err);
    res.status(500).json({ error: 'Failed to fetch progress notes' });
  }
}

export async function addProgressNote(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureEMRTables(pool);
    const { patient_id, patient_name, note_type, content, vitals, doctor_id } = req.body;

    const vitalsJson = normalizeJsonForMysql(vitals);

    const [result] = await pool.execute(
      `INSERT INTO progress_notes (patient_id, patient_name, note_type, content, vitals, doctor_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id || null, patient_name, note_type || 'general', content, vitalsJson, doctor_id || null]
    );

    // Return created note
    const [rows] = await pool.execute(
      `SELECT pn.*, COALESCE(p.full_name, pn.patient_name) as patient_name
       FROM progress_notes pn
       LEFT JOIN patients p ON p.id = pn.patient_id
       WHERE pn.id = ?`,
      [result.insertId]
    );

    res.json({ success: true, id: result.insertId, note: rows[0] || null });
  } catch (err) {
    console.error('addProgressNote error:', err);
    res.status(500).json({ error: 'Failed to add progress note' });
  }
}

// ============================================
// MEDICAL DOCUMENTS
// ============================================

export async function getMedicalDocuments(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureEMRTables(pool);
    const { patient_id, document_type, search } = req.query;
    
    let query = `
      SELECT md.*, COALESCE(p.full_name, md.patient_name) as patient_name
      FROM medical_documents md
      LEFT JOIN patients p ON p.id = md.patient_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (patient_id) {
      conditions.push('md.patient_id = ?');
      params.push(patient_id);
    }
    
    if (document_type) {
      conditions.push('md.document_type = ?');
      params.push(document_type);
    }
    
    if (search) {
      conditions.push('(p.full_name LIKE ? OR md.title LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY md.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json({ documents: rows });
  } catch (err) {
    console.error('getMedicalDocuments error:', err);
    res.status(500).json({ error: 'Failed to fetch medical documents' });
  }
}

export async function addMedicalDocument(req, res) {
  try {
    const pool = getTenantPool(req);
    await ensureEMRTables(pool);
    const { patient_id, patient_name, title, document_type, file_url, file_name, notes } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO medical_documents (patient_id, patient_name, title, document_type, file_url, file_name, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_id || null, patient_name, title, document_type || 'other', file_url || null, file_name || null, notes || null]
    );
    
    // Return created document
    const [rows] = await pool.execute(
      `SELECT md.*, COALESCE(p.full_name, md.patient_name) as patient_name
       FROM medical_documents md
       LEFT JOIN patients p ON p.id = md.patient_id
       WHERE md.id = ?`,
      [result.insertId]
    );
    
    res.json({ success: true, id: result.insertId, document: rows[0] || null });
  } catch (err) {
    console.error('addMedicalDocument error:', err);
    res.status(500).json({ error: 'Failed to add medical document' });
  }
}

export async function deleteMedicalDocument(req, res) {
  try {
    const pool = getTenantPool(req);
    const { id } = req.params;
    
    await pool.execute('DELETE FROM medical_documents WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('deleteMedicalDocument error:', err);
    res.status(500).json({ error: 'Failed to delete medical document' });
  }
}
