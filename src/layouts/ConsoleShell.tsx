import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, Phone, Clock, Menu, X, Search, Plus } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import DashboardAppointmentDialog from "@/components/DashboardAppointmentDialog";

type Props = {
  children: ReactNode;
  todayCount?: number;
  onSuccess?: () => void;
};

export default function ConsoleShell({ children, todayCount = 0, onSuccess }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, loading } = useCustomAuth();

  const [search, setSearch] = useState("");
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const isActive = (path: string) =>
    pathname === path
      ? "bg-emerald-100 text-emerald-900 font-medium"
      : "hover:bg-emerald-100 text-emerald-800";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleSearch = () => {
    const base = pathname.startsWith("/appointments") ? pathname : "/appointments";
    navigate(`${base}?q=${encodeURIComponent(search)}`);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNewAppointment = () => {
    setAppointmentDialogOpen(true);
  };

  return (
    <>
      <DashboardAppointmentDialog 
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        onSuccess={onSuccess}
      />
      
      <div className="min-h-screen bg-emerald-50/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 xl:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-0 lg:gap-6">
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-auto
            min-h-screen bg-emerald-50 border-r border-emerald-100 p-4
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="text-emerald-900 font-semibold text-lg">
                CareConsole
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 hover:bg-emerald-100 rounded-md"
              >
                <X className="h-5 w-5 text-emerald-900" />
              </button>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/dashboard")}`}
              >
                Dashboard
              </button>

              <button
                onClick={() => { navigate("/appointments"); setSidebarOpen(false); }}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/appointments")}`}
              >
                Appointments
              </button>

              <button
                onClick={() => { navigate("/calendar"); setSidebarOpen(false); }}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/calendar")}`}
              >
                Calendar
              </button>

              <button
                onClick={() => { navigate("/patients"); setSidebarOpen(false); }}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/patients")}`}
              >
                Patients
              </button>

              <button
                onClick={() => { navigate("/medicines"); setSidebarOpen(false); }}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/medicines")}`}
              >
                Medicines
              </button>

              <button
                onClick={() => { navigate("/lab-tests"); setSidebarOpen(false); }}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/lab-tests")}`}
              >
                Lab Tests
              </button>

              <button
                onClick={() => { navigate("/procedures"); setSidebarOpen(false); }}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/procedures")}`}
              >
                Procedures
              </button>

              <button
                onClick={() => { navigate("/consultation"); setSidebarOpen(false); }}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/consultation")}`}
              >
                Consultation
              </button>

            <button
              onClick={() => { navigate("/completed-appointments"); setSidebarOpen(false); }}
              className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/completed-appointments")}`}
            >
              Completed
            </button>

            <button
              onClick={() => { navigate("/settings"); setSidebarOpen(false); }}
              className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/settings")}`}
            >
              Settings
            </button>
          </nav>

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

              <a
                href="https://www.google.com/maps/place/North+Delhi+Chest+Centre+and+Quit+Smoking+Centre+and+Vaccination+Centre/@28.7101888,77.2079038,19z"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2 rounded-lg bg-white border border-emerald-100 p-3 hover:bg-emerald-50"
              >
                <MapPin className="h-4 w-4 text-emerald-700 mt-0.5" />
                <span className="text-sm leading-snug">
                  12, Park Street, Kolkata{" "}
                  <span className="text-emerald-700">(Open in Maps)</span>
                </span>
              </a>

              <a
                href="tel:+919810589799"
                className="flex items-center gap-2 rounded-lg bg-white border border-emerald-100 p-3 hover:bg-emerald-50"
              >
                <Phone className="h-4 w-4 text-emerald-700" />
                <span className="text-sm">+91 98105 89799</span>
              </a>

              <div className="rounded-lg bg-white border border-emerald-100 p-3">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Clock className="h-4 w-4 text-emerald-700" />
                  Opening Hours
                </div>
                <ul className="text-sm text-emerald-900/80 space-y-1">
                  <li>Mon–Sat: 9:00 AM – 7:00 PM</li>
                  <li>Sun: Closed</li>
                </ul>
              </div>
            </div>

            <div className="h-6" />
          </aside>

          <div className="min-h-screen overflow-x-hidden">
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
              <div className="px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-md shrink-0"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <input
                  placeholder="Search patients, meds, appointments"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring focus:ring-emerald-100"
                />
                
                <Button 
                  variant="outline" 
                  onClick={handleSearch} 
                  className="shrink-0 hidden sm:flex"
                >
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSearch} 
                  size="sm"
                  className="shrink-0 sm:hidden p-2"
                >
                  <Search className="h-4 w-4" />
                </Button>

                <Button
                  onClick={handleNewAppointment}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 hidden md:flex"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Appointment
                </Button>
                <Button
                  onClick={handleNewAppointment}
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 md:hidden p-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <Button onClick={handleLogout} variant="outline" className="shrink-0 hidden sm:flex">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" className="shrink-0 sm:hidden p-2">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <main className="p-3 sm:p-4 md:p-6 xl:p-8">{children}</main>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
