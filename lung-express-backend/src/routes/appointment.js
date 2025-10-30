import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../lib/db.js';
import { sendMail, appointmentUserTemplate, appointmentDoctorTemplate } from '../lib/mailer.js';

const COLUMN = { table: 'appointments',
  full_name: 'full_name',
  email: 'email',
  phone: 'phone',
  appointment_date: 'appointment_date',
  appointment_time: 'appointment_time',
  selected_doctor: 'selected_doctor',
  message: 'message',
  reports_uploaded: 'reports_uploaded'
};

const schema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(4),
  appointment_date: z.string().min(8),
  appointment_time: z.string().min(4),
  selected_doctor: z.string().min(1),
  message: z.string().optional().default(''),
  reports_uploaded: z.boolean().optional().default(false)
});

const router = Router();

router.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const v = parsed.data;
  try {
    const sql = `INSERT INTO \`${COLUMN.table}\` (\`${COLUMN.full_name}\`, \`${COLUMN.email}\`, \`${COLUMN.phone}\`, \`${COLUMN.appointment_date}\`, \`${COLUMN.appointment_time}\`, \`${COLUMN.selected_doctor}\`, \`${COLUMN.message}\`, \`${COLUMN.reports_uploaded}\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [
      v.full_name,
      v.email,
      v.phone,
      v.appointment_date,
      v.appointment_time,
      v.selected_doctor,
      v.message ?? '',
      v.reports_uploaded ? 1 : 0
    ]);

    (async () => {
  try {
    const d = appointmentDoctorTemplate(v);
    await sendMail({ to: d.to, subject: d.subject, html: d.html, text: d.text });
  } catch (e) {
    console.error('Doctor email failed:', e.message);
  }
  })();


    res.status(201).json({ success: true, id: result.insertId, ...v, mailed: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
