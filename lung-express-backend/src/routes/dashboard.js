import express from 'express';
import { getSuperAdminDashboard } from '../lib/superadmin.dashboard.kpi.js';
import { getSuperAdminDashboardCharts } from '../lib/superadmin.dashboard.charts.js';

// Admin dashboard APIs
import { getRoomsSummary, getRoomsList, getRoomAllotments } from '../lib/admin.rooms.js';
import { getBloodBankSummary, getBloodStock, getBloodDonors, addBloodStock, getBloodGroups } from '../lib/admin.blood-bank.js';
import { getStaffSummary, getStaffList } from '../lib/admin.staff.js';
import { getFeedbackSummary, getFeedbackList } from '../lib/admin.feedback.js';
import { getBillingSummary, getRevenueByMonth, getRevenueByDoctor } from '../lib/admin.billing.js';
import { getAppointmentsSummary, getAppointmentsByDoctor, getAppointmentsByMonth } from '../lib/admin.appointments.js';
import { getPatientsSummary, getPatientsByMonth, getPatientsByDoctor } from '../lib/admin.patients.js';

// Patient dashboard APIs
import {
  getPatientHome,
  getPatientAppointments,
  getPatientMedicalRecords,
  getPatientPrescriptions,
  getPatientLabReports,
  getPatientBilling,
  getPatientTimeline
} from '../lib/patient.dashboard.js';

const router = express.Router();

/* ============================================================
   SUPER ADMIN / ADMIN DASHBOARD ROUTES
   ============================================================ */
router.get('/superadmin', getSuperAdminDashboard);
router.get('/superadmin/charts', getSuperAdminDashboardCharts);

/* ============================================================
   ROOMS MANAGEMENT
   ============================================================ */
router.get('/rooms/summary', getRoomsSummary);
router.get('/rooms/list', getRoomsList);
router.get('/rooms/allotments', getRoomAllotments);

/* ============================================================
   BLOOD BANK MANAGEMENT
   ============================================================ */
router.get('/blood-bank/summary', getBloodBankSummary);
router.get('/blood-bank/stock', getBloodStock);
router.post('/blood-bank/stock', addBloodStock);
router.get('/blood-bank/donors', getBloodDonors);
router.get('/blood-bank/blood-groups', getBloodGroups);

/* ============================================================
   STAFF MANAGEMENT
   ============================================================ */
router.get('/staff/summary', getStaffSummary);
router.get('/staff/list', getStaffList);

/* ============================================================
   FEEDBACK MANAGEMENT
   ============================================================ */
router.get('/feedback/summary', getFeedbackSummary);
router.get('/feedback/list', getFeedbackList);

/* ============================================================
   BILLING / REVENUE ANALYTICS
   ============================================================ */
router.get('/billing/summary', getBillingSummary);
router.get('/billing/revenue-by-month', getRevenueByMonth);
router.get('/billing/revenue-by-doctor', getRevenueByDoctor);

/* ============================================================
   APPOINTMENTS ANALYTICS
   ============================================================ */
router.get('/appointments/summary', getAppointmentsSummary);
router.get('/appointments/by-doctor', getAppointmentsByDoctor);
router.get('/appointments/by-month', getAppointmentsByMonth);

/* ============================================================
   PATIENTS ANALYTICS
   ============================================================ */
router.get('/patients/summary', getPatientsSummary);
router.get('/patients/by-month', getPatientsByMonth);
router.get('/patients/by-doctor', getPatientsByDoctor);

/* ============================================================
   PATIENT DASHBOARD ROUTES
   (For logged-in patients to view their own data)
   ============================================================ */
router.get('/patient/home', getPatientHome);
router.get('/patient/appointments', getPatientAppointments);
router.get('/patient/medical-records', getPatientMedicalRecords);
router.get('/patient/prescriptions', getPatientPrescriptions);
router.get('/patient/lab-reports', getPatientLabReports);
router.get('/patient/billing', getPatientBilling);
router.get('/patient/timeline', getPatientTimeline);

export default router;
