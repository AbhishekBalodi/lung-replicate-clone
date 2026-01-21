import express from 'express';
import { getSuperAdminDashboard } from '../lib/superadmin.dashboard.kpi.js';
import { getSuperAdminDashboardCharts } from '../lib/superadmin.dashboard.charts.js';

// Admin dashboard APIs
import { getRoomsSummary, getRoomsList, getRoomAllotments, addRoom, addRoomAllotment } from '../lib/admin.rooms.js';
import { getBloodBankSummary, getBloodStock, getBloodDonors, addBloodStock, getBloodGroups, addBloodDonor, getBloodDonorsSummary, getBloodDonorsCharts } from '../lib/admin.blood-bank.js';
import { getStaffSummary, getStaffList, addStaff, updateStaff, deleteStaff } from '../lib/admin.staff.js';
import { getFeedbackSummary, getFeedbackList } from '../lib/admin.feedback.js';
import { getBillingSummary, getRevenueByMonth, getRevenueByDoctor } from '../lib/admin.billing.js';
import { getAppointmentsSummary, getAppointmentsByDoctor, getAppointmentsByMonth } from '../lib/admin.appointments.js';
import { getPatientsSummary, getPatientsByMonth, getPatientsByDoctor } from '../lib/admin.patients.js';

// Ambulance APIs
import { getAmbulanceCallsSummary, getAmbulanceCallsList, addAmbulanceCall, updateAmbulanceCallStatus, getAmbulanceFleetList, addAmbulance, updateAmbulance, getAmbulanceDetails } from '../lib/admin.ambulance.js';

// Pharmacy APIs
import { getPharmacyMedicinesList, addPharmacyMedicine, updatePharmacyMedicine, deletePharmacyMedicine, getPharmacyInventory, getPharmacyInventorySummary, addPharmacyInventory, updatePharmacyInventory } from '../lib/admin.pharmacy.js';

// Invoices & Payments APIs
import { getInvoicesSummary, getInvoicesList, getInvoiceById, createInvoice, updateInvoiceStatus, getPaymentsHistory, addPayment, getPaymentMethods } from '../lib/admin.invoices.js';

// EMR APIs
import { getDiagnosisNotes, addDiagnosisNote, updateDiagnosisNote, deleteDiagnosisNote, getTreatmentPlans, addTreatmentPlan, updateTreatmentPlan, getProgressNotes, addProgressNote, getMedicalDocuments, addMedicalDocument, deleteMedicalDocument } from '../lib/admin.emr.js';

// Follow-ups & Care Plans APIs
import { getFollowUpsSummary, getFollowUpsList, addFollowUp, updateFollowUp, markFollowUpComplete, getCarePlans, addCarePlan, updateCarePlan } from '../lib/admin.followups.js';

// Compliance & Security APIs
import { getAuditLogsSummary, getAuditLogs, addAuditLog, getAccessControlList, updateRolePermissions, getDataAccessLogs, logDataAccess } from '../lib/admin.compliance.js';

// Reports APIs
import { getDailyReport, getMonthlyReport, getDoctorRevenueReport, getDepartmentRevenueReport, getLabRevenueReport } from '../lib/admin.reports.js';

// Notifications APIs
import { getSystemAlerts, getSystemAlertsSummary, createSystemAlert, dismissAlert, getNotificationSettings, updateNotificationSetting, saveNotificationSettings } from '../lib/admin.notifications.js';

// Hospital Management APIs
import { getHospitalProfile, updateHospitalProfile, getDepartments, addDepartment, updateDepartment, deleteDepartment, getInfrastructure, addFacility, addEquipment } from '../lib/admin.hospital.js';

// Financial Management APIs
import { getRevenueOverview, getRevenueTrend, getBillingDashboard, getInsuranceClaims, getInsuranceClaimsSummary, addInsuranceClaim, updateInsuranceClaimStatus } from '../lib/admin.financial.js';

// Patient dashboard APIs
import { getPatientHome, getPatientAppointments, getPatientMedicalRecords, getPatientPrescriptions, getPatientLabReports, getPatientBilling, getPatientTimeline } from '../lib/patient.dashboard.js';

// Patient communications APIs
import { getPatientTelemedicineSessions, bookTelemedicineSession, getPatientConversations, getPatientMessages, sendPatientMessage, getPatientNotifications, markNotificationAsRead, markAllNotificationsRead as markAllPatientNotificationsRead, deletePatientNotification } from '../lib/patient.communications.js';

