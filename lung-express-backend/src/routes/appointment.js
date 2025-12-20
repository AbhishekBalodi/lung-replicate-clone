import { Router } from 'express';
import { z } from 'zod';
import { getPool, getConnection } from '../lib/tenant-db.js';
import { sendMail, appointmentUserTemplate, appointmentDoctorTemplate } from '../lib/mailer.js';
import { getDoctorFilter, getDoctorIdForInsert } from '../middleware/doctor-context.js';

const TBL = 'appointments';

/**
 * Get schema-aware column configuration based on tenant type
 * Hospital tenants use doctor_id (INT), individual doctors use selected_doctor (VARCHAR)
 */
function getSchemaConfig(req) {
  const isHospital = req.tenant?.type === 'hospital';
  
  return {
    isHospital,
    // Column names differ between hospital and doctor schemas
    doctorColumn: isHospital ? 'doctor_id' : 'selected_doctor',
    // Base columns that exist in both schemas
    baseColumns: ['id', 'full_name', 'email', 'phone', 'appointment_date', 'appointment_time', 
                  'message', 'status', 'reports_uploaded', 'created_at', 'updated_at'],
    // Get the doctor reference column for SELECT
    getSelectColumns() {
      const cols = [...this.baseColumns];
      cols.splice(6, 0, this.doctorColumn); // Insert doctor column after appointment_time
      return cols;
    }
  };
}

// payload validation for create - supports both schemas
const baseSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(4),
  appointment_date: z.string().min(8), // yyyy-mm-dd
  appointment_time: z.string().min(4), // HH:mm
  message: z.string().optional().default(''),
  reports_uploaded: z.boolean().optional().default(false),
});

// For individual doctors - uses selected_doctor string
const doctorSchema = baseSchema.extend({
  selected_doctor: z.string().min(1),
});

// For hospitals - uses doctor_id number (optional)
const hospitalSchema = baseSchema.extend({
  doctor_id: z.number().optional().nullable(),
  selected_doctor: z.string().optional(), // Allow for backwards compatibility
});

const router = Router();

/** -----------------------------------------
 * POST /api/appointment  (create appointment)
 * ----------------------------------------- */
