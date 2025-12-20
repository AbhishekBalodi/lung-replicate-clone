import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { useAppointments } from "@/contexts/AppointmentContext";
import ConsoleShell from "../layouts/ConsoleShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Check, FileText, Eye, EyeOff, Download } from "lucide-react";
import RescheduleModal from "@/components/RescheduleModal";

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
}

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useCustomAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Use shared appointment context
  const { 
    appointments, 
    loading, 
    fetchAppointments, 
    markAppointmentDone, 
    cancelAppointment 
  } = useAppointments();

  const [actionBusyId, setActionBusyId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);

  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, fetchAppointments]);

  const markDone = async (id: number) => {
    setActionBusyId(id);
    const success = await markAppointmentDone(id);
    if (success) {
      toast({ title: "Completed", description: "Appointment marked as done." });
    } else {
      toast({ title: "Error", description: "Failed to mark as done", variant: "destructive" });
    }
    setActionBusyId(null);
  };

  const cancel = async (id: number) => {
    setActionBusyId(id);
    const success = await cancelAppointment(id);
    if (success) {
      toast({ title: "Cancelled", description: "Appointment cancelled." });
    } else {
      toast({ title: "Error", description: "Failed to cancel appointment", variant: "destructive" });
    }
    setActionBusyId(null);
  };

  // Filter appointments based on search query
  const filteredAppointments = appointments.filter((a) => {
    if (!searchQuery) return true;
    return (
      a.full_name.toLowerCase().includes(searchQuery) ||
      a.email.toLowerCase().includes(searchQuery) ||
      a.phone.toLowerCase().includes(searchQuery) ||
      a.selected_doctor.toLowerCase().includes(searchQuery)
    );
  });

  // Check if appointment is done
  const isDone = (a: Appointment) => a.status === "done";

  // PDF generators
  const generateInvoicePDF = (appointment: Appointment) => {
    window.open(`/api/invoice/${appointment.id}`, "_blank");
  };

  const generatePrescriptionPDF = (appointment: Appointment) => {
    window.open(`/api/prescription/${appointment.id}`, "_blank");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p>Loading…</p>
      </div>
    );
  }

  const renderActions = (a: Appointment) => {
    if (isDone(a)) {
      // Done appointments: Invoice, Prescription, Details/Hide
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => generateInvoicePDF(a)}
          >
            <FileText className="h-4 w-4 mr-1" /> Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => generatePrescriptionPDF(a)}
          >
            <Download className="h-4 w-4 mr-1" /> Prescription
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
          >
            {expandedId === a.id ? (
              <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
            ) : (
              <><Eye className="h-4 w-4 mr-1" /> Details</>
            )}
          </Button>
        </>
      );
    }

    // Pending/scheduled appointments: Details, Reschedule, Cancel, Done
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
        >
          {expandedId === a.id ? (
            <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
          ) : (
            <><Eye className="h-4 w-4 mr-1" /> Details</>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={actionBusyId === a.id}
          onClick={() => setRescheduleAppointment(a)}
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
      </>
    );
  };

  return (
    <ConsoleShell todayCount={filteredAppointments.length}>
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Appointments</CardTitle>
          <CardDescription>
            {searchQuery ? `Search results for "${searchQuery}"` : "Your full list of appointments"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop table view */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-6 gap-3 font-medium text-slate-500 px-5 py-3 border-t border-slate-100">
                <div>When</div>
                <div>Patient</div>
                <div>Doctor</div>
                <div>Room</div>
                <div>Notes</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y">
                {filteredAppointments.map((a) => (
                  <div key={a.id} className="grid grid-cols-6 gap-3 items-center px-5 py-4">
                    <div>
                      <div className="font-medium">
                        {new Date(a.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs rounded-md bg-slate-100 inline-block px-2 py-0.5 mt-1">
                        {a.appointment_time}
                      </div>
                      {isDone(a) && (
                        <div className="text-xs rounded-md bg-green-100 text-green-800 inline-block px-2 py-0.5 mt-1 ml-1">
                          Done
                        </div>
                      )}
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
                      {renderActions(a)}
                    </div>
                  </div>
                ))}

                {!filteredAppointments.length && (
                  <div className="text-center py-12 text-slate-500">
                    {searchQuery ? `No appointments found for "${searchQuery}"` : "No appointments"}
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

          {/* Mobile card view */}
          <div className="lg:hidden divide-y">
            {filteredAppointments.map((a) => (
              <div key={a.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-base">
                      {new Date(a.appointment_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{a.appointment_time}</div>
                    {isDone(a) && (
                      <div className="text-xs rounded-md bg-green-100 text-green-800 inline-block px-2 py-0.5 mt-1">
                        Done
                      </div>
                    )}
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
                  {renderActions(a)}
                </div>
              </div>
            ))}

            {!filteredAppointments.length && (
              <div className="text-center py-12 text-slate-500">
                {searchQuery ? `No appointments found for "${searchQuery}"` : "No appointments"}
                <div className="mt-4">
                  <Button onClick={() => navigate("/book-appointment")}>
                    Book Appointment
                  </Button>
                </div>
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