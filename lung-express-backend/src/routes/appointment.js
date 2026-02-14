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
  age: z.union([z.number(), z.string()]).optional().nullable().transform(v => {
    if (v === null || v === undefined || v === '') return null;
    const num = Number(v);
    return isNaN(num) ? null : num;
  }),
  gender: z.string().optional().nullable().default(null),
  state: z.string().optional().nullable().default(null),
  address: z.string().optional().nullable().default(null),
});

const doctorSchema = baseSchema.extend({
  selected_doctor: z.string().min(1),
});

const hospitalSchema = baseSchema.extend({
  // Accept string or number for doctor_id and coerce to number
  doctor_id: z.union([z.number(), z.string()]).optional().nullable().transform(v => {
    if (v === null || v === undefined || v === '') return null;
    const num = Number(v);
    return isNaN(num) ? null : num;
  }),
  selected_doctor: z.string().optional(), // Allow but ignore for hospital
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

    // Accept both HH:mm (24h) and h:mm AM/PM (12h) formats
    const time24Regex = /^(\d{2}):(\d{2})$/;
    const time12Regex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    
    let normalizedTime = v.appointment_time;
    
    if (!time24Regex.test(v.appointment_time)) {
      // Try 12-hour format
      const match12 = v.appointment_time.match(time12Regex);
      if (match12) {
        let hours = parseInt(match12[1], 10);
        const minutes = match12[2];
        const period = match12[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) hours += 12;
        else if (period === 'AM' && hours === 12) hours = 0;
        
        normalizedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
      } else {
        return res.status(400).json({ error: 'Invalid time format. Use HH:mm or h:mm AM/PM' });
      }
    }

    const appointmentDateTime = `${v.appointment_date} ${normalizedTime}`;

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
           message, reports_uploaded, age, gender, state, address, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `;

      insertParams = [
        doctorId,
        v.full_name,
        v.email,
        v.phone,
        v.appointment_date,
        normalizedTime,
        v.message,
        v.reports_uploaded ? 1 : 0,
        v.age || null,
        v.gender || null,
        v.state || null,
        v.address || null,
      ];
    } else {
      insertSql = `
        INSERT INTO \`${TBL}\`
          (full_name, email, phone,
           appointment_date, appointment_time,
           selected_doctor, message,
           reports_uploaded, age, gender, state, address, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `;

      insertParams = [
        v.full_name,
        v.email,
        v.phone,
        v.appointment_date,
        normalizedTime,
        v.selected_doctor,
        v.message,
        v.reports_uploaded ? 1 : 0,
        v.age || null,
        v.gender || null,
        v.state || null,
        v.address || null,
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
          d.name AS doctor_name,
          a.message, a.status, a.created_at
        FROM appointments a
        LEFT JOIN doctors d ON d.id = a.doctor_id
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
