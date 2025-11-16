import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Check } from "lucide-react";
import ConsoleShell from "@/layouts/ConsoleShell";
import DashboardAppointmentDialog from "@/components/DashboardAppointmentDialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: number; // MySQL numeric id
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string; // yyyy-mm-dd
  appointment_time: string; // HH:mm
  selected_doctor: string;
  message: string | null;
  created_at?: string | null;
  status?: string | null;
}

const API_BASE = "/api/appointment";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionBusyId, setActionBusyId] = useState<number | null>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);

  // Local state for quick booking widget
  const [visitType, setVisitType] = useState<"In-clinic" | "Video">("In-clinic");
  const [doctor, setDoctor] = useState<string>("Dr. Priya Mehta");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState<string>("");

  // redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // OPTION A: fetch ALL appointments (no email filter)
      const res = await fetch(`${API_BASE}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch appointments");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setAppointments([]);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      const res = await fetch(`${API_BASE}/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to cancel appointment");
      toast({ title: "Success", description: "Appointment cancelled successfully" });
      fetchAppointments();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  // ✅ Mark as Done (sync to patients via Express)
  const markDone = async (id: number) => {
    try {
      setActionBusyId(id);
      const res = await fetch(`${API_BASE}/${id}/done`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to mark as done");
      toast({ title: "Completed", description: "Appointment marked as done." });
      fetchAppointments();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionBusyId(null);
    }
  };

  // Generate a simple slot grid for the selected date (UI only; no backend change)
  const slots = useMemo(() => {
    return [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "12:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
    ];
  }, []);

  const confirmFromDashboard = () => {
    if (!date || !time) {
      toast({ title: "Select a date & time", description: "Choose both to continue." });
      return;
    }
    const params = new URLSearchParams({
      doctor,
      visitType,
      date,
      time,
      source: "dashboard",
    });
    navigate(`/book-appointment?${params.toString()}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <DashboardAppointmentDialog 
        open={showAppointmentDialog}
        onOpenChange={setShowAppointmentDialog}
        onSuccess={fetchAppointments}
      />
      
      <ConsoleShell 
        todayCount={appointments.length}
        onNewAppointment={() => setShowAppointmentDialog(true)}
      >
      {/* Main grid: left KPIs + table, right booking column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Left column (spans 2) */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          {/* KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-semibold">{appointments.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-semibold">
                  {appointments.filter((a) => new Date(a.appointment_date) >= new Date()).length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-semibold">
                  {appointments.filter((a) => {
                    const today = new Date().toISOString().split('T')[0];
                    return a.appointment_date === today;
                  }).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Account Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm break-all">{user?.email}</div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments table - responsive */}
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Your Appointments</CardTitle>
              <CardDescription>View and manage your scheduled appointments</CardDescription>
            </CardHeader>

            <CardContent className="p-0 overflow-hidden">
              {/* Desktop table view */}
              <div className="hidden lg:block overflow-x-auto">
                <div className="min-w-[980px]">
                  {/* Header row */}
                  <div className="grid grid-cols-6 gap-3 font-medium text-slate-500 px-5 py-3 border-t border-slate-100">
                    <div>When</div>
                    <div>Patient</div>
                    <div>Doctor</div>
                    <div>Room</div>
                    <div>Notes</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {/* Rows */}
                  <div className="max-h-[320px] overflow-y-auto divide-y">
                    {appointments.map((a) => (
                      <div
                        key={a.id}
                        className="grid grid-cols-6 gap-3 items-center px-5 py-4"
                      >
                        {/* When */}
                        <div>
                          <div className="font-medium">
                            {new Date(a.appointment_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs rounded-md bg-slate-100 inline-block px-2 py-0.5 mt-1">
                            {a.appointment_time}
                          </div>
                        </div>
                        <div className="font-medium">{a.full_name}</div>
                        <div>{a.selected_doctor}</div>
                        <div>
                          <span className="text-xs rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5">
                            Room 1
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                          {a.message ?? "-"}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3 shrink-0"
                            disabled={actionBusyId === a.id}
                            onClick={() => navigate(`/book-appointment?edit=${a.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="px-3 shrink-0"
                            disabled={actionBusyId === a.id}
                            onClick={() => setDeleteId(a.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 shrink-0"
                            disabled={actionBusyId === a.id}
                            onClick={() => markDone(a.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Done
                          </Button>
                        </div>
                      </div>
                    ))}

                    {!appointments.length && (
                      <div className="text-center py-12 text-slate-500">
                        No appointments
                        <div className="mt-4">
                          <Button onClick={() => navigate("/book-appointment")}>
                            Book Your First Appointment
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile card view */}
              <div className="lg:hidden divide-y max-h-[500px] overflow-y-auto">
                {appointments.map((a) => (
                  <div key={a.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-base">
                          {new Date(a.appointment_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">{a.appointment_time}</div>
                      </div>
                      <span className="text-xs rounded-md bg-emerald-100 text-emerald-800 px-2 py-1">
                        Room 1
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div><span className="text-slate-500">Patient:</span> <span className="font-medium">{a.full_name}</span></div>
                      <div><span className="text-slate-500">Doctor:</span> {a.selected_doctor}</div>
                      {a.message && (
                        <div><span className="text-slate-500">Notes:</span> {a.message}</div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[100px]"
                        disabled={actionBusyId === a.id}
                        onClick={() => navigate(`/book-appointment?edit=${a.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 min-w-[100px]"
                        disabled={actionBusyId === a.id}
                        onClick={() => setDeleteId(a.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700 flex-1 min-w-[100px]"
                        disabled={actionBusyId === a.id}
                        onClick={() => markDone(a.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                    </div>
                  </div>
                ))}

                {!appointments.length && (
                  <div className="text-center py-12 text-slate-500">
                    No appointments
                    <div className="mt-4">
                      <Button onClick={() => navigate("/book-appointment")}>
                        Book Your First Appointment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Quick booking (UI only; routes to existing booking page) */}
        <div className="space-y-4 md:space-y-6">
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Book an Appointment</CardTitle>
              <CardDescription>Live availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Visit type & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Visit Type</label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value as any)}
                    className="w-full mt-1 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring focus:ring-emerald-100"
                  >
                    <option>In-clinic</option>
                    <option>Video</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Preferred Doctor</label>
                  <select
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="w-full mt-1 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring focus:ring-emerald-100"
                  >
                    <option>Dr. Priya Mehta</option>
                    <option>Dr. Paramjeet Singh Mann</option>
                  </select>
                </div>
              </div>

              {/* Date selector */}
              <div>
                <label className="text-xs text-slate-500">Choose Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring focus:ring-emerald-100"
                />
              </div>

              {/* Times grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Available Slots on Selected Day</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={[
                        "rounded-md px-3 py-2 border text-sm",
                        time === t
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="font-medium mb-2 text-slate-700">Appointment Summary</div>
                <dl className="text-sm grid grid-cols-2 gap-y-1">
                  <dt className="text-slate-500">Doctor</dt>
                  <dd className="text-slate-900">{doctor}</dd>
                  <dt className="text-slate-500">Visit Type</dt>
                  <dd className="text-slate-900">{visitType}</dd>
                  <dt className="text-slate-500">Date</dt>
                  <dd className="text-slate-900">{date || "-"}</dd>
                  <dt className="text-slate-500">Time</dt>
                  <dd className="text-slate-900">{time || "-"}</dd>
                  <dt className="text-slate-500">Clinic</dt>
                  <dd className="text-slate-900">12, Park Street, Kolkata</dd>
                  <dt className="text-slate-500">Fee</dt>
                  <dd className="text-emerald-700 font-semibold">₹800</dd>
                </dl>

                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={confirmFromDashboard}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    Confirm Booking
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/book-appointment")}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel dialog */}
      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel your appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Cancel Appointment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConsoleShell>
    </>
  );
}