router.post('/', async (req, res) => {
  const config = getSchemaConfig(req);
  
  // Use appropriate schema for validation
  const schema = config.isHospital ? hospitalSchema : doctorSchema;
  const parsed = schema.safeParse(req.body);
  
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const v = parsed.data;

  // Validate time
  const timeRegex = /^(\d{2}):(\d{2})$/;
  const timeMatch = v.appointment_time.match(timeRegex);
  if (!timeMatch) {
    return res.status(400).json({ error: 'Invalid time format. Use HH:mm' });
  }

  const [hours] = timeMatch.slice(1).map(Number);
  const isValidTimeSlot =
    (hours >= 10 && hours < 15) || // 10 AM - 3 PM
    (hours >= 17 && hours < 20);   // 5 PM - 8 PM

  if (!isValidTimeSlot) {
    return res.status(400).json({
      error: 'Appointments are only available between 10 AM - 3 PM and 5 PM - 8 PM',
    });
  }

  const conn = await getConnection(req);
  try {
    await conn.beginTransaction();

    // Check conflicting appointments
    const appointmentDateTime = `${v.appointment_date} ${v.appointment_time}`;
    const checkConflictSql = `
      SELECT id, appointment_time 
      FROM \`${TBL}\` 
      WHERE \`appointment_date\` = ? 
        AND \`status\` != 'cancelled'
        AND ABS(TIMESTAMPDIFF(MINUTE, 
          CONCAT(\`appointment_date\`, ' ', \`appointment_time\`), 
          ?
        )) < 5
      LIMIT 1
    `;

    const [conflicts] = await conn.execute(checkConflictSql, [
      v.appointment_date,
      appointmentDateTime,
    ]);

    if (conflicts.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(409).json({
        error: 'This time slot is already booked or too close to another appointment.',
      });
    }

    // Build INSERT based on schema type
    let sql, insertParams;
    
    if (config.isHospital) {
      // Hospital schema: uses doctor_id
      const doctorId = getDoctorIdForInsert(req) || v.doctor_id || null;
      sql = `INSERT INTO \`${TBL}\`
             (\`doctor_id\`, \`full_name\`, \`email\`, \`phone\`,
              \`appointment_date\`, \`appointment_time\`,
              \`message\`, \`reports_uploaded\`, \`status\`, \`created_at\`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`;
      insertParams = [
        doctorId,
        v.full_name,
        v.email,
        v.phone,
        v.appointment_date,
        v.appointment_time,
        v.message || '',
        v.reports_uploaded ? 1 : 0,
      ];
    } else {
      // Individual doctor schema: uses selected_doctor
      sql = `INSERT INTO \`${TBL}\`
             (\`full_name\`, \`email\`, \`phone\`,
              \`appointment_date\`, \`appointment_time\`,
              \`selected_doctor\`, \`message\`,
              \`reports_uploaded\`, \`status\`, \`created_at\`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`;
      insertParams = [
        v.full_name,
        v.email,
        v.phone,
        v.appointment_date,
        v.appointment_time,
        v.selected_doctor,
        v.message || '',
        v.reports_uploaded ? 1 : 0,
      ];
    }

    const [ins] = await conn.execute(sql, insertParams);

    // Upsert patient based on schema type
    let upsertPatient, patientParams;
    
    if (config.isHospital) {
      // Hospital schema: uses doctor_id
      const doctorId = getDoctorIdForInsert(req) || v.doctor_id || null;
      upsertPatient = `
        INSERT INTO patients
          (full_name, email, phone, doctor_id, first_visit_date, created_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          full_name = VALUES(full_name),
          doctor_id = COALESCE(VALUES(doctor_id), doctor_id),
          last_visit_date = NOW()`;
      patientParams = [v.full_name, v.email, v.phone, doctorId];
    } else {
      // Individual doctor schema: uses doctor_assigned
      upsertPatient = `
        INSERT INTO patients
          (full_name, email, phone,
           last_appointment_date, last_appointment_time, doctor_assigned, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          full_name = VALUES(full_name),
          last_appointment_date = VALUES(last_appointment_date),
          last_appointment_time = VALUES(last_appointment_time),
          doctor_assigned = VALUES(doctor_assigned)`;
      patientParams = [
        v.full_name,
        v.email,
        v.phone,
        v.appointment_date,
        v.appointment_time,
        v.selected_doctor,
      ];
    }

    await conn.execute(upsertPatient, patientParams);
    await conn.commit();

    // Emails (fire & forget)
    (async () => {
      try {
        const doctorMsg = appointmentDoctorTemplate(v);
        await sendMail({
          to: doctorMsg.to,
          subject: doctorMsg.subject,
          html: doctorMsg.html,
          text: doctorMsg.text,
        });
      } catch {}

      try {
        const userMsg = appointmentUserTemplate({ ...v, status: 'pending' });
        await sendMail({
          to: userMsg.to,
          subject: userMsg.subject,
          html: userMsg.html,
          text: userMsg.text,
        });
      } catch {}
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
 * Filters:
 *     ?email=
 *     ?phone=
 *     ?status=pending/rescheduled/cancelled/done
 *     ?q=free text
 * --------------------------------------------------- */
router.get('/', async (req, res) => {
  const email = (req.query.email || '').toString().trim();
  const phone = (req.query.phone || '').toString().trim();
  const status = (req.query.status || '').toString().trim();
  const q = (req.query.q || '').toString().trim();

  const config = getSchemaConfig(req);

  try {
    const where = [];
    const params = [];

    // Add doctor filter for hospital tenants
    if (config.isHospital) {
      const doctorFilter = getDoctorFilter(req, 'doctor_id');
      if (doctorFilter.whereSql) {
        where.push(doctorFilter.whereSql);
        params.push(...doctorFilter.params);
      }
    }

    if (email) {
      where.push('`email` = ?');
      params.push(email);
    }
    if (phone) {
      where.push('`phone` = ?');
      params.push(phone);
    }
    if (status) {
      where.push('`status` = ?');
      params.push(status);
    }
    if (q) {
      // Search query includes doctor column based on schema
      const doctorSearchCol = config.isHospital ? '' : `\`selected_doctor\` LIKE ? OR`;
      const searchClause = config.isHospital 
        ? `(\`full_name\` LIKE ? OR \`email\` LIKE ? OR \`phone\` LIKE ? OR \`message\` LIKE ?)`
        : `(\`full_name\` LIKE ? OR \`email\` LIKE ? OR \`phone\` LIKE ? OR \`selected_doctor\` LIKE ? OR \`message\` LIKE ?)`;
      where.push(searchClause);
      const like = `%${q}%`;
      if (config.isHospital) {
        params.push(like, like, like, like);
      } else {
        params.push(like, like, like, like, like);
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    
    // Build SELECT based on schema type
    let selectCols;
    if (config.isHospital) {
      selectCols = `\`id\`, \`full_name\`, \`email\`, \`phone\`,
                    \`appointment_date\`, \`appointment_time\`,
                    \`doctor_id\`, \`message\`,
                    \`status\`, \`created_at\``;
    } else {
      selectCols = `\`id\`, \`full_name\`, \`email\`, \`phone\`,
                    \`appointment_date\`, \`appointment_time\`,
                    \`selected_doctor\`, \`message\`,
                    \`status\`, \`created_at\``;
    }
    
    const sql = `SELECT ${selectCols}
                 FROM \`${TBL}\`
                 ${whereSql}
                 ORDER BY \`appointment_date\` ASC, \`appointment_time\` ASC, \`id\` DESC`;

    const [rows] = await getPool(req).execute(sql, params);
    
    // Normalize response - add selected_doctor for hospital tenants if doctor_id exists
    // This helps frontend work with consistent data
    const normalizedRows = rows.map(row => {
      if (config.isHospital && row.doctor_id !== undefined) {
        return { ...row, selected_doctor: row.doctor_id ? `Doctor #${row.doctor_id}` : null };
      }
      return row;
    });
    
    res.json(normalizedRows);
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
    const [rows] = await getPool(req).execute(
      `SELECT * FROM \`${TBL}\` WHERE \`id\` = ? LIMIT 1`,
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
 * PATCH /api/appointment/:id/done
 * ---------------------------------------------------- */
router.patch('/:id/done', async (req, res) => {
  const { id } = req.params;
  const config = getSchemaConfig(req);
  
  try {
    const pool = getPool(req);
    await pool.execute(
      `UPDATE \`${TBL}\` SET \`status\` = 'done' WHERE \`id\` = ?`,
      [id]
    );

    const [rows] = await pool.execute(
      `SELECT * FROM \`${TBL}\` WHERE \`id\` = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });

    const a = rows[0];
    
    // Upsert patient based on schema type
    let upsertPatient, patientParams;
    
    if (config.isHospital) {
      upsertPatient = `
        INSERT INTO patients
          (full_name, email, phone, doctor_id, first_visit_date, created_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          last_visit_date = NOW(),
          doctor_id = COALESCE(VALUES(doctor_id), doctor_id)`;
      patientParams = [a.full_name, a.email, a.phone, a.doctor_id || null];
    } else {
      upsertPatient = `
        INSERT INTO patients
          (full_name, email, phone, last_appointment_date, last_appointment_time, doctor_assigned, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          last_appointment_date = VALUES(last_appointment_date),
          last_appointment_time = VALUES(last_appointment_time),
          doctor_assigned = VALUES(doctor_assigned)`;
      patientParams = [
        a.full_name,
        a.email,
        a.phone,
        a.appointment_date,
        a.appointment_time,
        a.selected_doctor,
      ];
    }

    await pool.execute(upsertPatient, patientParams);

    (async () => {
      try {
        const userMsg = appointmentUserTemplate({ ...a, status: 'done' });
        await sendMail({
          to: userMsg.to,
          subject: userMsg.subject,
          html: userMsg.html,
          text: userMsg.text,
        });
      } catch {}
    })();

    res.json({ success: true, message: 'Appointment marked as done and patient synced.' });
  } catch (e) {
    console.error('PATCH /api/appointment/:id/done failed:', e);
    res.status(500).json({ error: e.message || 'Failed to mark as done' });
  }
});

/** -----------------------------
 * PATCH /api/appointment/:id
 * ----------------------------- */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { appointment_date, appointment_time, status } = req.body;

  try {
    const validStatuses = ['pending', 'rescheduled', 'cancelled', 'done'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updates = [];
    const values = [];

    if (appointment_date) {
      updates.push('`appointment_date` = ?');
      values.push(appointment_date);
    }
    if (appointment_time) {
      updates.push('`appointment_time` = ?');
      values.push(appointment_time);
    }
    if (status) {
      updates.push('`status` = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE \`${TBL}\` SET ${updates.join(', ')} WHERE \`id\` = ?`;

    const pool = getPool(req);
    await pool.execute(query, values);

    const [rows] = await pool.execute(
      `SELECT * FROM \`${TBL}\` WHERE \`id\` = ?`,
      [id]
    );

    if (rows.length > 0) {
      (async () => {
        try {
          const appointment = rows[0];
          const userMsg = appointmentUserTemplate(appointment);
          await sendMail({
            to: userMsg.to,
            subject: userMsg.subject,
            html: userMsg.html,
            text: userMsg.text,
          });
        } catch {}
      })();
    }

    res.json({ success: true, message: 'Appointment updated successfully' });
  } catch (e) {
    console.error('PATCH /api/appointment/:id failed:', e);
    res.status(500).json({ error: e.message || 'Failed to update appointment' });
  }
});

/** -----------------------------
 * DELETE /api/appointment/:id
 * ----------------------------- */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool(req);
    const [rows] = await pool.execute(
      `SELECT * FROM \`${TBL}\` WHERE \`id\` = ?`,
      [id]
    );

    const [r] = await pool.execute(
      `DELETE FROM \`${TBL}\` WHERE \`id\` = ?`,
      [id]
    );

    if (rows.length > 0) {
      (async () => {
        try {
          const appointment = rows[0];
          const userMsg = appointmentUserTemplate({ ...appointment, status: 'cancelled' });
          await sendMail({
            to: userMsg.to,
            subject: userMsg.subject,
            html: userMsg.html,
            text: userMsg.text,
          });
        } catch {}
      })();
    }

    res.json({ success: true, deleted: r.affectedRows || 0 });
  } catch (e) {
    console.error('DELETE /api/appointment/:id failed:', e);
    res.status(500).json({ error: e.message || 'Failed to cancel appointment' });
  }
});

export default router;