// Patient doctors API (for dynamic specialties)
import { getPatientDoctors, getPatientSpecializations } from '../lib/patient.doctors.js';

// Patient telemedicine chat/video APIs
import { getTelemedicineChat, sendTelemedicineMessage, startVideoCall, endVideoCall, getTelemedicineDoctors } from '../lib/patient.telemedicine.js';

// Patient profile APIs
import { getPatientProfile, updatePatientProfile, updateEmergencyContact, addFamilyMember, getPatientSettings, updatePatientSettings } from '../lib/patient.profile.js';

// Patient support APIs
import { getPatientSupportTickets, createSupportTicket, getSupportTicketDetails, getDoctorsForFeedback, submitDoctorRating, submitHospitalFeedback, submitComplaint } from '../lib/patient.support.js';

// Telemedicine APIs
import { getTelemedicineSummary, getTelemedicineSessions, addTelemedicineSession, updateTelemedicineSession } from '../lib/admin.telemedicine.js';

// Schedule APIs
import { getScheduleSlots, addScheduleSlot, updateScheduleSlot, deleteScheduleSlot, toggleSlotActive, getLeaveRequests, addLeaveRequest, updateLeaveRequest, getScheduleSettings, saveScheduleSettings } from '../lib/admin.schedule.js';

// Tasks APIs
import { getTasksSummary, getTasksList, addTask, completeTask, deleteTask, getNotificationsSummary, getNotificationsList, markNotificationRead, markAllNotificationsRead, dismissNotification } from '../lib/admin.tasks.js';

// Analytics APIs
import { getDoctorAnalyticsSummary, getMonthlyTrends, getAppointmentStatusDistribution, getRatingBreakdown } from '../lib/admin.analytics.js';

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
router.post('/rooms', addRoom);
router.post('/rooms/allotments', addRoomAllotment);

/* ============================================================
   BLOOD BANK MANAGEMENT
   ============================================================ */
router.get('/blood-bank/summary', getBloodBankSummary);
router.get('/blood-bank/stock', getBloodStock);
router.post('/blood-bank/stock', addBloodStock);
router.get('/blood-bank/donors', getBloodDonors);
router.post('/blood-bank/donors', addBloodDonor);
router.get('/blood-bank/donors/summary', getBloodDonorsSummary);
router.get('/blood-bank/donors/charts', getBloodDonorsCharts);
router.get('/blood-bank/blood-groups', getBloodGroups);

/* ============================================================
   AMBULANCE MANAGEMENT
   ============================================================ */
router.get('/ambulance/summary', getAmbulanceCallsSummary);
router.get('/ambulance/calls', getAmbulanceCallsList);
router.post('/ambulance/calls', addAmbulanceCall);
router.put('/ambulance/calls/:id/status', updateAmbulanceCallStatus);
router.get('/ambulance/fleet', getAmbulanceFleetList);
router.post('/ambulance/fleet', addAmbulance);
router.put('/ambulance/fleet/:id', updateAmbulance);
router.get('/ambulance/fleet/:id', getAmbulanceDetails);

/* ============================================================
   STAFF MANAGEMENT
   ============================================================ */
router.get('/staff/summary', getStaffSummary);
router.get('/staff/list', getStaffList);
router.post('/staff', addStaff);

/* ============================================================
   PHARMACY MANAGEMENT
   ============================================================ */
router.get('/pharmacy/medicines', getPharmacyMedicinesList);
router.post('/pharmacy/medicines', addPharmacyMedicine);
router.put('/pharmacy/medicines/:id', updatePharmacyMedicine);
router.delete('/pharmacy/medicines/:id', deletePharmacyMedicine);
router.get('/pharmacy/inventory', getPharmacyInventory);
router.get('/pharmacy/inventory/summary', getPharmacyInventorySummary);
router.post('/pharmacy/inventory', addPharmacyInventory);
router.put('/pharmacy/inventory/:id', updatePharmacyInventory);

/* ============================================================
   INVOICES & PAYMENTS
   ============================================================ */
router.get('/invoices/summary', getInvoicesSummary);
router.get('/invoices', getInvoicesList);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices', createInvoice);
router.put('/invoices/:id/status', updateInvoiceStatus);
router.get('/payments/history', getPaymentsHistory);
router.post('/payments', addPayment);
router.get('/payments/methods', getPaymentMethods);

/* ============================================================
   EMR - ELECTRONIC MEDICAL RECORDS
   ============================================================ */
