import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ConsoleShell from "../layouts/ConsoleShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Check } from "lucide-react";

interface Appointment {
  id: number; // MySQL numeric id
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string; // yyyy-mm-dd (string from MySQL)
  appointment_time: string; // hh:mm
  selected_doctor: string;
  message: string | null;
  status?: string | null;
  created_at?: string | null;
}

const API_BASE = "/api/appointment";

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusyId, setActionBusyId] = useState<number | null>(null);

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
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark appointment as done (already points to your Express backend)
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

  // Cancel appointment in MySQL (requires DELETE route on backend)
  const cancel = async (id: number) => {
    try {
      setActionBusyId(id);
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to cancel appointment");
      toast({ title: "Cancelled", description: "Appointment cancelled." });
      fetchAppointments();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionBusyId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <ConsoleShell todayCount={appointments.length}>
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Appointments</CardTitle>
          <CardDescription>Your full list of appointments</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[980px]">
              {/* header row */}
              <div className="grid grid-cols-6 gap-3 font-medium text-slate-500 px-5 py-3 border-t border-slate-100">
                <div>When</div>
                <div>Patient</div>
                <div>Doctor</div>
                <div>Room</div>
                <div>Notes</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y">
                {appointments.map((a) => (
                  <div key={a.id} className="grid grid-cols-6 gap-3 items-center px-5 py-4">
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
                    <div className="text-sm text-slate-500 truncate">{a.message ?? "-"}</div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={actionBusyId === a.id}
                        onClick={() => navigate(`/book-appointment?edit=${a.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Reschedule
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="shrink-0"
                        disabled={actionBusyId === a.id}
                        onClick={() => cancel(a.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Cancel
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
                        disabled={actionBusyId === a.id}
                        onClick={() => markDone(a.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Done
                      </Button>
                    </div>
                  </div>
                ))}

                {!appointments.length && (
                  <div className="text-center py-12 text-slate-500">
                    No appointments
                    <div className="mt-4">
                      <Button onClick={() => navigate("/book-appointment")}>
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ConsoleShell>
  );
}
