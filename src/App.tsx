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

/* New admin pages */
import AmbulancesPage from "@/pages/admin/Ambulances";
import AmbulanceDispatch from "@/pages/admin/AmbulanceDispatch";
import AmbulanceCallList from "@/pages/admin/AmbulanceCallList";
import AmbulanceFleetList from "@/pages/admin/AmbulanceFleetList";
import AmbulanceDetails from "@/pages/admin/AmbulanceDetails";
import PharmacyMedicines from "@/pages/admin/PharmacyMedicines";
import PharmacyInventory from "@/pages/admin/PharmacyInventory";
import BloodStock from "@/pages/admin/BloodStock";
import BloodDonors from "@/pages/admin/BloodDonors";
import BloodIssued from "@/pages/admin/BloodIssued";
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

            {/* Admin feature routes (created for hospital tenants) */}
            <Route path="/admin/ambulances" element={<AmbulancesPage />} />
            <Route path="/admin/ambulances/calls" element={<AmbulanceCallList />} />
            <Route path="/admin/ambulances/list" element={<AmbulanceFleetList />} />
            <Route path="/admin/ambulances/details/:id" element={<AmbulanceDetails />} />
            <Route path="/admin/ambulances/dispatch" element={<AmbulanceDispatch />} />
            <Route path="/admin/pharmacy/medicines" element={<PharmacyMedicines />} />
            <Route path="/admin/pharmacy/inventory" element={<PharmacyInventory />} />
            <Route path="/admin/blood-bank/stock" element={<BloodStock />} />
            <Route path="/admin/blood-bank/donors" element={<BloodDonors />} />
            <Route path="/admin/blood-bank/issued" element={<BloodIssued />} />
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
