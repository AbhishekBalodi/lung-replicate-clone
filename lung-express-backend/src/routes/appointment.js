import { Router } from 'express';
import { z } from 'zod';
import { getPool, getConnection } from '../lib/tenant-db.js';
import {
  sendMail,
  appointmentUserTemplate,
  appointmentDoctorTemplate,
} from '../lib/mailer.js';
import {
  getDoctorFilter,
  getDoctorIdForInsert,
} from '../middleware/doctor-context.js';

const TBL = 'appointments';
const router = Router();

/* =====================================================
   SCHEMA CONFIG
===================================================== */
function getSchemaConfig(req) {
  const isHospital = req.tenant?.type === 'hospital';

  return {
    isHospital,
    doctorColumn: isHospital ? 'doctor_id' : 'selected_doctor',
  };
}

/* =====================================================
   VALIDATION
===================================================== */
const baseSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(4),
  appointment_date: z.string().min(8),
  appointment_time: z.string().min(4),
  message: z.string().optional().default(''),
  reports_uploaded: z.boolean().optional().default(false),
});

const doctorSchema = baseSchema.extend({
  selected_doctor: z.string().min(1),
});

const hospitalSchema = baseSchema.extend({
  doctor_id: z.number().optional().nullable(),
});

/* =====================================================
   POST /api/appointment
===================================================== */
router.post('/', async (req, res) => {
  const config = getSchemaConfig(req);
  const schema = config.isHospital ? hospitalSchema : doctorSchema;

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const v = parsed.data;
  const conn = await getConnection(req);

  try {
    await conn.beginTransaction();

    const timeRegex = /^(\d{2}):(\d{2})$/;
    if (!timeRegex.test(v.appointment_time)) {
      return res.status(400).json({ error: 'Invalid time format HH:mm' });
    }

    const appointmentDateTime = `${v.appointment_date} ${v.appointment_time}`;

    const [conflicts] = await conn.execute(
      `
      SELECT id FROM \`${TBL}\`
      WHERE appointment_date = ?
        AND status != 'cancelled'
        AND ABS(TIMESTAMPDIFF(
          MINUTE,
          CONCAT(appointment_date,' ',appointment_time),
          ?
        )) < 5
      LIMIT 1
      `,
      [v.appointment_date, appointmentDateTime]
    );

    if (conflicts.length) {
      await conn.rollback();
      return res.status(409).json({ error: 'Time slot conflict' });
    }

    /* ---------------- INSERT APPOINTMENT ---------------- */
    let insertSql, insertParams, doctorId = null;

    if (config.isHospital) {
      doctorId = getDoctorIdForInsert(req) ?? v.doctor_id ?? null;

      insertSql = `
        INSERT INTO \`${TBL}\`
          (doctor_id, full_name, email, phone,
           appointment_date, appointment_time,
           message, reports_uploaded, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `;

      insertParams = [
        doctorId,
        v.full_name,
        v.email,
        v.phone,
        v.appointment_date,
        v.appointment_time,
        v.message,
        v.reports_uploaded ? 1 : 0,
      ];
    } else {
      insertSql = `
        INSERT INTO \`${TBL}\`
          (full_name, email, phone,
           appointment_date, appointment_time,
           selected_doctor, message,
           reports_uploaded, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `;

      insertParams = [
        v.full_name,
        v.email,
        v.phone,
        v.appointment_date,
        v.appointment_time,
        v.selected_doctor,
        v.message,
        v.reports_uploaded ? 1 : 0,
      ];
    }

    const [ins] = await conn.execute(insertSql, insertParams);

    /* ---------------- UPSERT PATIENT ---------------- */
    if (config.isHospital) {
      await conn.execute(
        `
        INSERT INTO patients
          (full_name, email, phone, doctor_id, first_visit_date, created_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          last_visit_date = NOW(),
          doctor_id = COALESCE(VALUES(doctor_id), doctor_id)
        `,
        [v.full_name, v.email, v.phone, doctorId]
      );
    } else {
      await conn.execute(
        `
        INSERT INTO patients
          (full_name, email, phone,
           last_appointment_date, last_appointment_time,
           doctor_assigned, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          last_appointment_date = VALUES(last_appointment_date),
          last_appointment_time = VALUES(last_appointment_time),
          doctor_assigned = VALUES(doctor_assigned)
        `,
        [
          v.full_name,
          v.email,
          v.phone,
          v.appointment_date,
          v.appointment_time,
          v.selected_doctor,
        ]
      );
    }

    await conn.commit();

    /* ---------------- EMAILS ---------------- */
    (async () => {
      try {
        await sendMail(appointmentDoctorTemplate(v));
        await sendMail(appointmentUserTemplate({ ...v, status: 'pending' }));
      } catch {}
    })();

    res.status(201).json({ success: true, id: ins.insertId });
  } catch (e) {
    await conn.rollback();
    console.error('POST /api/appointment failed:', e);
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

/* =====================================================
   GET /api/appointment
===================================================== */
router.get('/', async (req, res) => {
  const config = getSchemaConfig(req);
  const pool = getPool(req);

  try {
    const where = [];
    const params = [];

    if (config.isHospital) {
      const f = getDoctorFilter(req, 'a.doctor_id');
      if (f.whereSql) {
        where.push(f.whereSql);
        params.push(...f.params);
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = config.isHospital
      ? `
        SELECT
          a.id, a.full_name, a.email, a.phone,
          a.appointment_date, a.appointment_time,
          a.doctor_id,
          d.full_name AS doctor_name,
          a.message, a.status, a.created_at
        FROM appointments a
        JOIN doctors d ON d.id = a.doctor_id
        ${whereSql}
        ORDER BY a.appointment_date, a.appointment_time, a.id DESC
      `
      : `
        SELECT
          id, full_name, email, phone,
          appointment_date, appointment_time,
          selected_doctor AS doctor_name,
          message, status, created_at
        FROM appointments
        ${whereSql}
        ORDER BY appointment_date, appointment_time, id DESC
      `;

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (e) {
    console.error('GET /api/appointment failed:', e);
    res.status(500).json({ error: e.message });
  }
});

/* =====================================================
   PATCH /api/appointment/:id/done
===================================================== */
router.patch('/:id/done', async (req, res) => {
  const { id } = req.params;
  const pool = getPool(req);

  try {
    await pool.execute(
      `UPDATE \`${TBL}\` SET status='done' WHERE id=?`,
      [id]
    );

    const [rows] = await pool.execute(
      `SELECT * FROM \`${TBL}\` WHERE id=?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    const a = rows[0];

    (async () => {
      try {
        await sendMail(appointmentUserTemplate({ ...a, status: 'done' }));
      } catch {}
    })();

    res.json({ success: true });
  } catch (e) {
    console.error('PATCH /done failed:', e);
    res.status(500).json({ error: e.message });
  }
});

/* =====================================================
   DELETE /api/appointment/:id
===================================================== */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const pool = getPool(req);

  try {
    const [rows] = await pool.execute(
      `SELECT * FROM \`${TBL}\` WHERE id=?`,
      [id]
    );

    await pool.execute(`DELETE FROM \`${TBL}\` WHERE id=?`, [id]);

    if (rows.length) {
      (async () => {
        try {
          await sendMail(
            appointmentUserTemplate({ ...rows[0], status: 'cancelled' })
          );
        } catch {}
      })();
    }

    res.json({ success: true });
  } catch (e) {
    console.error('DELETE failed:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
