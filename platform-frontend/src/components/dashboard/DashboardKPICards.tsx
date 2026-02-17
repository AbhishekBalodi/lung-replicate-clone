import { Card } from "@/components/ui/card";
import {
  Calendar,
  FileText,
  Users,
  ListTodo,
  ArrowUpRight,
  AlertTriangle,
  Bell,
  ClipboardList
} from "lucide-react";
import { useState } from "react";

interface DashboardKPICardsProps {
  todayAppointments: number;
  urgentAppointments: number;
  pendingReports: number;
  reportsReady: number;
  activePatients: number;
  newPatients: number;
  pendingTasks: number;
  highPriorityTasks: number;

  completedAppointments?: number;
  cancelledAppointments?: number;
  unreadLabReports?: number;
  emergencyAlerts?: number;
  pendingAppointments?: number;
}

const openInNewTab = (path: string) => {
  window.open(path, '_blank', 'noopener,noreferrer');
};

export default function DashboardKPICards({
  todayAppointments,
  urgentAppointments,
  pendingReports,
  reportsReady,
  activePatients,
  newPatients,
  pendingTasks,
  highPriorityTasks,

  completedAppointments = 0,
  cancelledAppointments = 0,
  unreadLabReports = 0,
  emergencyAlerts = 0,
  pendingAppointments = 0,
}: DashboardKPICardsProps) {

  const [appointmentFilter, setAppointmentFilter] = useState<
    "today" | "completed" | "cancelled"
  >("today");

  const getAppointmentCount = () => {
    if (appointmentFilter === "completed") return completedAppointments;
    if (appointmentFilter === "cancelled") return cancelledAppointments;
    return todayAppointments;
  };

  const getAppointmentLabel = () => {
    if (appointmentFilter === "completed") return "Completed appointments";
    if (appointmentFilter === "cancelled") return "Cancelled appointments";
    return "Today's consultations";
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {/* APPOINTMENTS CARD */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-teal-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-500/10">
              <Calendar className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Appointments</p>
              <span className="text-xs text-red-500 font-medium">{urgentAppointments} urgent</span>
            </div>
          </div>
          <select
            value={appointmentFilter}
            onChange={(e) => setAppointmentFilter(e.target.value as any)}
            className="text-xs border rounded-md px-2 py-1 bg-background text-foreground"
          >
            <option value="today">Today</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">{getAppointmentCount()}</p>
          <p className="text-sm text-muted-foreground mt-1">{getAppointmentLabel()}</p>
        </div>
        <button onClick={() => openInNewTab("/appointments")} className="flex items-center gap-1 text-teal-600 text-sm mt-4 hover:text-teal-700 transition-colors font-medium">
          View Schedule <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* PENDING REPORTS */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-amber-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Pending Reports</p>
              <span className="text-xs text-green-500 font-medium">{reportsReady} ready</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">{pendingReports}</p>
          <p className="text-sm text-muted-foreground mt-1">Lab results awaiting review</p>
        </div>
        <button onClick={() => openInNewTab("/lab-tests")} className="flex items-center gap-1 text-amber-600 text-sm mt-4 hover:text-amber-700 transition-colors font-medium">
          Review Reports <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* ACTIVE PATIENTS */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-emerald-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Active Patients</p>
              <span className="text-xs text-emerald-500 font-medium">{newPatients} new</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">{activePatients}</p>
          <p className="text-sm text-muted-foreground mt-1">Total patient count this week</p>
        </div>
        <button onClick={() => openInNewTab("/patients")} className="flex items-center gap-1 text-emerald-600 text-sm mt-4 hover:text-emerald-700 transition-colors font-medium">
          Patient Records <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* PENDING TASKS */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-rose-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10">
              <ListTodo className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Pending Tasks</p>
              <span className="text-xs text-rose-500 font-medium">{highPriorityTasks} high priority</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">{pendingTasks}</p>
          <p className="text-sm text-muted-foreground mt-1">Tasks requiring attention</p>
        </div>
        <button onClick={() => openInNewTab("/admin/tasks")} className="flex items-center gap-1 text-rose-600 text-sm mt-4 hover:text-rose-700 transition-colors font-medium">
          View Tasks <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* UNREAD LAB REPORTS */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-indigo-500 p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10">
            <Bell className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-foreground">Unread Lab Reports</p>
        </div>
        <p className="text-4xl font-bold mt-4">{unreadLabReports}</p>
        <p className="text-sm text-muted-foreground">Reports not yet opened</p>
        <button onClick={() => openInNewTab("/lab-tests")} className="flex items-center gap-1 text-indigo-600 text-sm mt-4 hover:text-indigo-700 transition-colors font-medium">
          View Reports <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* EMERGENCY ALERTS */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-red-600 p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-sm font-medium text-foreground">Emergency Alerts</p>
        </div>
        <p className="text-4xl font-bold mt-4">{emergencyAlerts}</p>
        <p className="text-sm text-muted-foreground">Requires immediate action</p>
        <button onClick={() => openInNewTab("/admin/emergency")} className="flex items-center gap-1 text-red-600 text-sm mt-4 hover:text-red-700 transition-colors font-medium">
          View Alerts <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* PENDING APPOINTMENTS */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-sky-500 p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10">
            <ClipboardList className="h-5 w-5 text-sky-600" />
          </div>
          <p className="text-sm font-medium text-foreground">Pending Appointments</p>
        </div>
        <p className="text-4xl font-bold mt-4">{pendingAppointments}</p>
        <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
        <button onClick={() => openInNewTab("/appointments")} className="flex items-center gap-1 text-sky-600 text-sm mt-4 hover:text-sky-700 transition-colors font-medium">
          View Appointments <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

    </div>
  );
}