router.get('/emr/diagnosis-notes', getDiagnosisNotes);
router.post('/emr/diagnosis-notes', addDiagnosisNote);
router.put('/emr/diagnosis-notes/:id', updateDiagnosisNote);
router.delete('/emr/diagnosis-notes/:id', deleteDiagnosisNote);
router.get('/emr/treatment-plans', getTreatmentPlans);
router.post('/emr/treatment-plans', addTreatmentPlan);
router.put('/emr/treatment-plans/:id', updateTreatmentPlan);
router.get('/emr/progress-notes', getProgressNotes);
router.post('/emr/progress-notes', addProgressNote);
router.get('/emr/documents', getMedicalDocuments);
router.post('/emr/documents', addMedicalDocument);
router.delete('/emr/documents/:id', deleteMedicalDocument);

/* ============================================================
   FOLLOW-UPS & CARE PLANS
   ============================================================ */
router.get('/follow-ups/summary', getFollowUpsSummary);
router.get('/follow-ups', getFollowUpsList);
router.post('/follow-ups', addFollowUp);
router.put('/follow-ups/:id', updateFollowUp);
router.put('/follow-ups/:id/complete', markFollowUpComplete);
router.get('/care-plans', getCarePlans);
router.post('/care-plans', addCarePlan);
router.put('/care-plans/:id', updateCarePlan);

/* ============================================================
   COMPLIANCE & SECURITY
   ============================================================ */
router.get('/audit-logs/summary', getAuditLogsSummary);
router.get('/audit-logs', getAuditLogs);
router.post('/audit-logs', addAuditLog);
router.get('/access-control', getAccessControlList);
router.put('/access-control/roles/:id/permissions', updateRolePermissions);
router.get('/data-access-logs', getDataAccessLogs);
router.post('/data-access-logs', logDataAccess);

/* ============================================================
   REPORTS
   ============================================================ */
router.get('/reports/daily', getDailyReport);
router.get('/reports/monthly', getMonthlyReport);
router.get('/reports/doctor-revenue', getDoctorRevenueReport);
router.get('/reports/department-revenue', getDepartmentRevenueReport);
router.get('/reports/lab-revenue', getLabRevenueReport);

/* ============================================================
   NOTIFICATIONS & ALERTS
   ============================================================ */
router.get('/system-alerts/summary', getSystemAlertsSummary);
router.get('/system-alerts', getSystemAlerts);
router.post('/system-alerts', createSystemAlert);
router.put('/system-alerts/:id/dismiss', dismissAlert);
router.get('/notification-settings', getNotificationSettings);
router.put('/notification-settings/:id', updateNotificationSetting);
router.post('/notification-settings', saveNotificationSettings);

/* ============================================================
   HOSPITAL MANAGEMENT
   ============================================================ */
router.get('/hospital/profile', getHospitalProfile);
router.put('/hospital/profile', updateHospitalProfile);
router.get('/hospital/departments', getDepartments);
router.post('/hospital/departments', addDepartment);
router.put('/hospital/departments/:id', updateDepartment);
router.delete('/hospital/departments/:id', deleteDepartment);
router.get('/hospital/infrastructure', getInfrastructure);
router.post('/hospital/facilities', addFacility);
router.post('/hospital/equipment', addEquipment);

/* ============================================================
   FINANCIAL MANAGEMENT
   ============================================================ */
router.get('/financial/revenue-overview', getRevenueOverview);
router.get('/financial/revenue-trend', getRevenueTrend);
router.get('/financial/billing-dashboard', getBillingDashboard);
router.get('/financial/insurance-claims', getInsuranceClaims);
router.get('/financial/insurance-claims/summary', getInsuranceClaimsSummary);
router.post('/financial/insurance-claims', addInsuranceClaim);
router.put('/financial/insurance-claims/:id/status', updateInsuranceClaimStatus);

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
   ============================================================ */
router.get('/patient/home', getPatientHome);
router.get('/patient/appointments', getPatientAppointments);
router.get('/patient/medical-records', getPatientMedicalRecords);
router.get('/patient/prescriptions', getPatientPrescriptions);
router.get('/patient/lab-reports', getPatientLabReports);
router.get('/patient/billing', getPatientBilling);
router.get('/patient/timeline', getPatientTimeline);

/* ============================================================
   PATIENT TELEMEDICINE
   ============================================================ */
