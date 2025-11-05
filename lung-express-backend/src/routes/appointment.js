import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../lib/db.js';
import { sendMail, appointmentUserTemplate, appointmentDoctorTemplate } from '../lib/mailer.js';

const TBL = 'appointments';
const COL = {
  id: 'id',
  full_name: 'full_name',
  email: 'email',
  phone: 'phone',
  appointment_date: 'appointment_date',
  appointment_time: 'appointment_time',
  selected_doctor: 'selected_doctor',
  message: 'message',
  reports_uploaded: 'reports_uploaded',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at',
};

// payload validation for create
const schema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(4),
  appointment_date: z.string().min(8), // yyyy-mm-dd
  appointment_time: z.string().min(4), // HH:mm
  selected_doctor: z.string().min(1),
  message: z.string().optional().default(''),
  reports_uploaded: z.boolean().optional().default(false),
});

const router = Router();

/** -----------------------------------------
 * POST /api/appointment  (create appointment)
 * ----------------------------------------- */
router.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const v = parsed.data;

  // Validate time is within allowed hours: 10 AM - 3 PM and 5 PM - 8 PM
  const timeRegex = /^(\d{2}):(\d{2})$/;
  const timeMatch = v.appointment_time.match(timeRegex);
  if (!timeMatch) {
    return res.status(400).json({ error: 'Invalid time format. Use HH:mm' });
  }
  
  const [hours, minutes] = timeMatch.slice(1).map(Number);
  const isValidTimeSlot = 
    (hours >= 10 && hours < 15) || // 10 AM to 3 PM (before 3 PM)
    (hours >= 17 && hours < 20);   // 5 PM to 8 PM (before 8 PM)
  
  if (!isValidTimeSlot) {
    return res.status(400).json({ 
      error: 'Appointments are only available between 10 AM - 3 PM and 5 PM - 8 PM' 
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check for conflicting appointments (same date/time or within 5 minutes)
    const appointmentDateTime = `${v.appointment_date} ${v.appointment_time}`;
    const checkConflictSql = `
      SELECT id, appointment_time 
      FROM \`${TBL}\` 
      WHERE \`${COL.appointment_date}\` = ? 
        AND \`${COL.status}\` != 'cancelled'
        AND ABS(TIMESTAMPDIFF(MINUTE, 
          CONCAT(\`${COL.appointment_date}\`, ' ', \`${COL.appointment_time}\`), 
          ?
        )) < 5
      LIMIT 1
    `;
    
    const [conflicts] = await conn.execute(checkConflictSql, [
      v.appointment_date,
      appointmentDateTime
    ]);

    if (conflicts.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(409).json({ 
        error: 'This time slot is already booked or too close to another appointment. Please choose a different time.' 
      });
    }

    // 1) Insert appointment (default 'scheduled')
    const sql =
      `INSERT INTO \`${TBL}\`
       (\`${COL.full_name}\`, \`${COL.email}\`, \`${COL.phone}\`,
        \`${COL.appointment_date}\`, \`${COL.appointment_time}\`,
        \`${COL.selected_doctor}\`, \`${COL.message}\`,
        \`${COL.reports_uploaded}\`, \`${COL.status}\`, \`${COL.created_at}\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())`;

    const [ins] = await conn.execute(sql, [
      v.full_name,
      v.email,
      v.phone,
      v.appointment_date,
      v.appointment_time,
      v.selected_doctor,
      v.message || '',
      v.reports_uploaded ? 1 : 0,
    ]);

    // 2) Upsert into patients by unique email/phone
    const upsertPatient =
      `INSERT INTO patients
         (full_name, email, phone,
          last_appointment_date, last_appointment_time, doctor_assigned, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         last_appointment_date = VALUES(last_appointment_date),
         last_appointment_time = VALUES(last_appointment_time),
         doctor_assigned = VALUES(doctor_assigned)`;

    await conn.execute(upsertPatient, [
      v.full_name,
      v.email,
      v.phone,
      v.appointment_date,
      v.appointment_time,
      v.selected_doctor,
    ]);

    await conn.commit();

    // 3) Fire-and-forget emails (optional)
    (async () => {
      try {
        const doctorMsg = appointmentDoctorTemplate(v);
        await sendMail({
          to: doctorMsg.to,
          subject: doctorMsg.subject,
          html: doctorMsg.html,
          text: doctorMsg.text,
        });
      } catch (e) {
        console.error('Doctor email failed:', e.message);
      }
      try {
        const userMsg = appointmentUserTemplate(v);
        await sendMail({
          to: userMsg.to,
          subject: userMsg.subject,
          html: userMsg.html,
          text: userMsg.text,
        });
      } catch (e) {
        console.error('User email failed:', e.message);
      }
    })();

    res.status(201).json({ success: true, id: ins.insertId, ...v });
  } catch (e) {
    await conn.rollback();
    console.error('POST /api/appointment failed:', e);
    res.status(500).json({ error: e.message || 'Failed to create appointment' });
  } finally {
    conn.release();
  }
});

