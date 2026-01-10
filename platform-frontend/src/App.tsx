import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomAuthProvider } from "./contexts/CustomAuthContext";
import { AppointmentProvider } from "./contexts/AppointmentContext";
import DevTenantSwitcher from "./components/DevTenantSwitcher";
import Index from "./pages/Index";
import CustomAuth from "./pages/CustomAuth";
import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Qualifications from "./pages/Qualifications";
import DoctorProfile from "./pages/DoctorProfile";
import Services from "./pages/Services";
import Treatments from "./pages/Treatments";
import ServiceDetail from "./pages/ServiceDetail";
import ConditionDetail from "./pages/ConditionDetail";
import Contact from "./pages/Contact";
import BookAppointment from "./pages/BookAppointment";
import NotFound from "./pages/NotFound";
import AppointmentsPage from "@/pages/Appointments";
import PatientsPage from "@/pages/Patients";
import MedicinesPage from "@/pages/Medicines";
import MedicinesManagement from "@/pages/admin/MedicinesManagement";
import LabTests from "@/pages/admin/LabTests";
import Procedures from "@/pages/admin/Procedures";
import Consultation from "@/pages/admin/Consultation";
import Calendar from "@/pages/Calendar";
import CompletedAppointments from "@/pages/CompletedAppointments";
import Settings from "@/pages/Settings";
import NewAppointment from "@/pages/admin/NewAppointment";
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";

// Super Admin pages (sidebar routes)
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


const queryClient = new QueryClient();

const App = () => (
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
            {/* Tenant routes - this app serves individual tenant websites */}
            <Route path="/" element={<Index />} />
            <Route path="/qualifications" element={<Qualifications />} />
            <Route path="/about" element={<DoctorProfile />} />
            <Route path="/doctors/:doctorName" element={<DoctorProfile />} />
            <Route path="/services" element={<Services />} />
            <Route path="/treatments" element={<Treatments />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/conditions/:slug" element={<ConditionDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/book-appointment" element={<BookAppointment />} />

            <Route path="/login" element={<CustomAuth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
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

            {/* Super Admin sidebar routes */}
            <Route path="/admin/hospital/profile" element={<HospitalProfile />} />
            <Route path="/admin/hospital/departments" element={<Departments />} />
            <Route path="/admin/hospital/infrastructure" element={<Infrastructure />} />

            <Route path="/admin/finance/revenue" element={<FinanceRevenue />} />
            <Route path="/admin/finance/insurance" element={<InsuranceClaims />} />

            <Route path="/admin/lab/pending" element={<LabPendingTests />} />
            <Route path="/admin/lab/revenue" element={<LabRevenue />} />

            <Route path="/admin/reports/daily" element={<DailyReports />} />
            <Route path="/admin/reports/monthly" element={<MonthlyReports />} />
            <Route path="/admin/reports/doctor-revenue" element={<DoctorRevenueReport />} />
            <Route path="/admin/reports/department-revenue" element={<DepartmentRevenueReport />} />

            <Route path="/admin/compliance/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/compliance/access-control" element={<AccessControl />} />
            <Route path="/admin/compliance/data-access" element={<DataAccessLogs />} />

            <Route path="/admin/notifications/system" element={<SystemAlerts />} />
            <Route path="/admin/notifications/settings" element={<NotificationSettings />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppointmentProvider>
  </CustomAuthProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