router.get('/patient/telemedicine/sessions', getPatientTelemedicineSessions);
router.post('/patient/telemedicine/sessions', bookTelemedicineSession);

/* ============================================================
   PATIENT MESSAGES
   ============================================================ */
router.get('/patient/messages/conversations', getPatientConversations);
router.get('/patient/messages/:conversationId', getPatientMessages);
router.post('/patient/messages', sendPatientMessage);

/* ============================================================
   PATIENT NOTIFICATIONS
   ============================================================ */
router.get('/patient/notifications', getPatientNotifications);
router.put('/patient/notifications/:id/read', markNotificationAsRead);
router.post('/patient/notifications/read-all', markAllPatientNotificationsRead);
router.delete('/patient/notifications/:id', deletePatientNotification);

/* ============================================================
   PATIENT PROFILE
   ============================================================ */
router.get('/patient/profile', getPatientProfile);
router.put('/patient/profile', updatePatientProfile);
router.put('/patient/emergency-contact', updateEmergencyContact);
router.post('/patient/family-members', addFamilyMember);
router.get('/patient/settings', getPatientSettings);
router.put('/patient/settings', updatePatientSettings);

/* ============================================================
   PATIENT SUPPORT & FEEDBACK
   ============================================================ */
router.get('/patient/support/tickets', getPatientSupportTickets);
router.post('/patient/support/tickets', createSupportTicket);
router.get('/patient/support/tickets/:id', getSupportTicketDetails);
router.get('/patient/feedback/doctors', getDoctorsForFeedback);
router.post('/patient/feedback/doctor-rating', submitDoctorRating);
router.post('/patient/feedback/hospital', submitHospitalFeedback);
router.post('/patient/feedback/complaint', submitComplaint);

/* ============================================================
   TELEMEDICINE
   ============================================================ */
router.get('/telemedicine/summary', getTelemedicineSummary);
router.get('/telemedicine/sessions', getTelemedicineSessions);
router.post('/telemedicine/sessions', addTelemedicineSession);
router.put('/telemedicine/sessions/:id', updateTelemedicineSession);

/* ============================================================
   SCHEDULE & AVAILABILITY
   ============================================================ */
router.get('/schedule/slots', getScheduleSlots);
router.post('/schedule/slots', addScheduleSlot);
router.put('/schedule/slots/:id', updateScheduleSlot);
router.delete('/schedule/slots/:id', deleteScheduleSlot);
router.put('/schedule/slots/:id/toggle', toggleSlotActive);
router.get('/schedule/leaves', getLeaveRequests);
router.post('/schedule/leaves', addLeaveRequest);
router.put('/schedule/leaves/:id', updateLeaveRequest);
router.get('/schedule/settings', getScheduleSettings);
router.post('/schedule/settings', saveScheduleSettings);

/* ============================================================
   TASKS & NOTIFICATIONS
   ============================================================ */
router.get('/tasks/summary', getTasksSummary);
router.get('/tasks', getTasksList);
router.post('/tasks', addTask);
router.put('/tasks/:id/complete', completeTask);
router.delete('/tasks/:id', deleteTask);
router.get('/notifications/summary', getNotificationsSummary);
router.get('/notifications', getNotificationsList);
router.put('/notifications/:id/read', markNotificationRead);
router.post('/notifications/read-all', markAllNotificationsRead);
router.delete('/notifications/:id', dismissNotification);

/* ============================================================
   DOCTOR ANALYTICS
   ============================================================ */
router.get('/analytics/summary', getDoctorAnalyticsSummary);
router.get('/analytics/trends', getMonthlyTrends);
router.get('/analytics/status-distribution', getAppointmentStatusDistribution);
router.get('/analytics/ratings', getRatingBreakdown);

/* ============================================================
   PATIENT DOCTORS (Dynamic Specialties)
   ============================================================ */
router.get('/patient/doctors', getPatientDoctors);
router.get('/patient/specializations', getPatientSpecializations);

/* ============================================================
   PATIENT TELEMEDICINE CHAT & VIDEO
   ============================================================ */
router.get('/patient/telemedicine/chat/:sessionId', getTelemedicineChat);
router.post('/patient/telemedicine/chat/:sessionId', sendTelemedicineMessage);
router.post('/patient/telemedicine/start-video/:sessionId', startVideoCall);
router.post('/patient/telemedicine/end-video/:sessionId', endVideoCall);
router.get('/patient/telemedicine/doctors', getTelemedicineDoctors);

export default router;
