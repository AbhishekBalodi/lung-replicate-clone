import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { useAppointments } from "@/contexts/AppointmentContext";
import ConsoleShell from "../layouts/ConsoleShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  Trash2,
  Check,
  FileText,
  Eye,
  EyeOff,
  Download,
  Filter,
  CalendarIcon,
} from "lucide-react";
import RescheduleModal from "@/components/RescheduleModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  doctor_id: number;
  doctor_name: string;
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] =
    useState<Appointment | null>(null);

  /* ===============================
     FILTER STATE
  ================================ */
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState<number | "all">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  /* ===============================
     UNIQUE DOCTORS
  ================================ */
  const uniqueDoctors = useMemo(() => {
    const map = new Map<number, string>();
    appointments.forEach((a) => {
      map.set(a.doctor_id, a.doctor_name);
    });
    return Array.from(map.entries()); // [id, name]
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
          a.doctor_name.toLowerCase().includes(searchQuery);
        if (!matches) return false;
      }

      if (selectedDoctor !== "all" && a.doctor_id !== selectedDoctor) {
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
    setSelectedDepartment("all");
    setSelectedDate(undefined);
    setSelectedStatus("all");
  };

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
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : "Your full list of appointments"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {/* Filters */}
          <div className="px-5 py-4 bg-slate-50 border-b">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="h-4 w-4 text-slate-500" />

              {/* Doctor */}
              <Select
                value={selectedDoctor === "all" ? "all" : String(selectedDoctor)}
                onValueChange={(v) =>
                  setSelectedDoctor(v === "all" ? "all" : Number(v))
                }
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {uniqueDoctors.map(([id, name]) => (
                    <SelectItem key={id} value={String(id)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] justify-start text-left bg-white",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Status */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px] bg-white">
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
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="divide-y">
            {filteredAppointments.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-7 gap-3 px-5 py-4 items-center"
              >
                <div>
                  <div className="font-medium">
                    {new Date(a.appointment_date).toLocaleDateString()}
                  </div>
                  <div className="text-xs bg-slate-100 rounded px-2 inline-block mt-1">
                    {a.appointment_time}
                  </div>
                </div>

                <div className="font-medium">{a.full_name}</div>
                <div>{a.doctor_name}</div>
                <div>{getStatusBadge(a.status)}</div>
                <div className="col-span-2 text-sm text-slate-500 truncate">
                  {a.message || "-"}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionBusyId === a.id}
                    onClick={() => cancel(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    disabled={actionBusyId === a.id}
                    onClick={() => markDone(a.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {!filteredAppointments.length && (
              <div className="py-12 text-center text-slate-500">
                No appointments found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
