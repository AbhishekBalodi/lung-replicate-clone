import { Card } from "@/components/ui/card";
import { Calendar, FileText, Users, ListTodo, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardKPICardsProps {
  todayAppointments: number;
  urgentAppointments: number;
  pendingReports: number;
  reportsReady: number;
  activePatients: number;
  newPatients: number;
  pendingTasks: number;
  highPriorityTasks: number;
}

export default function DashboardKPICards({
  todayAppointments,
  urgentAppointments,
  pendingReports,
  reportsReady,
  activePatients,
  newPatients,
  pendingTasks,
  highPriorityTasks,
}: DashboardKPICardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Appointments Card */}
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
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">{todayAppointments}</p>
          <p className="text-sm text-muted-foreground mt-1">Today's consultations</p>
        </div>
        <button 
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-1 text-teal-600 text-sm mt-4 hover:text-teal-700 transition-colors font-medium"
        >
          View Schedule
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Pending Reports Card */}
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
        <button 
          onClick={() => navigate("/lab-tests")}
          className="flex items-center gap-1 text-amber-600 text-sm mt-4 hover:text-amber-700 transition-colors font-medium"
        >
          Review Reports
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Active Patients Card */}
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
        <button 
          onClick={() => navigate("/patients")}
          className="flex items-center gap-1 text-emerald-600 text-sm mt-4 hover:text-emerald-700 transition-colors font-medium"
        >
          Patient Records
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Pending Tasks Card */}
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
        <button 
          className="flex items-center gap-1 text-rose-600 text-sm mt-4 hover:text-rose-700 transition-colors font-medium"
        >
          View Tasks
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>
    </div>
  );
}
