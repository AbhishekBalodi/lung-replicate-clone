import { Router } from 'express';
import { pool } from '../lib/db.js';

const router = Router();

function makeKey(r) {
  const email = (r.email || '').trim().toLowerCase();
  const phone = (r.phone || '').toString().trim();
  const name  = (r.full_name || '').trim().toLowerCase();
  return `${email}|${phone}|${name}`;
}

/**
 * GET /api/patients (?q=search)
 *
 * - Ensures anyone who exists only in `appointments` is present in `patients`
 *   (safe upsert using INSERT IGNORE so unique constraints don't blow up).
 * - Returns the full patients list (optionally filtered by ?q=) sorted by name.
 */
router.get('/', async (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Load current rows
    const [pRows] = await conn.execute(
      'SELECT id, full_name, email, phone FROM patients'
    );
    const [aRows] = await conn.execute(
      'SELECT DISTINCT full_name, email, phone FROM appointments'
    );

    // Track existing by composite key
    const byKey = new Map();
    for (const r of pRows) byKey.set(makeKey(r), { ...r });

    // Insert any "appointment-only" person into patients (ignore duplicates)
    for (const r of aRows) {
      const k = makeKey(r);
      if (!byKey.has(k)) {
        const fullName = (r.full_name || 'Unknown').trim();
        const email    = (r.email || '').trim();
        const phone    = (r.phone || '').toString().trim();

        await conn.execute(
          `INSERT IGNORE INTO patients (full_name, email, phone, created_at)
           VALUES (?, ?, ?, NOW())`,
          [fullName, email, phone]
        );
      }
    }

    await conn.commit();

    // Reload and optionally search
    const [updated] = await conn.execute(
      'SELECT id, full_name, email, phone FROM patients ORDER BY full_name ASC'
    );

    let out = updated;
    if (q) {
      out = updated.filter((r) =>
        (r.full_name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q)
      );
    }

    res.json(out);
  } catch (e) {
    try { await conn.rollback(); } catch {}
    console.error('GET /api/patients failed:', e);
    res.status(500).json({ error: e.message || 'Failed to load patients' });
  } finally {
    conn.release();
  }
});

/**
 * GET /api/patients/:id
 * Returns a single patient plus their medicines, newest first.
 * NOTE: We order by `prescribed_date` only because the table does not have `created_at`.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [patients] = await pool.execute(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );
    if (!patients.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const [medicines] = await pool.execute(
      'SELECT * FROM medicines WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC',
      [id]
    );

    const [lab_tests] = await pool.execute(
      'SELECT * FROM labs_test WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC',
      [id]
    );

    res.json({ ...patients[0], medicines, lab_tests });
  } catch (e) {
    console.error('GET /api/patients/:id failed:', e);
    res.status(500).json({ error: e.message || 'Failed to load patient' });
  }
});

/**
 * GET /api/patients/:id/prescriptions
 * Standalone prescriptions list (same ordering).
 */
router.get('/:id/prescriptions', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM medicines WHERE patient_id = ? ORDER BY prescribed_date DESC, id DESC',
      [id]
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /api/patients/:id/prescriptions failed:', e);
    res.status(500).json({ error: e.message || 'Failed to load prescriptions' });
  }
});

export default router;
