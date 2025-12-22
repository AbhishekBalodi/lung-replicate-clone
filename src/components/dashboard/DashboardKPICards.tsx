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
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-500/20">
              <Calendar className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300">Appointments</p>
              <span className="text-xs text-red-400 font-medium">{urgentAppointments} urgent</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold">{todayAppointments}</p>
          <p className="text-sm text-slate-400 mt-1">Today's consultations</p>
        </div>
        <button 
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-1 text-teal-400 text-sm mt-4 hover:text-teal-300 transition-colors"
        >
          View Schedule
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Pending Reports Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20">
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300">Pending Reports</p>
              <span className="text-xs text-green-400 font-medium">{reportsReady} ready</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold">{pendingReports}</p>
          <p className="text-sm text-slate-400 mt-1">Lab results awaiting review</p>
        </div>
        <button 
          onClick={() => navigate("/lab-tests")}
          className="flex items-center gap-1 text-amber-400 text-sm mt-4 hover:text-amber-300 transition-colors"
        >
          Review Reports
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Active Patients Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/20">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300">Active Patients</p>
              <span className="text-xs text-emerald-400 font-medium">{newPatients} new</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold">{activePatients}</p>
          <p className="text-sm text-slate-400 mt-1">Total patient count this week</p>
        </div>
        <button 
          onClick={() => navigate("/patients")}
          className="flex items-center gap-1 text-emerald-400 text-sm mt-4 hover:text-emerald-300 transition-colors"
        >
          Patient Records
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Pending Tasks Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/20">
              <ListTodo className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300">Pending Tasks</p>
              <span className="text-xs text-rose-400 font-medium">{highPriorityTasks} high priority</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold">{pendingTasks}</p>
          <p className="text-sm text-slate-400 mt-1">Tasks requiring attention</p>
        </div>
        <button 
          className="flex items-center gap-1 text-rose-400 text-sm mt-4 hover:text-rose-300 transition-colors"
        >
          View Tasks
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>
    </div>
  );
}
