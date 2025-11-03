import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ConsoleShell from "../layouts/ConsoleShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";

interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  created_at: string;
  user_id?: string;
}

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => { if (user) fetchAppointments(); }, [user]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user?.id)
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      setAppointments(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id: string) => {
    try {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Cancelled", description: "Appointment cancelled." });
      fetchAppointments();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (authLoading || loading)
    return <div className="min-h-screen grid place-items-center"><p>Loading…</p></div>;

  return (
    <ConsoleShell todayCount={appointments.length}>
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Appointments</CardTitle>
          <CardDescription>Your full list of appointments</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {/* header row */}
          <div className="grid grid-cols-6 gap-3 font-medium text-slate-500 px-5 py-3 border-t border-slate-100">
            <div>When</div><div>Patient</div><div>Doctor</div>
            <div>Room</div><div>Notes</div><div>Actions</div>
          </div>

          <div className="divide-y">
            {appointments.map(a => (
              <div key={a.id} className="grid grid-cols-6 gap-3 items-center px-5 py-4">
                <div>
                  <div className="font-medium">{new Date(a.appointment_date).toLocaleDateString()}</div>
                  <div className="text-xs rounded-md bg-slate-100 inline-block px-2 py-0.5 mt-1">{a.appointment_time}</div>
                </div>
                <div className="font-medium">{a.full_name}</div>
                <div>{a.selected_doctor}</div>
                <div><span className="text-xs rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5">Room 1</span></div>
                <div className="text-sm text-slate-500 truncate">{a.message ?? "-"}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/book-appointment?edit=${a.id}`)}>
                    <Edit className="h-4 w-4 mr-1" /> Reschedule
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => cancel(a.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ))}

            {!appointments.length && (
              <div className="text-center py-12 text-slate-500">
                No appointments
                <div className="mt-4">
                  <Button onClick={() => navigate("/book-appointment")}>Book Appointment</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </ConsoleShell>
  );
}
