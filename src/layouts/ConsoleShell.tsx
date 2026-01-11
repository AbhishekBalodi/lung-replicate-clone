import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LogOut, MapPin, Phone, Clock, Menu, X, Search, Plus, ArrowLeft, 
  Ambulance, Pill, Droplets, Receipt, Building2, Package, Users2, 
  FileText, DoorOpen, Star, MessageSquare, ChevronDown, ChevronRight,
  ListTodo, FlaskConical, TrendingUp, Shield, Bell, Settings, BarChart3, Activity,
  Palette
} from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import MedicinesContent from "@/pages/admin/MedicinesContent";
import LabTestsContent from "@/pages/admin/LabTestsContent";
import ProceduresContent from "@/pages/admin/ProceduresContent";
import PatientsListSidebar from "@/pages/admin/PatientsListSidebar";
import SettingsContent from "@/pages/SettingsContent";
import ConsultationSidebar from "@/pages/admin/ConsultationSidebar";


type SidebarPage = "patients" | "medicines" | "lab-tests" | "procedures" | "consultation" | "settings" | "blood-bank" | "billing" | "pharmacy" | "room-allotment" | null;

type Props = {
  children: ReactNode;
  todayCount?: number;
};

export default function ConsoleShell({ children, todayCount = 0 }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, loading } = useCustomAuth();

  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarPage, setActiveSidebarPage] = useState<SidebarPage>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});


  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const isActive = (path: string) =>
    pathname === path
      ? "bg-emerald-100 text-emerald-900 font-medium"
      : "hover:bg-emerald-100 text-emerald-800";

  const handleSearch = () => {
    const base = pathname.startsWith("/appointments") ? pathname : "/appointments";
    navigate(`${base}?q=${encodeURIComponent(search)}`);
  };

  const handleNewAppointment = () => {
    navigate("/new-appointment");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCloseSidebarPage = () => {
    setActiveSidebarPage(null);
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  if (loading || !user) return null;

  // Dynamic sidebar width: smaller for menu, larger for sub-pages
  const sidebarWidth = activeSidebarPage ? "w-[700px]" : "w-[280px]";

  return (
    <div className="min-h-screen bg-emerald-50/30 flex">

      {/* SIDEBAR - now part of flex layout, pushes content */}
      <aside
        className={`${sidebarWidth} max-w-[90vw] min-h-screen shrink-0
                    flex flex-col bg-emerald-50 border-r border-emerald-100 p-4
                    transition-all duration-300 
                    ${sidebarOpen ? "ml-0" : "-ml-[280px]"}
                    ${sidebarOpen && activeSidebarPage ? "-ml-0" : ""}
                    ${!sidebarOpen ? (activeSidebarPage ? "-ml-[700px]" : "-ml-[280px]") : ""}`}
        style={{
          marginLeft: sidebarOpen ? 0 : (activeSidebarPage ? "-700px" : "-280px")
        }}
      >

        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between mb-6 px-2 shrink-0">
          <div className="text-emerald-900 font-semibold text-lg">CareConsole</div>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-emerald-100 rounded-md">
            <X className="h-5 w-5 text-emerald-900" />
          </button>
        </div>

        {/* MENU (ONLY WHEN NOT INSIDE SUB-PAGE) */}
        {!activeSidebarPage && (
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-1">
              <button onClick={() => { 
                const dashboardPath = user?.role === "super_admin" ? "/super-admin" : "/dashboard";
                navigate(dashboardPath); 
                setSidebarOpen(false); 
              }} className={`w-full text-left rounded-lg px-3 py-2 ${isActive(user?.role === "super_admin" ? "/super-admin" : "/dashboard")}`}>
                Dashboard
              </button>

              <button onClick={() => { navigate("/appointments"); setSidebarOpen(false); }} className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/appointments")}`}>
                Appointments
              </button>

              <button onClick={() => { navigate("/calendar"); setSidebarOpen(false); }} className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/calendar")}`}>
                Calendar
              </button>

              {/* PATIENTS → open sidebar page */}
              <button
                onClick={() => setActiveSidebarPage("patients")}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800"
              >
                Patients
              </button>

              <button onClick={() => setActiveSidebarPage("medicines")} className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800">
                Medicines
              </button>

              <button onClick={() => setActiveSidebarPage("lab-tests")} className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800">
                Lab Tests
              </button>

              <button onClick={() => setActiveSidebarPage("procedures")} className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800">
                Procedures
              </button>

              <button onClick={() => setActiveSidebarPage("consultation")} className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800">
                Consultation
              </button>

              <button onClick={() => navigate("/completed-appointments")} className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/completed-appointments")}`}>
                Completed
              </button>

              {/* Pending Tasks */}
              <button onClick={() => { navigate('/admin/pending-tasks'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Pending Tasks
              </button>

              {/* Theme & Templates - Available to both admin and super_admin */}
              <button onClick={() => { navigate('/admin/config/theme-templates'); setSidebarOpen(false); }} className={`w-full text-left rounded-lg px-3 py-2 ${isActive('/admin/config/theme-templates')} flex items-center gap-2`}>
                <Palette className="h-4 w-4" />
                Theme & Templates
              </button>

              {/* Ambulance - Expandable */}
              <div>
                <button 
                  onClick={() => toggleMenu('ambulance')}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Ambulance className="h-4 w-4" />
                    Ambulance
                  </span>
                  {expandedMenus['ambulance'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {expandedMenus['ambulance'] && (
                  <div className="ml-6 space-y-1 mt-1">
                    <button onClick={() => { navigate('/admin/ambulances/calls'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Ambulance Call List</button>
                    <button onClick={() => { navigate('/admin/ambulances/list'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Ambulance List</button>
                    <button onClick={() => { navigate('/admin/ambulances/details/AMB-002'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Ambulance Details</button>
                  </div>
                )}
              </div>

              {/* Ambulance - Expandable */}
              <div>
                <button 
                  onClick={() => toggleMenu('staff')}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Users2 className="h-4 w-4" />
                    Staff
                  </span>
                  {expandedMenus['staff'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {expandedMenus['staff'] && (
                  <div className="ml-6 space-y-1 mt-1">
                    <button onClick={() => { navigate('/admin/staffs/calls'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Staff Call List</button>
                    <button onClick={() => { navigate('/admin/staffs/list'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Staff List</button>
                    <button onClick={() => { navigate('/admin/staffs/details/STAFF-002'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Staff Details</button>
                  </div>
                )}
              </div>

              {/* Pharmacy - Expandable */}
              <div>
                <button 
                  onClick={() => toggleMenu('pharmacy')}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Pharmacy
                  </span>
                  {expandedMenus['pharmacy'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {expandedMenus['pharmacy'] && (
                  <div className="ml-6 space-y-1 mt-1">
                    <button onClick={() => { navigate('/admin/pharmacy/medicines'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Medicine List</button>
                    <button onClick={() => { navigate('/admin/pharmacy/inventory'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Inventory</button>
                  </div>
                )}
              </div>

              {/* Blood Bank - Expandable */}
              <div>
                <button 
                  onClick={() => toggleMenu('blood-bank')}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    Blood Bank
                  </span>
                  {expandedMenus['blood-bank'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
{expandedMenus['blood-bank'] && (
                  <div className="ml-6 space-y-1 mt-1">
                    <button onClick={() => { navigate('/admin/blood-bank/stock'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Blood Stock</button>
                    <button onClick={() => { navigate('/admin/blood-bank/donors'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Blood Donor</button>
                    <button onClick={() => { navigate('/admin/blood-bank/issued'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Blood Issued</button>
                    <button onClick={() => { navigate('/admin/blood-bank/add-unit'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Add Blood Unit</button>
                    <button onClick={() => { navigate('/admin/blood-bank/issue'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Issue Blood</button>
                  </div>
                )}
              </div>

              {/* Billing - Expandable */}
              <div>
                <button 
                  onClick={() => toggleMenu('billing')}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Billing
                  </span>
                  {expandedMenus['billing'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {expandedMenus['billing'] && (
                  <div className="ml-6 space-y-1 mt-1">
                    <button onClick={() => { navigate('/admin/billing'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Invoices List</button>
                    <button onClick={() => { navigate('/admin/billing/new'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Create Invoice</button>
                    <button onClick={() => { navigate('/admin/billing/payments'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Payments History</button>
                  </div>
                )}
              </div>

              {/* Room Allotment - Expandable */}
              <div>
                <button 
                  onClick={() => toggleMenu('room-allotment')}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4" />
                    Room Allotment
                  </span>
                  {expandedMenus['room-allotment'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {expandedMenus['room-allotment'] && (
                  <div className="ml-6 space-y-1 mt-1">
                    <button onClick={() => { navigate('/admin/rooms/alloted'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Alloted Rooms</button>
                    <button onClick={() => { navigate('/admin/rooms/new'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">New Allotment</button>
                    <button onClick={() => { navigate('/admin/rooms'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Rooms by Department</button>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <button onClick={() => { navigate('/admin/reviews'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Reviews
              </button>

              {/* Feedback & Quality Control - Expandable */}
              <div>
                <button 
                  onClick={() => toggleMenu('feedback')}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Feedback & Quality
                  </span>
                  {expandedMenus['feedback'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {expandedMenus['feedback'] && (
                  <div className="ml-6 space-y-1 mt-1">
                    <button onClick={() => { navigate('/admin/feedback/patient'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Patient Feedback</button>
                    <button onClick={() => { navigate('/admin/feedback/doctor-ratings'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Doctor Ratings</button>
                    <button onClick={() => { navigate('/admin/feedback/complaints'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Complaints Management</button>
                    <button onClick={() => { navigate('/admin/feedback/quality-score'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Service Quality Score</button>
                  </div>
                )}
              </div>

              {/* System Configuration - Expandable (Super Admin Only) */}
              {user?.role === "super_admin" && (
                <div>
                  <button 
                    onClick={() => toggleMenu('system-config')}
                    className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      System Configuration
                    </span>
                    {expandedMenus['system-config'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expandedMenus['system-config'] && (
                    <div className="ml-6 space-y-1 mt-1">
                      <button onClick={() => { navigate('/admin/config/website'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700 font-medium">Website Settings</button>
                      <button onClick={() => { navigate('/admin/config/theme-templates'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700 flex items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5" />
                        Theme & Templates
                      </button>
                      <button onClick={() => { navigate('/admin/config/appointment-rules'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Appointment Rules</button>
                      <button onClick={() => { navigate('/admin/config/pricing-rules'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Pricing Rules</button>
                      <button onClick={() => { navigate('/admin/config/tax-settings'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Tax Settings</button>
                      <button onClick={() => { navigate('/admin/config/payment-gateways'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Payment Gateways</button>
                      <button onClick={() => { navigate('/admin/config/messaging'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">SMS/Email/WhatsApp</button>
                    </div>
                  )}
                </div>
              )}

              {/* Hospital Management - Expandable (Super Admin Only) */}
              {user?.role === "super_admin" && (
                <div>
                  <button 
                    onClick={() => toggleMenu('hospital-mgmt')}
                    className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Hospital Management
                    </span>
                    {expandedMenus['hospital-mgmt'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expandedMenus['hospital-mgmt'] && (
                    <div className="ml-6 space-y-1 mt-1">
                      <button onClick={() => { navigate('/admin/hospital/profile'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Hospital Profile</button>
                      <button onClick={() => { navigate('/admin/hospital/departments'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Departments</button>
                      <button onClick={() => { navigate('/admin/hospital/infrastructure'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Infrastructure</button>
                    </div>
                  )}
                </div>
              )}

              {/* Financial Management - Expandable (Super Admin Only) */}
              {user?.role === "super_admin" && (
                <div>
                  <button 
                    onClick={() => toggleMenu('finance')}
                    className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Financial Management
                    </span>
                    {expandedMenus['finance'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expandedMenus['finance'] && (
                    <div className="ml-6 space-y-1 mt-1">
                      <button onClick={() => { navigate('/admin/finance/revenue'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Revenue</button>
                      <button onClick={() => { navigate('/admin/billing'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Billing</button>
                      <button onClick={() => { navigate('/admin/finance/insurance'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Insurance & Claims</button>
                    </div>
                  )}
                </div>
              )}

              {/* Lab & Diagnostics - Expandable */}
              <div>
                <button 
                  onClick={() => toggleMenu('lab')}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Lab & Diagnostics
                  </span>
                  {expandedMenus['lab'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {expandedMenus['lab'] && (
                  <div className="ml-6 space-y-1 mt-1">
                    <button onClick={() => setActiveSidebarPage("lab-tests")} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Tests Offered</button>
                    <button onClick={() => { navigate('/admin/lab/pending'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Pending Tests</button>
                    <button onClick={() => { navigate('/admin/lab/revenue'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Lab Revenue</button>
                  </div>
                )}
              </div>

              {/* Reports - Expandable (Super Admin Only) */}
              {user?.role === "super_admin" && (
                <div>
                  <button 
                    onClick={() => toggleMenu('reports')}
                    className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Reports
                    </span>
                    {expandedMenus['reports'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expandedMenus['reports'] && (
                    <div className="ml-6 space-y-1 mt-1">
                      <button onClick={() => { navigate('/admin/reports/daily'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Daily Reports</button>
                      <button onClick={() => { navigate('/admin/reports/monthly'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Monthly Reports</button>
                      <button onClick={() => { navigate('/admin/reports/doctor-revenue'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Doctor-wise Revenue</button>
                      <button onClick={() => { navigate('/admin/reports/department-revenue'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Department-wise Revenue</button>
                    </div>
                  )}
                </div>
              )}

              {/* Compliance & Security - Expandable (Super Admin Only) */}
              {user?.role === "super_admin" && (
                <div>
                  <button 
                    onClick={() => toggleMenu('compliance')}
                    className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Compliance & Security
                    </span>
                    {expandedMenus['compliance'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expandedMenus['compliance'] && (
                    <div className="ml-6 space-y-1 mt-1">
                      <button onClick={() => { navigate('/admin/compliance/audit-logs'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Audit Logs</button>
                      <button onClick={() => { navigate('/admin/compliance/access-control'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Access Control</button>
                      <button onClick={() => { navigate('/admin/compliance/data-access'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Data Access Logs</button>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications & Alerts - Expandable (Super Admin Only) */}
              {user?.role === "super_admin" && (
                <div>
                  <button 
                    onClick={() => toggleMenu('notifications')}
                    className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications & Alerts
                    </span>
                    {expandedMenus['notifications'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expandedMenus['notifications'] && (
                    <div className="ml-6 space-y-1 mt-1">
                      <button onClick={() => { navigate('/admin/notifications/system'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">System Alerts</button>
                      <button onClick={() => { navigate('/admin/notifications/settings'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-emerald-100 text-emerald-700">Notification Settings</button>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setActiveSidebarPage("settings")} className="w-full text-left rounded-lg px-3 py-2 hover:bg-emerald-100 text-emerald-800 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </nav>

            {/* TODAY BOX + CONTACT */}
            <div className="mt-8 space-y-2">
              <div className="text-xs font-semibold text-emerald-900 px-2">Today</div>
              <div className="rounded-lg bg-white border border-emerald-100 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-900/80">Appointments</span>
                  <span className="font-medium">{todayCount}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="text-xs font-semibold text-emerald-900 px-2">Contact</div>

              <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-lg bg-white border p-3 hover:bg-emerald-50">
                <MapPin className="h-4 w-4 text-emerald-700 mt-0.5" />
                <span className="text-sm leading-snug">12, Park Street, Kolkata</span>
              </a>

              <a href="tel:+919810589799" className="flex items-center gap-2 rounded-lg bg-white border p-3 hover:bg-emerald-50">
                <Phone className="h-4 w-4 text-emerald-700" />
                <span className="text-sm">+91 98105 89799</span>
              </a>

              <div className="rounded-lg bg-white border p-3">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Clock className="h-4 w-4 text-emerald-700" />
                  Opening Hours
                </div>
                <ul className="text-sm text-emerald-900/80 space-y-1">
                  <li>Mon–Sat: 9 AM – 7 PM</li>
                  <li>Sun: Closed</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR PAGE CONTENT WITH CLOSE BUTTON AND SCROLLBAR */}
        {activeSidebarPage && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Close/Back Button */}
            <div className="shrink-0 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseSidebarPage}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Menu
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {activeSidebarPage === "patients" && (
                <PatientsListSidebar
                  onSelect={(patient) => {
                    navigate(`/patients/${patient.id}`);
                    setActiveSidebarPage(null);
                    setSidebarOpen(false);
                  }}
                />
              )}

              {activeSidebarPage === "medicines" && <MedicinesContent />}
              {activeSidebarPage === "lab-tests" && <LabTestsContent />}
              {activeSidebarPage === "procedures" && <ProceduresContent />}
              {activeSidebarPage === "consultation" && <ConsultationSidebar />}
              {activeSidebarPage === "settings" && <SettingsContent />}
            </div>
          </div>
        )}

      </aside>

      {/* MAIN CONTENT - grows to fill remaining space */}
      <div className="flex-1 min-h-screen overflow-x-hidden transition-all duration-300">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-md shrink-0">
              <Menu className="h-5 w-5" />
            </button>

            <input
              placeholder="Search patients, meds, appointments"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-white border rounded-md px-3 py-2 text-sm"
            />

            <Button variant="outline" onClick={handleSearch} className="hidden sm:flex">Search</Button>

            <Button onClick={handleNewAppointment} className="bg-emerald-700 hover:bg-emerald-800 text-white hidden md:flex">
              <Plus className="h-4 w-4 mr-1" />
              New Appointment
            </Button>

            <Button onClick={handleLogout} variant="outline" className="hidden sm:flex">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="p-3 sm:p-4 md:p-6 xl:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}
