/**
 * Platform App - SaaS Administration Application
 * 
 * This is a SEPARATE application from the tenant websites.
 * Deploy this at: admin.yourplatform.com (or similar)
 * 
 * Purpose:
 * - Tenant onboarding (hospitals & doctors registration)
 * - Platform admin dashboard (manage all tenants)
 * - Billing & subscription management
 * - Domain management for tenants
 * - Super Admin dashboard access for tenant admins
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CustomAuthProvider } from "@/contexts/CustomAuthContext";
import { AppointmentProvider } from "@/contexts/AppointmentContext";
import DevTenantSwitcher from "@/components/DevTenantSwitcher";

// Platform pages
import TenantOnboarding from "@/pages/platform/TenantOnboarding";
import PlatformLogin from "@/pages/platform/PlatformLogin";
import PlatformDashboard from "@/pages/platform/PlatformDashboard";
import TenantDetails from "@/pages/platform/TenantDetails";
import TenantSettings from "@/pages/platform/TenantSettings";

// Tenant Admin pages (same as 8080 app)
import Dashboard from "@/pages/Dashboard";
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";
import AppointmentsPage from "@/pages/Appointments";
import PatientsPage from "@/pages/Patients";
import MedicinesManagement from "@/pages/admin/MedicinesManagement";
import LabTests from "@/pages/admin/LabTests";
import Procedures from "@/pages/admin/Procedures";
import Consultation from "@/pages/admin/Consultation";
import Calendar from "@/pages/Calendar";
import CompletedAppointments from "@/pages/CompletedAppointments";
import Settings from "@/pages/Settings";
import NewAppointment from "@/pages/admin/NewAppointment";

/* Admin feature routes */
import AmbulancesPage from "@/pages/admin/Ambulances";
import AmbulanceDispatch from "@/pages/admin/AmbulanceDispatch";
import AmbulanceCallList from "@/pages/admin/AmbulanceCallList";
import AmbulanceFleetList from "@/pages/admin/AmbulanceFleetList";
import AmbulanceDetails from "@/pages/admin/AmbulanceDetails";
import StaffCallList from "@/pages/admin/StaffCallList";
import StaffFleetList from "@/pages/admin/StaffFleetList";
import StaffDetails from "@/pages/admin/StaffDetails";
import PharmacyMedicines from "@/pages/admin/PharmacyMedicines";
import PharmacyInventory from "@/pages/admin/PharmacyInventory";
import BloodStock from "@/pages/admin/BloodStock";
import BloodDonors from "@/pages/admin/BloodDonors";
import BloodIssued from "@/pages/admin/BloodIssued";
import AddBloodUnit from "@/pages/admin/AddBloodUnit";
import IssueBlood from "@/pages/admin/IssueBlood";
import Feedback from "@/pages/admin/Feedback";
import RoomsAlloted from "@/pages/admin/RoomsAlloted";
import NewAllotment from "@/pages/admin/NewAllotment";
import Rooms from "@/pages/admin/Rooms";
import Reviews from "@/pages/admin/Reviews";
import PendingTasks from "@/pages/admin/PendingTasks";
import InvoicesList from "@/pages/admin/InvoicesList";
import CreateInvoice from "@/pages/admin/CreateInvoice";
import InvoiceDetail from "@/pages/admin/InvoiceDetail";
import PaymentsHistory from "@/pages/admin/PaymentsHistory";

/* Super Admin pages */
import HospitalProfile from "@/pages/admin/HospitalProfile";
import Departments from "@/pages/admin/Departments";
import Infrastructure from "@/pages/admin/Infrastructure";
import FinanceRevenue from "@/pages/admin/FinanceRevenue";
import InsuranceClaims from "@/pages/admin/InsuranceClaims";
import LabPendingTests from "@/pages/admin/LabPendingTests";
import LabRevenue from "@/pages/admin/LabRevenue";
import AuditLogs from "@/pages/admin/AuditLogs";
import AccessControl from "@/pages/admin/AccessControl";
import DataAccessLogs from "@/pages/admin/DataAccessLogs";
import SystemAlerts from "@/pages/admin/SystemAlerts";
import NotificationSettings from "@/pages/admin/NotificationSettings";
import DailyReports from "@/pages/admin/DailyReports";
import MonthlyReports from "@/pages/admin/MonthlyReports";
import DoctorRevenueReport from "@/pages/admin/DoctorRevenueReport";
import DepartmentRevenueReport from "@/pages/admin/DepartmentRevenueReport";

/* Feedback & Quality Control */
import PatientFeedback from "@/pages/admin/PatientFeedback";
import DoctorRatings from "@/pages/admin/DoctorRatings";
import ComplaintsManagement from "@/pages/admin/ComplaintsManagement";
import ServiceQualityScore from "@/pages/admin/ServiceQualityScore";

/* System Configuration */
import AppointmentRules from "@/pages/admin/AppointmentRules";
import PricingRules from "@/pages/admin/PricingRules";
import TaxSettings from "@/pages/admin/TaxSettings";
import PaymentGateways from "@/pages/admin/PaymentGateways";
import MessagingIntegrations from "@/pages/admin/MessagingIntegrations";
import WebsiteSettings from "@/pages/admin/WebsiteSettings";

const queryClient = new QueryClient();

