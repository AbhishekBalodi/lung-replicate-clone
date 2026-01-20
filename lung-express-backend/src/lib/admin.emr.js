/**
 * Electronic Medical Records (EMR) Backend Logic
 * Handles diagnosis notes, treatment plans, progress notes, and documents
 */

import { getTenantPool } from './tenant-db.js';

// ============================================
// DIAGNOSIS NOTES
// ============================================

export async function getDiagnosisNotes(req, res) {
  try {
    const pool = getTenantPool(req);
    const { patient_id, search, status } = req.query;
    
    let query = `
      SELECT dn.*, p.full_name as patient_name
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
    const { patient_id, patient_name, diagnosis, symptoms, notes, status, doctor_id } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO diagnosis_notes (patient_id, patient_name, diagnosis, symptoms, notes, status, doctor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_id || null, patient_name, diagnosis, symptoms || null, notes || null, status || 'draft', doctor_id || null]
    );
    
    res.json({ success: true, id: result.insertId });
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
    const { patient_id, search, status } = req.query;
    
    let query = `
      SELECT tp.*, p.full_name as patient_name
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
    const { patient_id, patient_name, title, description, goals, start_date, end_date, status, doctor_id } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO treatment_plans (patient_id, patient_name, title, description, goals, start_date, end_date, status, doctor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id || null, patient_name, title, description || null, goals || null, start_date || null, end_date || null, status || 'active', doctor_id || null]
    );
    
    res.json({ success: true, id: result.insertId });
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
    const { patient_id, search } = req.query;
    
    let query = `
      SELECT pn.*, p.full_name as patient_name
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
    const { patient_id, patient_name, note_type, content, vitals, doctor_id } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO progress_notes (patient_id, patient_name, note_type, content, vitals, doctor_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id || null, patient_name, note_type || 'general', content, vitals || null, doctor_id || null]
    );
    
    res.json({ success: true, id: result.insertId });
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
    const { patient_id, document_type, search } = req.query;
    
    let query = `
      SELECT md.*, p.full_name as patient_name
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
    const { patient_id, patient_name, title, document_type, file_url, file_name, notes } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO medical_documents (patient_id, patient_name, title, document_type, file_url, file_name, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_id || null, patient_name, title, document_type || 'other', file_url || null, file_name || null, notes || null]
    );
    
    res.json({ success: true, id: result.insertId });
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
