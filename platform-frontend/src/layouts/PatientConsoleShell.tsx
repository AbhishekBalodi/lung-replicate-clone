import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LogOut, Menu, X, ChevronDown, ChevronRight,
  Home, Calendar, FileText, Pill, FlaskConical, CreditCard, 
  History, MessageSquare, Bell, User, Video, Star, Settings,
  Heart, Users, Upload, HelpCircle
} from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";

type Props = {
  children: ReactNode;
};

export default function PatientConsoleShell({ children }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, loading } = useCustomAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && (!user || user.role !== "patient")) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const isActive = (path: string) =>
    pathname === path
      ? "bg-blue-100 text-blue-900 font-medium"
      : "hover:bg-blue-100 text-blue-800";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-blue-50/30 flex">
      {/* SIDEBAR */}
      <aside
        className={`w-[280px] max-w-[90vw] min-h-screen shrink-0
                    flex flex-col bg-blue-50 border-r border-blue-100 p-4
                    transition-all duration-300
                    ${sidebarOpen ? "ml-0" : "-ml-[280px]"}`}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between mb-6 px-2 shrink-0">
          <div className="text-blue-900 font-semibold text-lg">Patient Portal</div>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-blue-100 rounded-md">
            <X className="h-5 w-5 text-blue-900" />
          </button>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {/* Dashboard / Home */}
            <button 
              onClick={() => { navigate("/patient/dashboard"); setSidebarOpen(false); }} 
              className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/patient/dashboard")} flex items-center gap-2`}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </button>

            {/* Appointments - Expandable */}
            <div>
              <button 
                onClick={() => toggleMenu('appointments')}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-blue-100 text-blue-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointments
                </span>
                {expandedMenus['appointments'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedMenus['appointments'] && (
                <div className="ml-6 space-y-1 mt-1">
                  <button onClick={() => { navigate('/patient/appointments'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">My Appointments</button>
                  <button onClick={() => { navigate('/patient/appointments/book'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Book New</button>
                  <button onClick={() => { navigate('/patient/appointments/history'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">History</button>
                </div>
              )}
            </div>

            {/* Medical Records - Expandable (Read-Only) */}
            <div>
              <button 
                onClick={() => toggleMenu('records')}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-blue-100 text-blue-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Medical Records
                </span>
                {expandedMenus['records'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedMenus['records'] && (
                <div className="ml-6 space-y-1 mt-1">
                  <button onClick={() => { navigate('/patient/records/visits'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Visit History</button>
                  <button onClick={() => { navigate('/patient/records/diagnoses'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Diagnoses</button>
                  <button onClick={() => { navigate('/patient/records/doctor-notes'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Doctor Notes</button>
                  <button onClick={() => { navigate('/patient/records/discharge'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Discharge Summaries</button>
                  <button onClick={() => { navigate('/patient/records/documents'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">My Documents</button>
                </div>
              )}
            </div>

            {/* Prescriptions - Expandable */}
            <div>
              <button 
                onClick={() => toggleMenu('prescriptions')}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-blue-100 text-blue-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Prescriptions
                </span>
                {expandedMenus['prescriptions'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedMenus['prescriptions'] && (
                <div className="ml-6 space-y-1 mt-1">
                  <button onClick={() => { navigate('/patient/prescriptions/current'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Current</button>
                  <button onClick={() => { navigate('/patient/prescriptions/past'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Past</button>
                  <button onClick={() => { navigate('/patient/prescriptions/refill'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Request Refill</button>
                </div>
              )}
            </div>

            {/* Lab & Diagnostics */}
            <div>
              <button 
                onClick={() => toggleMenu('lab')}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-blue-100 text-blue-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Lab Reports
                </span>
                {expandedMenus['lab'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedMenus['lab'] && (
                <div className="ml-6 space-y-1 mt-1">
                  <button onClick={() => { navigate('/patient/lab/results'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Test Results</button>
                  <button onClick={() => { navigate('/patient/lab/history'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Historical Charts</button>
                </div>
              )}
            </div>

            {/* Billing & Payments - Expandable */}
            <div>
              <button 
                onClick={() => toggleMenu('billing')}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-blue-100 text-blue-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing & Payments
                </span>
                {expandedMenus['billing'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedMenus['billing'] && (
                <div className="ml-6 space-y-1 mt-1">
                  <button onClick={() => { navigate('/patient/billing/invoices'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">View Invoices</button>
                  <button onClick={() => { navigate('/patient/billing/pay'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Pay Online</button>
                  <button onClick={() => { navigate('/patient/billing/history'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Payment History</button>
                  <button onClick={() => { navigate('/patient/billing/insurance'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Insurance Details</button>
                </div>
              )}
            </div>

            {/* Health Timeline */}
            <button 
              onClick={() => { navigate("/patient/health-timeline"); setSidebarOpen(false); }} 
              className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/patient/health-timeline")} flex items-center gap-2`}
            >
              <History className="h-4 w-4" />
              Health Timeline
            </button>

            {/* Communication & Support - Expandable */}
            <div>
              <button 
                onClick={() => toggleMenu('communication')}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-blue-100 text-blue-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Communication
                </span>
                {expandedMenus['communication'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedMenus['communication'] && (
                <div className="ml-6 space-y-1 mt-1">
                  <button onClick={() => { navigate('/patient/messages'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Messages</button>
                  <button onClick={() => { navigate('/patient/upload-reports'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Upload Reports</button>
                  <button onClick={() => { navigate('/patient/support'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Helpdesk</button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button 
              onClick={() => { navigate("/patient/notifications"); setSidebarOpen(false); }} 
              className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/patient/notifications")} flex items-center gap-2`}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>

            {/* Profile & Family - Expandable */}
            <div>
              <button 
                onClick={() => toggleMenu('profile')}
                className="w-full text-left rounded-lg px-3 py-2 hover:bg-blue-100 text-blue-800 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile & Family
                </span>
                {expandedMenus['profile'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {expandedMenus['profile'] && (
                <div className="ml-6 space-y-1 mt-1">
                  <button onClick={() => { navigate('/patient/profile'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">My Profile</button>
                  <button onClick={() => { navigate('/patient/emergency-contact'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Emergency Contact</button>
                  <button onClick={() => { navigate('/patient/family'); setSidebarOpen(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-blue-100 text-blue-700">Family Members</button>
                </div>
              )}
            </div>

            {/* Telemedicine */}
            <button 
              onClick={() => { navigate("/patient/telemedicine"); setSidebarOpen(false); }} 
              className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/patient/telemedicine")} flex items-center gap-2`}
            >
              <Video className="h-4 w-4" />
              Telemedicine
            </button>

            {/* Feedback & Ratings */}
            <button 
              onClick={() => { navigate("/patient/feedback"); setSidebarOpen(false); }} 
              className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/patient/feedback")} flex items-center gap-2`}
            >
              <Star className="h-4 w-4" />
              Feedback & Ratings
            </button>

            {/* Settings */}
            <button 
              onClick={() => { navigate("/patient/settings"); setSidebarOpen(false); }} 
              className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/patient/settings")} flex items-center gap-2`}
            >
              <Settings className="h-4 w-4" />
              Settings & Security
            </button>
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="pt-4 border-t border-blue-200 shrink-0">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-800 hover:bg-blue-100"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="h-14 shrink-0 bg-white border-b border-blue-100 flex items-center gap-4 px-4">
          {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 hover:bg-blue-100 rounded-md"
            >
              <Menu className="h-5 w-5 text-blue-900" />
            </button>
          )}
          
          <div className="flex-1">
            <span className="text-blue-900 font-medium">
              Welcome, {user?.name || "Patient"}
            </span>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/patient/appointments/book")}
            className="text-blue-700 border-blue-300"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