/** ---------------------------------------------------
 * GET /api/appointment
 *   Optional filters:
 *     ?email=user@x.com
 *     ?phone=9999999999
 *     ?q=free text (matches name/email/phone/doctor/message)
 * --------------------------------------------------- */
router.get('/', async (req, res) => {
  const email = (req.query.email || '').toString().trim();
  const phone = (req.query.phone || '').toString().trim();
  const q = (req.query.q || '').toString().trim();

  try {
    const where = [];
    const params = [];

    if (email) {
      where.push(`\`${COL.email}\` = ?`);
      params.push(email);
    }
    if (phone) {
      where.push(`\`${COL.phone}\` = ?`);
      params.push(phone);
    }
    if (q) {
      where.push(`(
        \`${COL.full_name}\` LIKE ? OR
        \`${COL.email}\` LIKE ? OR
        \`${COL.phone}\` LIKE ? OR
        \`${COL.selected_doctor}\` LIKE ? OR
        \`${COL.message}\` LIKE ?
      )`);
      const like = `%${q}%`;
      params.push(like, like, like, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql =
      `SELECT \`${COL.id}\`, \`${COL.full_name}\`, \`${COL.email}\`, \`${COL.phone}\`,
              \`${COL.appointment_date}\`, \`${COL.appointment_time}\`,
              \`${COL.selected_doctor}\`, \`${COL.message}\`,
              \`${COL.status}\`, \`${COL.created_at}\`
       FROM \`${TBL}\`
       ${whereSql}
       ORDER BY \`${COL.appointment_date}\` ASC, \`${COL.appointment_time}\` ASC, \`${COL.id}\` DESC`;

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (e) {
    console.error('GET /api/appointment failed:', e);
    res.status(500).json({ error: e.message || 'Failed to load appointments' });
  }
});

/** -----------------------------
 * GET /api/appointment/:id
 * ----------------------------- */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM \`${TBL}\` WHERE \`${COL.id}\` = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error('GET /api/appointment/:id failed:', e);
    res.status(500).json({ error: e.message || 'Failed to load appointment' });
  }
});

/** ----------------------------------------------------
 * PATCH /api/appointment/:id/done  (mark as done + sync)
 * ---------------------------------------------------- */
router.patch('/:id/done', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute(
      `UPDATE \`${TBL}\` SET \`${COL.status}\` = 'done' WHERE \`${COL.id}\` = ?`,
      [id]
    );

    const [rows] = await pool.execute(
      `SELECT * FROM \`${TBL}\` WHERE \`${COL.id}\` = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });

    const a = rows[0];
    const upsertPatient =
      `INSERT INTO patients
         (full_name, email, phone, last_appointment_date, last_appointment_time, doctor_assigned, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         last_appointment_date = VALUES(last_appointment_date),
         last_appointment_time = VALUES(last_appointment_time),
         doctor_assigned = VALUES(doctor_assigned)`;

    await pool.execute(upsertPatient, [
      a.full_name,
      a.email,
      a.phone,
      a.appointment_date,
      a.appointment_time,
      a.selected_doctor,
    ]);

    res.json({ success: true, message: 'Appointment marked as done and patient synced.' });
  } catch (e) {
    console.error('PATCH /api/appointment/:id/done failed:', e);
    res.status(500).json({ error: e.message || 'Failed to mark as done' });
  }
});

/** -----------------------------
 * DELETE /api/appointment/:id
 * ----------------------------- */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [r] = await pool.execute(
      `DELETE FROM \`${TBL}\` WHERE \`${COL.id}\` = ?`,
      [id]
    );
    res.json({ success: true, deleted: r.affectedRows || 0 });
  } catch (e) {
    console.error('DELETE /api/appointment/:id failed:', e);
    res.status(500).json({ error: e.message || 'Failed to cancel appointment' });
  }
});

export default router;
