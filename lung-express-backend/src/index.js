import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './lib/db.js';

// Middlewares
import { tenantResolver } from './middleware/tenant-resolver.js';
import { doctorContext } from './middleware/doctor-context.js';

// Tenant routes
import contactRouter from './routes/contact.js';
import appointmentRouter from './routes/appointment.js';
import patientsRouter from './routes/patients.js';
import medicinesRouter from './routes/medicines.js';
import prescriptionsRouter from './routes/prescriptions.js';
import labTestsRouter from './routes/lab-tests.js';
import proceduresRouter from './routes/procedures.js';
import calendarRouter from './routes/calendar.js';
import authRouter from './routes/auth.js';
import smtpSettingsRouter from './routes/smtp-settings.js';
import doctorsRouter from './routes/doctors.js';

// Platform (SaaS) routes
import tenantsRouter from './routes/tenants.js';
import platformAuthRouter from './routes/platform-auth.js';

const app = express();

/* ============================================================
   ✅ SAAS-READY CORS CONFIGURATION
   ============================================================ */

const explicitAllowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow Postman / curl / server-to-server
    if (!origin) return callback(null, true);

    // ✅ Allow localhost (dev)
    if (origin.includes('localhost')) {
      return callback(null, true);
    }

    // ✅ Allow explicitly configured origins (platform frontend, etc.)
    if (explicitAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ✅ Allow ANY tenant custom domain (SaaS behavior)
    // You can tighten this later if needed
    if (
      origin.startsWith('https://') ||
      origin.startsWith('http://')
    ) {
      return callback(null, true);
    }

    // ❌ Block everything else
    console.error('❌ CORS blocked origin:', origin);
    return callback(new Error(`CORS not allowed: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Tenant-Code',
    'X-Doctor-Id',
    'X-User-Role'
  ]
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

/* ============================================================
   🔹 BASIC HEALTH / DEBUG ROUTES
   ============================================================ */

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

/* ============================================================
   🧠 PLATFORM ROUTES (NO TENANT / NO DOCTOR CONTEXT)
   ============================================================ */

app.use('/api/platform/auth', platformAuthRouter);
app.use('/api/tenants', tenantsRouter);

/* ============================================================
   🏥 TENANT CONTEXT (ONLY FOR TENANT WEBSITES)
   ============================================================ */

app.use(tenantResolver);   // resolves tenant DB
app.use(doctorContext);    // resolves doctor_id

/* ============================================================
   👨‍⚕️ TENANT ROUTES
   ============================================================ */

app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);
app.use('/api/appointment', appointmentRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/medicines', medicinesRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/lab-tests', labTestsRouter);
app.use('/api/procedures', proceduresRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/smtp-settings', smtpSettingsRouter);
app.use('/api/doctors', doctorsRouter);

/* ============================================================
   🚀 SERVER START
   ============================================================ */

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
