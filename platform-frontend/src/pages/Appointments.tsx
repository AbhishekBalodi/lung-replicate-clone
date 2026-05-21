import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { useAppointments } from "@/contexts/AppointmentContext";
import ConsoleShell from "../layouts/ConsoleShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Check, ChevronLeft, ChevronRight, Plus, Clock, CalendarDays, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import RescheduleModal from "@/components/RescheduleModal";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface Appointment {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  status?: string | null;
  created_at?: string | null;
  department?: string | null;
}

const AVATAR_COLORS = ["bg-blue-500","bg-purple-500","bg-green-500","bg-amber-500","bg-rose-500","bg-indigo-500","bg-cyan-500","bg-teal-500"];
const avatarColor = (name: string) => AVATAR_COLORS[(name || "A").charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name: string) => (name || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  confirmed:  { label: "Confirmed",   className: "bg-green-100 text-green-700" },
  pending:    { label: "Pending",     className: "bg-amber-100 text-amber-700" },
  done:       { label: "Done",        className: "bg-blue-100 text-blue-700" },
  cancelled:  { label: "Cancelled",  className: "bg-red-100 text-red-700" },
  "in progress": { label: "In Progress", className: "bg-purple-100 text-purple-700" },
};

const statusBadge = (status?: string | null) => {
  const s = (status || "pending").toLowerCase();
  const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.pending;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>{cfg.label}</span>;
};

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useCustomAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { appointments, loading, fetchAppointments, markAppointmentDone, cancelAppointment } = useAppointments();

  const [actionBusyId, setActionBusyId] = useState<number | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, fetchAppointments]);

  const markDone = async (id: number) => {
    setActionBusyId(id);
    const success = await markAppointmentDone(id);
    toast({ title: success ? "Completed" : "Error", description: success ? "Appointment marked as done." : "Failed to mark as done.", variant: success ? "default" : "destructive" });
    setActionBusyId(null);
  };

  const cancel = async (id: number) => {
    setActionBusyId(id);
    const success = await cancelAppointment(id);
    toast({ title: success ? "Cancelled" : "Error", description: success ? "Appointment cancelled." : "Failed to cancel.", variant: success ? "default" : "destructive" });
    setActionBusyId(null);
  };

  const summary = useMemo(() => {
    const todayStr = new Date().toDateString();
    const today = appointments.filter((a) => new Date(a.appointment_date).toDateString() === todayStr).length;
    const confirmed = appointments.filter((a) => (a.status || "pending") === "confirmed").length;
    const pending = appointments.filter((a) => (a.status || "pending") === "pending").length;
    const cancelled = appointments.filter((a) => (a.status || "pending") === "cancelled").length;
    return { today, confirmed, pending, cancelled };
  }, [appointments]);

  // Days in calendar view
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(calendarDate));
    const end = endOfWeek(endOfMonth(calendarDate));
    return eachDayOfInterval({ start, end });
  }, [calendarDate]);

  // Appointments that have events on a given day
  const hasAppointmentOnDay = (day: Date) =>
    appointments.some((a) => isSameDay(parseISO(a.appointment_date), day));

  // Appointments for the selected day
  const dayAppointments = useMemo(() =>
    appointments
      .filter((a) => isSameDay(parseISO(a.appointment_date), selectedDay))
      .sort((a, b) => (a.appointment_time || "").localeCompare(b.appointment_time || "")),
    [appointments, selectedDay]
  );

  // Today's schedule appointments for the timeline bar
  const todayAppointments = useMemo(() =>
    appointments
      .filter((a) => isSameDay(parseISO(a.appointment_date), new Date()))
      .sort((a, b) => (a.appointment_time || "").localeCompare(b.appointment_time || "")),
    [appointments]
  );

  if (authLoading || loading) {
    return <div className="min-h-screen grid place-items-center"><p>Loading…</p></div>;
  }

  return (
    <ConsoleShell pageTitle="Appointments" pageSubtitle="Schedule and track all appointments.">
      <div className="space-y-5">
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Today's Appointments", value: summary.today, sub: "Confirmed today", icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
            { label: "Confirmed", value: summary.confirmed, sub: "43% of total", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
            { label: "Pending", value: summary.pending, sub: "Awaiting confirmation", icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "Cancelled", value: summary.cancelled, sub: "This week", icon: XCircle, color: "text-red-500 bg-red-50" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex items-start gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 leading-tight">{s.value}</p>
                <p className="text-xs text-slate-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar + Day list */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Mini Calendar */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCalendarDate((d) => subMonths(d, 1))} className="p-1.5 rounded-lg hover:bg-slate-100">
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              </button>
              <h3 className="text-sm font-semibold text-slate-900">{format(calendarDate, "MMMM yyyy")}</h3>
              <button onClick={() => setCalendarDate((d) => addMonths(d, 1))} className="p-1.5 rounded-lg hover:bg-slate-100">
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            {/* Day of week headers */}
            <div className="grid grid-cols-7 mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center text-[11px] font-medium text-slate-400 py-1">{d}</div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {calendarDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDay);
                const inMonth = isSameMonth(day, calendarDate);
                const hasAppt = hasAppointmentOnDay(day);
                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "relative h-9 w-full flex flex-col items-center justify-center rounded-lg text-sm transition-colors",
                      !inMonth && "text-slate-300",
                      inMonth && !isSelected && !isToday && "hover:bg-slate-100 text-slate-700",
                      isToday && !isSelected && "bg-slate-100 font-semibold text-primary",
                      isSelected && "bg-primary text-white font-semibold shadow-sm"
                    )}
                  >
                    {format(day, "d")}
                    {hasAppt && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary opacity-70" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Appointments for selected day */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Appointments — {format(selectedDay, "MMMM d")}</h3>
                <p className="text-xs text-slate-500">{dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""} scheduled</p>
              </div>
              <Button size="sm" onClick={() => navigate("/new-appointment")}
                className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-white border-0 hover:opacity-90 rounded-full">
                <Plus className="h-3.5 w-3.5 mr-1" /> Schedule
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[320px]">
              {dayAppointments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No appointments on this day</div>
              ) : (
                dayAppointments.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60">
                    <div className="text-xs text-slate-500 w-16 shrink-0 font-medium">{a.appointment_time}</div>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${avatarColor(a.full_name)}`}>
                      {getInitials(a.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{a.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{a.selected_doctor}{a.department ? ` · ${a.department}` : ""}</p>
                    </div>
                    {statusBadge(a.status)}
                    <div className="flex items-center gap-1">
                      <button
                        disabled={actionBusyId === a.id}
                        onClick={() => markDone(a.id)}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600"
                        title="Mark done"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        disabled={actionBusyId === a.id}
                        onClick={() => cancel(a.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                        title="Cancel"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Today''s schedule timeline */}
        {todayAppointments.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Today''s Schedule — {format(new Date(), "MMMM d")}</h3>
            <div className="relative overflow-x-auto">
              <div className="flex items-end gap-4 min-w-max pb-2">
                {/* Time ruler */}
                {Array.from({ length: 12 }, (_, i) => i + 7).map((h) => (
                  <div key={h} className="flex flex-col items-center gap-1 relative" style={{ width: 64 }}>
                    <div className="h-6 w-px bg-slate-200 absolute top-0 left-1/2" />
                    <span className="text-[10px] text-slate-400 mt-7">{h}:00</span>
                  </div>
                ))}
              </div>
              {/* Appointment chips */}
              <div className="flex flex-wrap gap-3 mt-2">
                {todayAppointments.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0 ${avatarColor(a.full_name)}`}>
                      {getInitials(a.full_name)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800 leading-tight">{a.full_name.split(" ")[0]}</p>
                      <p className="text-[10px] text-slate-500">{a.appointment_time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {rescheduleAppointment && (
        <RescheduleModal
          appointment={rescheduleAppointment}
          onClose={() => setRescheduleAppointment(null)}
          onSuccess={() => { setRescheduleAppointment(null); fetchAppointments(); }}
        />
      )}
    </ConsoleShell>
  );
}
