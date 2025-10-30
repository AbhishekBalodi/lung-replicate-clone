import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../lib/db.js';
import { sendMail, contactUserTemplate, contactDoctorTemplate } from '../lib/mailer.js';

const COLUMN = {
  table: 'contact_messages',
  first_name: 'first_name',
  last_name: 'last_name',
  email: 'email',
  phone: 'phone',
  subject: 'subject',
  message: 'message'
};

const schema = z.object({
  // Accept either combined name or first/last names
  name: z.string().min(1).optional(),
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  subject: z.string().min(1),
  message: z.string().min(1)
});

const router = Router();

router.post('/', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const v = parsed.data;
  try {
    const first_name = v.firstName || (v.name ? v.name.trim().split(/\s+/)[0] : '');
const last_name = v.lastName || (v.name ? v.name.trim().split(/\s+/).slice(1).join(' ') : '');

const sql = `INSERT INTO \`${COLUMN.table}\` (\`${COLUMN.first_name}\`, \`${COLUMN.last_name}\`, \`${COLUMN.email}\`, \`${COLUMN.phone}\`, \`${COLUMN.subject}\`, \`${COLUMN.message}\`) VALUES (?, ?, ?, ?, ?, ?)`;
const [result] = await pool.execute(sql, [
  first_name,
  last_name,
  v.email,
  v.phone ?? '',
  v.subject,
  v.message
]);
// fire-and-forget email (don't block success if email fails)
    (async () => {
      try {
        const u = contactUserTemplate(v);
        await sendMail({ to: v.email, subject: u.subject, html: u.html, text: u.text });
        const d = contactDoctorTemplate(v);
        await sendMail({ to: d.to, subject: d.subject, html: d.html, text: d.text });
      } catch (e) {
        console.error('Contact email failed:', e.message);
      }
    })();

    res.status(201).json({ success: true, id: result.insertId, ...v, mailed: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
