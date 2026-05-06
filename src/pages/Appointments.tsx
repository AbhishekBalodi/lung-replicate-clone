import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { useAppointments } from "@/contexts/AppointmentContext";
import ConsoleShell from "../layouts/ConsoleShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  Check,
  Filter,
  CalendarIcon,
} from "lucide-react";
import RescheduleModal from "@/components/RescheduleModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/* ===============================
   TYPES
================================ */
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

/* ===============================
   COMPONENT
================================ */
export default function AppointmentsPage() {
  const { user, loading: authLoading } = useCustomAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    appointments,
    loading,
    fetchAppointments,
    markAppointmentDone,
    cancelAppointment,
  } = useAppointments();

  const [actionBusyId, setActionBusyId] = useState<number | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] =
    useState<Appointment | null>(null);

  /* ===============================
     FILTER STATE
  ================================ */
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  /* ===============================
     UNIQUE DOCTORS
  ================================ */
  const uniqueDoctors = useMemo(() => {
    const doctors = new Set<string>();
    appointments.forEach((a) => {
      if (a.selected_doctor) doctors.add(a.selected_doctor);
    });
    return Array.from(doctors); // array of doctor names
  }, [appointments]);

  /* ===============================
     AUTH + FETCH
  ================================ */
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, fetchAppointments]);

  /* ===============================
     ACTIONS
  ================================ */
  const markDone = async (id: number) => {
    setActionBusyId(id);
    const success = await markAppointmentDone(id);
    toast({
      title: success ? "Completed" : "Error",
      description: success
        ? "Appointment marked as done."
        : "Failed to mark appointment as done.",
      variant: success ? "default" : "destructive",
    });
    setActionBusyId(null);
  };

  const cancel = async (id: number) => {
    setActionBusyId(id);
    const success = await cancelAppointment(id);
    toast({
      title: success ? "Cancelled" : "Error",
      description: success
        ? "Appointment cancelled."
        : "Failed to cancel appointment.",
      variant: success ? "default" : "destructive",
    });
    setActionBusyId(null);
  };

  /* ===============================
     FILTER LOGIC
  ================================ */
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (searchQuery) {
        const matches =
          a.full_name.toLowerCase().includes(searchQuery) ||
          a.email.toLowerCase().includes(searchQuery) ||
          a.phone.toLowerCase().includes(searchQuery) ||
          (a.selected_doctor || '').toLowerCase().includes(searchQuery);
        if (!matches) return false;
      }

      if (selectedDoctor !== "all" && a.selected_doctor !== selectedDoctor) {
        return false;
      }

      if (selectedDate) {
        const apptDate = new Date(a.appointment_date).toDateString();
        if (apptDate !== selectedDate.toDateString()) return false;
      }

      if (selectedStatus !== "all") {
        const status = a.status || "pending";
        if (status !== selectedStatus) return false;
      }

      return true;
    });
  }, [appointments, searchQuery, selectedDoctor, selectedDate, selectedStatus]);

  /* ===============================
     UI HELPERS
  ================================ */
  const getStatusBadge = (status?: string | null) => {
    const s = status || "pending";
    const map: Record<string, string> = {
      done: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      confirmed: "bg-blue-100 text-blue-800",
    };
    return (
      <Badge className={cn("text-xs", map[s] || map.pending)}>
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </Badge>
    );
  };

  const clearFilters = () => {
    setSelectedDoctor("all");
    setSelectedDate(undefined);
    setSelectedStatus("all");
  };

  const summary = useMemo(() => {
    const todayStr = new Date().toDateString();
    const today = appointments.filter((a) => new Date(a.appointment_date).toDateString() === todayStr).length;
    const confirmed = appointments.filter((a) => (a.status || "pending") === "confirmed").length;
    const pending = appointments.filter((a) => (a.status || "pending") === "pending").length;
    const cancelled = appointments.filter((a) => (a.status || "pending") === "cancelled").length;
    return { today, confirmed, pending, cancelled };
  }, [appointments]);

  /* ===============================
     LOADING
  ================================ */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p>Loading…</p>
      </div>
    );
  }

  /* ===============================
     RENDER
  ================================ */
  return (
    <ConsoleShell todayCount={filteredAppointments.length}>
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Today's Appointments</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.today}</p>
              <p className="mt-1 text-xs text-slate-500">Confirmed today</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Confirmed</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">{summary.confirmed}</p>
              <p className="mt-1 text-xs text-slate-500">Across all dates</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Pending</p>
              <p className="mt-2 text-3xl font-semibold text-amber-500">{summary.pending}</p>
              <p className="mt-1 text-xs text-slate-500">Awaiting confirmation</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Cancelled</p>
              <p className="mt-2 text-3xl font-semibold text-rose-500">{summary.cancelled}</p>
              <p className="mt-1 text-xs text-slate-500">Needs follow-up</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-slate-900">Appointments</CardTitle>
            <CardDescription>
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : "Schedule and track all appointments"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border-y border-slate-100 bg-slate-50/80 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="h-4 w-4 text-slate-500" />

                <Select value={selectedDoctor} onValueChange={(v) => setSelectedDoctor(v)}>
                  <SelectTrigger className="w-[190px] bg-white">
                    <SelectValue placeholder="Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {uniqueDoctors.map((doctorName) => (
                      <SelectItem key={doctorName} value={doctorName}>
                        {doctorName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[190px] justify-start bg-white text-left",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[170px] bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {(selectedDoctor !== "all" || selectedDate || selectedStatus !== "all") && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Patient</div>
                  <div className="col-span-2">Doctor</div>
                  <div className="col-span-2">Contact</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y">
                  {filteredAppointments.map((a) => (
                    <div key={a.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-slate-900">{new Date(a.appointment_date).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500">{a.appointment_time}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-slate-900">{a.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{a.email}</p>
                      </div>
                      <div className="col-span-2 text-sm text-slate-700">{a.selected_doctor || "-"}</div>
                      <div className="col-span-2 text-sm text-slate-600">{a.phone || "-"}</div>
                      <div className="col-span-2">{getStatusBadge(a.status)}</div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionBusyId === a.id}
                          onClick={() => setRescheduleAppointment(a)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionBusyId === a.id}
                          onClick={() => cancel(a.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" disabled={actionBusyId === a.id} onClick={() => markDone(a.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="divide-y md:hidden">
              {filteredAppointments.map((a) => (
                <div key={a.id} className="space-y-2 px-4 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{a.full_name}</p>
                      <p className="text-xs text-slate-500">{new Date(a.appointment_date).toLocaleDateString()} • {a.appointment_time}</p>
                    </div>
                    {getStatusBadge(a.status)}
                  </div>
                  <p className="text-sm text-slate-600">{a.selected_doctor || "-"}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setRescheduleAppointment(a)}>
                      Reschedule
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => cancel(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => markDone(a.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {!filteredAppointments.length && (
              <div className="py-12 text-center text-slate-500">No appointments found</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <RescheduleModal
          isOpen={!!rescheduleAppointment}
          onClose={() => setRescheduleAppointment(null)}
          appointmentId={rescheduleAppointment.id}
          patientName={rescheduleAppointment.full_name}
          currentDate={rescheduleAppointment.appointment_date}
          currentTime={rescheduleAppointment.appointment_time}
          onSuccess={() => {
            setRescheduleAppointment(null);
            fetchAppointments();
          }}
        />
      )}
    </ConsoleShell>
  );
}
