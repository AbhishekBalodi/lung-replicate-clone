import { ReactNode, useState, useMemo } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LogOut, Menu, Search, Plus, ArrowLeft, Bell, ChevronDown, ChevronRight,
  Ambulance, Pill, Droplets, Receipt, Building2, Users2,
  DoorOpen, Star, MessageSquare, ListTodo, FlaskConical, TrendingUp, Shield,
  Settings, BarChart3, Palette, ClipboardList, Video, Calendar, Heart, Siren,
  User, Stethoscope, LayoutDashboard, CalendarDays, UserCircle, Beaker,
  Scissors, CheckCircle2, FileText, BookOpen, Clock, AlertTriangle, MessageCircle,
  Wallet, Briefcase, Bed, ClipboardCheck, Cog, Lock, BellRing, UserCog, Layers
} from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import MedicinesContent from "@/pages/admin/MedicinesContent";
import LabTestsContent from "@/pages/admin/LabTestsContent";
import ProceduresContent from "@/pages/admin/ProceduresContent";
import PatientsListSidebar from "@/pages/admin/PatientsListSidebar";
import SettingsContent from "@/pages/SettingsContent";
import ConsultationSidebar from "@/pages/admin/ConsultationSidebar";
import ThemeApplicator from "@/components/ThemeApplicator";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

type SidebarPage = "patients" | "medicines" | "lab-tests" | "procedures" | "consultation" | "settings" | null;

type Props = {
  children: ReactNode;
  todayCount?: number;
  pageTitle?: string;
  pageSubtitle?: string;
};

/** A single nav item (leaf or expandable group) */
type NavLeaf = { kind: "leaf"; label: string; icon: any; onClick: () => void; path?: string; superAdminOnly?: boolean };
type NavGroup = {
  kind: "group"; label: string; icon: any; key: string; superAdminOnly?: boolean;
  items: { label: string; onClick: () => void; path?: string }[];
};
type NavSidebarPage = { kind: "sidebar-page"; label: string; icon: any; page: SidebarPage };
type NavItem = NavLeaf | NavGroup | NavSidebarPage;

type NavSection = { label: string; items: NavItem[] };

