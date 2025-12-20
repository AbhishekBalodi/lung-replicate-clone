import { Router } from 'express';
import { getPool } from '../lib/tenant-db.js';

const router = Router();

/**
 * GET /api/prescriptions?patient_id=123
 */
router.get('/', async (req, res) => {
  const { patient_id } = req.query;
  if (!patient_id) return res.status(400).json({ error: 'patient_id is required' });

  try {
    const pool = getPool(req);
    const [rows] = await pool.execute(
      'SELECT * FROM medicines WHERE patient_id = ? ORDER BY prescribed_date DESC',
      [patient_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/prescriptions
 * body: { patient_id, medicine_id?, medicine_name, dosage?, frequency?, duration?, instructions? }
 */
router.post('/', async (req, res) => {
  const { patient_id, medicine_id, medicine_name, dosage, frequency, duration, instructions } = req.body || {};
  if (!patient_id) return res.status(400).json({ error: 'patient_id is required' });
  if (!medicine_name || !String(medicine_name).trim()) {
    return res.status(400).json({ error: 'medicine_name is required' });
  }
  try {
    const pool = getPool(req);
    const [result] = await pool.execute(
      'INSERT INTO medicines (patient_id, medicine_id, medicine_name, dosage, frequency, duration, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, medicine_id || null, medicine_name, dosage || null, frequency || null, duration || null, instructions || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