const PlatformApp = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CustomAuthProvider>
        <AppointmentProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <DevTenantSwitcher />
            <BrowserRouter>
              <Routes>
                {/* Platform routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<PlatformLogin />} />
                <Route path="/register" element={<TenantOnboarding />} />
                
                {/* Platform Admin Dashboard */}
                <Route path="/platform-dashboard" element={<PlatformDashboard />} />
                
                {/* Tenant detail & settings */}
                <Route path="/tenants/:id" element={<TenantDetails />} />
                <Route path="/tenants/:id/settings" element={<TenantSettings />} />

                {/* Tenant Admin Dashboard Routes (same as 8080) */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/super-admin" element={<SuperAdminDashboard />} />
                
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patients/:id" element={<PatientsPage />} />
                <Route path="/medicines" element={<MedicinesManagement />} />
                <Route path="/lab-tests" element={<LabTests />} />
                <Route path="/procedures" element={<Procedures />} />
                <Route path="/consultation" element={<Consultation />} />
                <Route path="/completed-appointments" element={<CompletedAppointments />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/new-appointment" element={<NewAppointment />} />

                {/* Admin feature routes */}
                <Route path="/admin/ambulances" element={<AmbulancesPage />} />
                <Route path="/admin/staffs/calls" element={<StaffCallList />} />
                <Route path="/admin/staffs/list" element={<StaffFleetList />} />
                <Route path="/admin/staffs/details/:id" element={<StaffDetails />} />
                <Route path="/admin/ambulances/calls" element={<AmbulanceCallList />} />
                <Route path="/admin/ambulances/list" element={<AmbulanceFleetList />} />
                <Route path="/admin/ambulances/details/:id" element={<AmbulanceDetails />} />
                <Route path="/admin/ambulances/dispatch" element={<AmbulanceDispatch />} />
                <Route path="/admin/pharmacy/medicines" element={<PharmacyMedicines />} />
                <Route path="/admin/pharmacy/inventory" element={<PharmacyInventory />} />
                <Route path="/admin/blood-bank/stock" element={<BloodStock />} />
                <Route path="/admin/blood-bank/donors" element={<BloodDonors />} />
                <Route path="/admin/blood-bank/issued" element={<BloodIssued />} />
                <Route path="/admin/blood-bank/add-unit" element={<AddBloodUnit />} />
                <Route path="/admin/blood-bank/issue" element={<IssueBlood />} />
                <Route path="/admin/feedback" element={<Feedback />} />
                <Route path="/admin/rooms/alloted" element={<RoomsAlloted />} />
                <Route path="/admin/rooms/new" element={<NewAllotment />} />
                <Route path="/admin/rooms" element={<Rooms />} />
                <Route path="/admin/reviews" element={<Reviews />} />
                <Route path="/admin/pending-tasks" element={<PendingTasks />} />

                {/* Billing Routes */}
                <Route path="/admin/billing" element={<InvoicesList />} />
                <Route path="/admin/billing/new" element={<CreateInvoice />} />
                <Route path="/admin/billing/invoices/:id" element={<InvoiceDetail />} />
                <Route path="/admin/billing/payments" element={<PaymentsHistory />} />

                {/* Super Admin Routes - Hospital Management */}
                <Route path="/admin/hospital/profile" element={<HospitalProfile />} />
                <Route path="/admin/hospital/departments" element={<Departments />} />
                <Route path="/admin/hospital/infrastructure" element={<Infrastructure />} />
                
                {/* Financial Management */}
                <Route path="/admin/finance/revenue" element={<FinanceRevenue />} />
                <Route path="/admin/finance/insurance" element={<InsuranceClaims />} />
                
                {/* Lab & Diagnostics */}
                <Route path="/admin/lab/pending" element={<LabPendingTests />} />
                <Route path="/admin/lab/revenue" element={<LabRevenue />} />
                
                {/* Compliance & Security */}
                <Route path="/admin/compliance/audit-logs" element={<AuditLogs />} />
                <Route path="/admin/compliance/access-control" element={<AccessControl />} />
                <Route path="/admin/compliance/data-access" element={<DataAccessLogs />} />
                
                {/* Notifications & Alerts */}
                <Route path="/admin/notifications/system" element={<SystemAlerts />} />
                <Route path="/admin/notifications/settings" element={<NotificationSettings />} />
                
                {/* Reports */}
                <Route path="/admin/reports/daily" element={<DailyReports />} />
                <Route path="/admin/reports/monthly" element={<MonthlyReports />} />
                <Route path="/admin/reports/doctor-revenue" element={<DoctorRevenueReport />} />
                <Route path="/admin/reports/department-revenue" element={<DepartmentRevenueReport />} />
                
                {/* Feedback & Quality Control */}
                <Route path="/admin/feedback/patient" element={<PatientFeedback />} />
                <Route path="/admin/feedback/doctor-ratings" element={<DoctorRatings />} />
                <Route path="/admin/feedback/complaints" element={<ComplaintsManagement />} />
                <Route path="/admin/feedback/quality-score" element={<ServiceQualityScore />} />
                
                {/* System Configuration */}
                <Route path="/admin/config/appointment-rules" element={<AppointmentRules />} />
                <Route path="/admin/config/pricing-rules" element={<PricingRules />} />
                <Route path="/admin/config/tax-settings" element={<TaxSettings />} />
                <Route path="/admin/config/payment-gateways" element={<PaymentGateways />} />
                <Route path="/admin/config/messaging" element={<MessagingIntegrations />} />
                <Route path="/admin/config/website" element={<WebsiteSettings />} />

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppointmentProvider>
      </CustomAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default PlatformApp;
