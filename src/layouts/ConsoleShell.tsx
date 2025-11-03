import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, Phone, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: ReactNode;
  todayCount?: number; // badge for “Appointments” widget
};

export default function ConsoleShell({ children, todayCount = 0 }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  const [search, setSearch] = useState("");

  const isActive = (path: string) =>
    pathname === path
      ? "bg-emerald-100 text-emerald-900 font-medium"
      : "hover:bg-emerald-100 text-emerald-800";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = () => {
    // Navigate to the appointments page with ?q=... (works for dashboard too)
    const base = pathname.startsWith("/appointments") ? pathname : "/appointments";
    navigate(`${base}?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-emerald-50/30">
      {/* Wider container, with side padding to remove white gutters */}
      <div className="w-full max-w-[1600px] mx-auto px-4 xl:px-6">
        {/* Slightly wider sidebar and a clear gap between columns */}
        <div className="grid grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="min-h-screen sticky top-0 bg-emerald-50 border-r border-emerald-100 p-4">
            <div className="text-emerald-900 font-semibold text-lg mb-6 px-2">
              CareConsole
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => navigate("/dashboard")}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/dashboard")}`}
              >
                Dashboard
              </button>

              <button
                onClick={() => navigate("/appointments")}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/appointments")}`}
              >
                Appointments
              </button>

              <button
                onClick={() => navigate("/patients")}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/patients")}`}
              >
                Patients
              </button>

              <button
                onClick={() => navigate("/medicines")}
                className={`w-full text-left rounded-lg px-3 py-2 ${isActive("/medicines")}`}
              >
                Medicines
              </button>
            </nav>

            {/* Today widget */}
            <div className="mt-8 space-y-2">
              <div className="text-xs font-semibold text-emerald-900 px-2">Today</div>
              <div className="rounded-lg bg-white border border-emerald-100 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-900/80">Appointments</span>
                  <span className="font-medium">{todayCount}</span>
                </div>
              </div>
            </div>

            {/* Contact & Hours (as in mock) */}
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

            {/* small bottom spacer so sidebar doesn't feel cut off */}
            <div className="h-6" />
          </aside>

          {/* Right column */}
          <div className="min-h-screen overflow-x-hidden">
            {/* Top bar */}
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
              <div className="px-6 py-3 flex items-center gap-3">
                <input
                  placeholder="Search patients, meds, appointments"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring focus:ring-emerald-100"
                />
                <Button variant="outline" onClick={handleSearch} className="shrink-0">
                  Search
                </Button>
                <Button
                  onClick={() => navigate("/book-appointment")}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0"
                >
                  New Appointment
                </Button>
                <Button onClick={handleLogout} variant="outline" className="shrink-0">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </header>

            {/* Page content */}
            <main className="p-6 xl:p-8">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
