import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './lib/db.js';
import contactRouter from './routes/contact.js';
import appointmentRouter from './routes/appointment.js';
import patientsRouter from './routes/patients.js';
import medicinesRouter from './routes/medicines.js';
import prescriptionsRouter from './routes/prescriptions.js';
import labTestsRouter from './routes/lab-tests.js';
import calendarRouter from './routes/calendar.js';
import authRouter from './routes/auth.js';
import smtpSettingsRouter from './routes/smtp-settings.js';

const app = express();

const allowed = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true;
app.use(cors({ origin: allowed, credentials: true }));
app.use(express.json());

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS db');
    res.json({ ok: true, db: rows[0].db });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);
app.use('/api/appointment', appointmentRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/medicines', medicinesRouter);        // catalog
app.use('/api/prescriptions', prescriptionsRouter); // patient prescriptions
app.use('/api/lab-tests', labTestsRouter);          // lab tests
app.use('/api/calendar', calendarRouter);
app.use('/api/smtp-settings', smtpSettingsRouter);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