export default function ConsoleShell({ children, todayCount = 0, pageTitle, pageSubtitle }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, tenant, logout, loading } = useCustomAuth();

  const [search, setSearch] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebarPage, setActiveSidebarPage] = useState<SidebarPage>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const isAuthenticated = useMemo(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) return true;
    try {
      const stored = localStorage.getItem('customUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.role === "admin" || parsed.role === "super_admin";
      }
    } catch {}
    return false;
  }, [user]);

  const isPathActive = (path?: string) => !!path && pathname === path;

  const handleSearch = () => {
    const base = pathname.startsWith("/appointments") ? pathname : "/appointments";
    navigate(`${base}?q=${encodeURIComponent(search)}`);
  };

  const handleLogout = () => { logout(); navigate("/"); };
  const toggleMenu = (k: string) => setExpandedMenus(p => ({ ...p, [k]: !p[k] }));

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isSuper = user?.role === "super_admin";
  const dashboardPath = isSuper ? "/super-admin" : "/dashboard";
  const go = (p: string) => () => navigate(p);

  // Hospital / tenant brand
  const brandName = tenant?.name || "CareConsole";
  const brandSubtitle = "Hospital Management";

  // Profile chip
  const userName = (user as any)?.name || (user as any)?.email || "Account";
  const userInitials = String(userName).split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
  const userRoleLabel = isSuper ? "Super Admin" : "Admin";

  /* ============================================================
     SIDEBAR NAVIGATION (mirrors Figma section grouping)
     ============================================================ */
  const sections: NavSection[] = [
    {
      label: "Main",
      items: [
        { kind: "leaf", label: "Dashboard", icon: LayoutDashboard, onClick: go(dashboardPath), path: dashboardPath },
        { kind: "leaf", label: "Appointments", icon: CalendarDays, onClick: go("/appointments"), path: "/appointments" },
        { kind: "leaf", label: "Calendar", icon: Calendar, onClick: go("/calendar"), path: "/calendar" },
        { kind: "sidebar-page", label: "Patients", icon: UserCircle, page: "patients" },
      ],
    },
    {
      label: "Clinical",
      items: [
        { kind: "sidebar-page", label: "Consultation", icon: Stethoscope, page: "consultation" },
        { kind: "sidebar-page", label: "Medicines", icon: Pill, page: "medicines" },
        { kind: "sidebar-page", label: "Lab Tests", icon: Beaker, page: "lab-tests" },
        { kind: "sidebar-page", label: "Procedures", icon: Scissors, page: "procedures" },
        { kind: "leaf", label: "Completed", icon: CheckCircle2, onClick: go("/completed-appointments"), path: "/completed-appointments" },
        { kind: "leaf", label: "Telemedicine", icon: Video, onClick: go("/admin/telemedicine"), path: "/admin/telemedicine" },
        {
          kind: "group", label: "Medical Records", icon: FileText, key: "emr",
          items: [
            { label: "Diagnosis Notes", onClick: go("/admin/emr/diagnosis") },
            { label: "Treatment Plans", onClick: go("/admin/emr/treatment-plans") },
            { label: "Progress Notes (SOAP)", onClick: go("/admin/emr/progress-notes") },
            { label: "Documents", onClick: go("/admin/emr/documents") },
          ],
        },
        {
          kind: "group", label: "Follow-Ups & Care", icon: Heart, key: "follow-ups",
          items: [
            { label: "Follow-Up Schedule", onClick: go("/admin/follow-ups") },
            { label: "Care Plans", onClick: go("/admin/care-plans") },
          ],
        },
      ],
    },
    {
      label: "Communication",
      items: [
        { kind: "leaf", label: "Communication", icon: MessageCircle, onClick: go("/admin/communication"), path: "/admin/communication" },
        { kind: "leaf", label: "Reviews", icon: Star, onClick: go("/admin/reviews"), path: "/admin/reviews" },
      ],
    },
    {
      label: "Management",
      items: [
        { kind: "leaf", label: "Schedule & Availability", icon: Clock, onClick: go("/admin/schedule"), path: "/admin/schedule" },
        { kind: "leaf", label: "Tasks & Notifications", icon: ListTodo, onClick: go("/admin/tasks"), path: "/admin/tasks" },
        { kind: "leaf", label: "Performance Analytics", icon: BarChart3, onClick: go("/admin/analytics"), path: "/admin/analytics" },
        { kind: "leaf", label: "Emergency & Alerts", icon: AlertTriangle, onClick: go("/admin/emergency"), path: "/admin/emergency" },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          kind: "group", label: "Ambulance", icon: Ambulance, key: "ambulance",
          items: [
            { label: "Ambulance Call List", onClick: go("/admin/ambulances/calls") },
            { label: "Ambulance List", onClick: go("/admin/ambulances/list") },
          ],
        },
        {
          kind: "group", label: "Staff", icon: Users2, key: "staff",
          items: [
            { label: "Staff Call List", onClick: go("/admin/staffs/calls") },
            { label: "Staff List", onClick: go("/admin/staffs/list") },
          ],
        },
        {
          kind: "group", label: "Pharmacy", icon: Pill, key: "pharmacy",
          items: [
            { label: "Medicine List", onClick: go("/admin/pharmacy/medicines") },
            { label: "Inventory", onClick: go("/admin/pharmacy/inventory") },
          ],
        },
        {
          kind: "group", label: "Blood Bank", icon: Droplets, key: "blood-bank",
          items: [
            { label: "Blood Stock", onClick: go("/admin/blood-bank/stock") },
            { label: "Blood Donor", onClick: go("/admin/blood-bank/donors") },
            { label: "Blood Issued", onClick: go("/admin/blood-bank/issued") },
            { label: "Add Blood Unit", onClick: go("/admin/blood-bank/add-unit") },
            { label: "Issue Blood", onClick: go("/admin/blood-bank/issue") },
          ],
        },
        {
          kind: "group", label: "Room Allotment", icon: Bed, key: "room-allotment",
          items: [
            { label: "Alloted Rooms", onClick: go("/admin/rooms/alloted") },
            { label: "New Allotment", onClick: go("/admin/rooms/new") },
            { label: "Rooms by Department", onClick: go("/admin/rooms") },
          ],
        },
      ],
    },
    {
      label: "Billing & Finance",
      items: [
        {
          kind: "group", label: "Billing", icon: Receipt, key: "billing",
          items: [
            { label: "Invoices List", onClick: go("/admin/billing") },
            { label: "Create Invoice", onClick: go("/admin/billing/new") },
            { label: "Payments History", onClick: go("/admin/billing/payments") },
          ],
        },
        {
          kind: "group", label: "Financial Management", icon: Wallet, key: "finance", superAdminOnly: true,
          items: [
            { label: "Revenue", onClick: go("/admin/finance/revenue") },
            { label: "Billing", onClick: go("/admin/billing") },
            { label: "Insurance & Claims", onClick: go("/admin/finance/insurance") },
          ],
        },
      ],
    },
    {
      label: "Administration",
      items: [
        {
          kind: "group", label: "Hospital Management", icon: Building2, key: "hospital-mgmt", superAdminOnly: true,
          items: [
            { label: "Hospital Profile", onClick: go("/admin/hospital/profile") },
            { label: "Departments", onClick: go("/admin/hospital/departments") },
            { label: "Infrastructure", onClick: go("/admin/hospital/infrastructure") },
          ],
        },
        {
          kind: "group", label: "Lab & Diagnostics", icon: FlaskConical, key: "lab",
          items: [
            { label: "Pending Tests", onClick: go("/admin/lab/pending") },
            { label: "Lab Revenue", onClick: go("/admin/lab/revenue") },
          ],
        },
        {
          kind: "group", label: "Reports", icon: BookOpen, key: "reports", superAdminOnly: true,
          items: [
            { label: "Daily Reports", onClick: go("/admin/reports/daily") },
            { label: "Monthly Reports", onClick: go("/admin/reports/monthly") },
            { label: "Doctor-wise Revenue", onClick: go("/admin/reports/doctor-revenue") },
            { label: "Department-wise Revenue", onClick: go("/admin/reports/department-revenue") },
          ],
        },
        {
          kind: "group", label: "Feedback & Quality", icon: ClipboardCheck, key: "feedback",
          items: [
            { label: "Patient Feedback", onClick: go("/admin/feedback/patient") },
            { label: "Doctor Ratings", onClick: go("/admin/feedback/doctor-ratings") },
            { label: "Complaints Management", onClick: go("/admin/feedback/complaints") },
            { label: "Service Quality Score", onClick: go("/admin/feedback/quality-score") },
          ],
        },
      ],
    },
    {
      label: "System & Security",
      items: [
        {
          kind: "group", label: "System Configuration", icon: Cog, key: "system-config", superAdminOnly: true,
          items: [
            { label: "Website Settings", onClick: go("/admin/config/website") },
            { label: "Theme & Templates", onClick: go("/admin/config/theme-templates") },
            { label: "Appointment Rules", onClick: go("/admin/config/appointment-rules") },
            { label: "Pricing Rules", onClick: go("/admin/config/pricing-rules") },
            { label: "Tax Settings", onClick: go("/admin/config/tax-settings") },
            { label: "Payment Gateways", onClick: go("/admin/config/payment-gateways") },
            { label: "SMS/Email/WhatsApp", onClick: go("/admin/config/messaging") },
          ],
        },
        {
          kind: "group", label: "Compliance & Security", icon: Lock, key: "compliance", superAdminOnly: true,
          items: [
            { label: "Audit Logs", onClick: go("/admin/compliance/audit-logs") },
            { label: "Access Control", onClick: go("/admin/compliance/access-control") },
            { label: "Data Access Logs", onClick: go("/admin/compliance/data-access") },
          ],
        },
        {
          kind: "group", label: "Notifications & Alerts", icon: BellRing, key: "notifications", superAdminOnly: true,
          items: [
            { label: "System Alerts", onClick: go("/admin/notifications/system") },
            { label: "Notification Settings", onClick: go("/admin/notifications/settings") },
          ],
        },
      ],
    },
    {
      label: "Account",
      items: [
        { kind: "leaf", label: "My Profile & Settings", icon: UserCog, onClick: go("/admin/profile"), path: "/admin/profile" },
        { kind: "leaf", label: "Theme & Templates", icon: Palette, onClick: go("/admin/config/theme-templates"), path: "/admin/config/theme-templates" },
      ],
    },
  ];

  const sidebarWidth = activeSidebarPage ? "w-[640px]" : (sidebarCollapsed ? "w-[72px]" : "w-[260px]");

  // Render a sidebar item
  const renderItem = (item: NavItem) => {
    if (item.kind === "leaf") {
      if (item.superAdminOnly && !isSuper) return null;
      const active = isPathActive(item.path);
      const Icon = item.icon;
      return (
        <button
          key={item.label}
          onClick={() => { item.onClick(); }}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
            ${active
              ? "bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-white font-medium shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
        </button>
      );
    }
    if (item.kind === "sidebar-page") {
      const Icon = item.icon;
      const active = activeSidebarPage === item.page;
      return (
        <button
          key={item.label}
          onClick={() => setActiveSidebarPage(item.page)}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
            ${active
              ? "bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-white font-medium shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
        </button>
      );
    }
    // group
    if (item.superAdminOnly && !isSuper) return null;
    const Icon = item.icon;
    const open = !!expandedMenus[item.key];
    return (
      <div key={item.key}>
        <button
          onClick={() => toggleMenu(item.key)}
          className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="flex items-center gap-3 min-w-0">
            <Icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
          </span>
          {!sidebarCollapsed && (open
            ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />)}
        </button>
        {open && !sidebarCollapsed && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
            {item.items.map(sub => (
              <button
                key={sub.label}
                onClick={sub.onClick}
                className="w-full text-left rounded-md px-2 py-1.5 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <ThemeApplicator />

      {/* SIDEBAR — always visible */}
      <aside
        className={`${sidebarWidth} shrink-0 min-h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300`}
      >
        {/* Brand header */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-100 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center shadow-sm shrink-0">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          {!sidebarCollapsed && !activeSidebarPage && (
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-slate-900 leading-tight truncate">{brandName}</div>
              <div className="text-[11px] text-slate-500 leading-tight truncate">{brandSubtitle}</div>
            </div>
          )}
        </div>

        {/* Sub-page mode (Patients/Medicines/etc.) */}
        {activeSidebarPage ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-4 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setActiveSidebarPage(null)} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Menu
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activeSidebarPage === "patients" && (
                <PatientsListSidebar onSelect={(p) => { navigate(`/patients/${p.id}`); setActiveSidebarPage(null); }} />
              )}
              {activeSidebarPage === "medicines" && <MedicinesContent />}
              {activeSidebarPage === "lab-tests" && <LabTestsContent />}
              {activeSidebarPage === "procedures" && <ProceduresContent />}
              {activeSidebarPage === "consultation" && <ConsultationSidebar />}
              {activeSidebarPage === "settings" && <SettingsContent />}
            </div>
          </div>
        ) : (
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {sections.map(sec => {
              const visibleItems = sec.items.filter(it => {
                if (it.kind === "leaf" || it.kind === "group") {
                  return !it.superAdminOnly || isSuper;
                }
                return true;
              });
              if (visibleItems.length === 0) return null;
              return (
                <div key={sec.label}>
                  {!sidebarCollapsed && (
                    <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      {sec.label}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {visibleItems.map(renderItem)}
                  </div>
                </div>
              );
            })}
          </nav>
        )}
      </aside>

      {/* MAIN COLUMN */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="p-2 hover:bg-slate-100 rounded-lg shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>

          {/* Page title */}
          <div className="hidden md:block min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{pageTitle || "Dashboard"}</div>
            {pageSubtitle && <div className="text-xs text-slate-500 truncate">{pageSubtitle}</div>}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white"
            />
          </div>

          {/* New Appointment (gradient) */}
          <Button
            onClick={() => navigate("/new-appointment")}
            className="hidden md:inline-flex bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-white border-0 hover:opacity-90 rounded-full shadow-md"
          >
            <Plus className="h-4 w-4 mr-1" /> New Appointment
          </Button>

          {/* Bell */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          {/* Profile chip */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-3 py-1 hover:bg-slate-100 rounded-full">
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] text-white text-xs font-semibold flex items-center justify-center">
                  {userInitials || "U"}
                </span>
                <span className="hidden lg:block text-left">
                  <span className="block text-xs font-semibold text-slate-900 leading-tight max-w-[140px] truncate">{userName}</span>
                  <span className="block text-[10px] text-slate-500 leading-tight">{userRoleLabel}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                <UserCog className="h-4 w-4 mr-2" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSidebarPage("settings")}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:text-rose-600">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Floating + FAB (matches screenshots) */}
        <button
          onClick={() => navigate("/new-appointment")}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-30"
          aria-label="New Appointment"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
