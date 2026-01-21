import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session'; // ✅ ADDED
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

// New tenant feature routes
import bloodBankRouter from './routes/blood-bank.js';
import ambulancesRouter from './routes/ambulances.js';
import roomsRouter from './routes/rooms.js';
import pharmacyRouter from './routes/pharmacy.js';
import reviewsRouter from './routes/reviews.js';
import feedbackRouter from './routes/feedback.js';
import tasksRouter from './routes/tasks.js';
import billingRouter from './routes/billing.js';

// Platform (SaaS) routes
import tenantsRouter from './routes/tenants.js';
import platformAuthRouter from './routes/platform-auth.js';

import dashboardRouter from './routes/dashboard.js';
import scheduleRouter from './routes/schedule.js';


const app = express();

/* ============================================================
   ✅ TRUST PROXY (REQUIRED BEHIND APACHE / HTTPS)
   ============================================================ */
app.set('trust proxy', 1); // ✅ ADDED

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

    // ✅ Allow explicitly configured origins
    if (explicitAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ✅ Allow ANY tenant custom domain (SaaS behavior)
    if (
      origin.startsWith('https://') ||
      origin.startsWith('http://')
    ) {
      return callback(null, true);
    }

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
   ✅ SESSION CONFIGURATION (ADDED)
   MUST COME BEFORE tenantResolver
   ============================================================ */
const isProd = process.env.NODE_ENV === 'production';

app.use(session({
  name: 'saas.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,                        // true in production (HTTPS), false in dev
    sameSite: isProd ? 'none' : 'lax',     // 'none' for cross-origin prod, 'lax' for dev
    domain: process.env.COOKIE_DOMAIN || undefined, // Set in prod if you want to share cookies across subdomains
    maxAge: 24 * 60 * 60 * 1000            // 1 day
  }
}));

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
   🐞 SESSION DEBUG ROUTE (ADDED)
   ============================================================ */

app.get('/api/debug-session', (req, res) => {
  res.json({
    session: req.session,
    cookies: req.headers.cookie || null
  });
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

// New feature routes
app.use('/api/blood-bank', bloodBankRouter);
app.use('/api/ambulances', ambulancesRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/pharmacy', pharmacyRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/billing', billingRouter);

app.use('/api/dashboard', dashboardRouter);
app.use('/api/schedule', scheduleRouter);



/* ============================================================
   🚀 SERVER START
   ============================================================ */

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
