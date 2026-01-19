import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { useAppointments } from "@/contexts/AppointmentContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Check, User, Pill, FlaskConical, Stethoscope, ClipboardList, FileText, Download } from "lucide-react";
import ConsoleShell from "@/layouts/ConsoleShell";
import RescheduleModal from "@/components/RescheduleModal";
import DashboardKPICards from "@/components/dashboard/DashboardKPICards";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

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
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  created_at?: string | null;
  status?: string | null;
}

export default function Dashboard() {
  const { user, loading: authLoading, isHospitalTenant, tenantInfo } = useCustomAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use shared appointment context
  const { 
    appointments, 
    loading, 
    fetchAppointments, 
    markAppointmentDone, 
    cancelAppointment,
    loadPatientDetails,
    patientDetailsCache,
    prescriptionUpdateTrigger,
    refreshPatientDetails
  } = useAppointments();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionBusyId, setActionBusyId] = useState<number | null>(null);
  
  // Reschedule modal state
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);

  // Local state for quick booking widget
  const [visitType, setVisitType] = useState<"In-clinic" | "Video">("In-clinic");
  const [doctor, setDoctor] = useState<string>("Dr. Priya Mehta");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState<string>("");

  // State for expanded row
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // ============================
  // 📌 Fetch patient by email or phone
  // ============================
  const fetchPatientRecord = async (email: string, phone: string) => {
    try {
      const q = email ? email : phone;
      const res = await apiFetch(`/api/patients?q=${encodeURIComponent(q)}`, { method: "GET" });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      return data[0]; // always the first match
    } catch {
      return null;
    }
  };

  // ============================
  // 📌 Fetch full patient details (medicines, lab tests, procedures)
  // ============================
  const fetchPatientFullData = async (patientId: number) => {
    try {
      const res = await apiFetch(`/api/patients/${patientId}`, { method: "GET" });
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  };

  // ============================
  // 📌 Toggle expand section
  // ============================
  const toggleExpand = async (appt: Appointment) => {
    if (expandedRow === appt.id) {
      setExpandedRow(null);
      return;
    }

    setExpandedRow(appt.id);

    // 🧹 Reset previous patient data instantly
    setPatientDetails(null);
    setLoadingPatient(true);

    // Step 1: fetch patient basic record
    const record = await fetchPatientRecord(appt.email, appt.phone);

    if (!record) {
      setLoadingPatient(false);
      return;
    }

    // Step 2: fetch medicines, labs, procedures
    const fullData = await fetchPatientFullData(record.id);

    // Step 3: appointment history
    const histRes = await apiFetch(`/api/appointment?email=${encodeURIComponent(appt.email)}`, { method: "GET" });
    const history = await histRes.json();

    setPatientDetails({
      ...record,
      appointments: history || [],
      medicines: fullData?.medicines || [],
      lab_tests: fullData?.lab_tests || [],
      procedures: fullData?.procedures || []
    });

    setLoadingPatient(false);
  };








  // redirect if not logged in or not admin
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, fetchAppointments]);

  // Refresh patient details when prescription update trigger changes
  useEffect(() => {
    if (expandedRow && patientDetails) {
      const appt = appointments.find(a => a.id === expandedRow);
      if (appt) {
        refreshPatientDetails(expandedRow, appt.email, appt.phone).then(() => {
          // Update local state from cache
          const cached = patientDetailsCache[expandedRow];
          if (cached) setPatientDetails(cached);
        });
      }
    }
  }, [prescriptionUpdateTrigger]);

  const handleDelete = async () => {
    if (deleteId == null) return;
    const success = await cancelAppointment(deleteId);
    if (success) {
      toast({ title: "Success", description: "Appointment cancelled successfully" });
    } else {
      toast({ title: "Error", description: "Failed to cancel appointment", variant: "destructive" });
    }
    setDeleteId(null);
  };

  // Mark as Done - uses context for instant UI update
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

  // ========================
  // INVOICE PDF GENERATOR
  // ========================
  const generateInvoicePDF = (appointment: Appointment) => {
    window.open(`/api/invoice/${appointment.id}`, "_blank");
  };

  // ========================
  // PRESCRIPTION PDF GENERATOR
  // ========================
  const generatePrescriptionPDF = (appointment: Appointment) => {
    window.open(`/api/prescription/${appointment.id}`, "_blank");
  };


  // Calculate KPI values
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const urgentAppointments = todayAppointments.filter(a => a.status !== "done").length;
  const activePatients = new Set(appointments.map(a => a.email)).size;
  const newPatients = appointments.filter(a => {
    const apptDate = new Date(a.appointment_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return apptDate >= weekAgo;
  }).length;

  // Handle view appointment from tabs
  const handleViewAppointment = (appt: Appointment) => {
    toggleExpand(appt);
  };

  return (
    <>
      <ConsoleShell
        todayCount={appointments.length}
      >
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Doctor'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your patients today.
          </p>
        </div>

        {/* Enhanced KPI Cards */}
        <DashboardKPICards
          todayAppointments={todayAppointments.length}
          urgentAppointments={urgentAppointments}
          pendingReports={7}
          reportsReady={2}
          activePatients={activePatients}
          newPatients={newPatients}
          pendingTasks={5}
          highPriorityTasks={2}
        />

        {/* Tabbed Dashboard Section */}
        <div className="mt-8">
          <DashboardTabs 
            appointments={appointments}
            onViewAppointment={handleViewAppointment}
            isHospital={isHospitalTenant}
          />
        </div>

        {/* Main grid: left table, right booking column */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mt-8">
          {/* Left column (spans 2) */}
          <div className="xl:col-span-2 space-y-4 md:space-y-6">

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
                    <div className="h-[75vh] overflow-y-auto divide-y">
                      {appointments.map((a) => (
                        <div key={a.id}>
                          <div className="grid grid-cols-6 gap-3 items-center px-5 py-4">
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

                              {/* When appointment is NOT done → show normal buttons */}
                              {a.status !== "done" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleExpand(a)}
                                  >
                                    {expandedRow === a.id ? "Hide" : "Details"}
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-3 shrink-0"
                                    disabled={actionBusyId === a.id}
                                    onClick={() => setRescheduleAppointment(a)}
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
                                </>
                              )}

                              {/* When appointment is DONE → show Invoice + Prescription */}
                              {a.status === "done" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-3 shrink-0"
                                    onClick={() => generateInvoicePDF(a)}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Invoice
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="px-3 shrink-0"
                                    onClick={() => generatePrescriptionPDF(a)}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Prescription
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleExpand(a)}
                                  >
                                    {expandedRow === a.id ? "Hide" : "Details"}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* ======== DROPDOWN ======== */}
                          {expandedRow === a.id && (
                            <div className="col-span-6 bg-slate-50 border border-emerald-200 rounded-lg p-4 mx-5 mb-4 transition-all duration-300 ease-in-out animate-slideDown">
                              {loadingPatient ? (
                                <div className="flex items-center gap-2 text-emerald-700">
                                  <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-emerald-700 rounded-full"></span>
                                  Loading patient details…
                                </div>
                              ) : patientDetails ? (
                                <div className="space-y-6">
                                  <Card className="border border-emerald-300">
                                    <CardHeader>
                                      <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                                        <User className="h-5 w-5 text-emerald-700" />
                                        Patient Information
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-1">
                                      <p><strong>Name:</strong> {patientDetails.full_name}</p>
                                      <p><strong>Email:</strong> {patientDetails.email}</p>
                                      <p><strong>Phone:</strong> {patientDetails.phone}</p>
                                    </CardContent>
                                  </Card>

                                  <Card className="border border-emerald-300">
                                    <CardHeader>
                                      <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-emerald-700" />
                                        Appointments
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {patientDetails.appointments?.length ? (
                                        patientDetails.appointments.map((appt: any) => (
                                          <div key={appt.id} className="border border-emerald-100 rounded p-2 mb-2 bg-white">
                                            <p className="font-medium text-emerald-900">
                                              {new Date(appt.appointment_date).toLocaleDateString()} — {appt.appointment_time}
                                            </p>
                                            {appt.message && (
                                              <p className="text-sm text-slate-600 mt-1">{appt.message}</p>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-slate-600">No past appointments.</p>
                                      )}
                                    </CardContent>
                                  </Card>

                                  <Card className="border border-emerald-300">
                                    <CardHeader>
                                      <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                                        <Pill className="h-5 w-5 text-emerald-700" />
                                        Prescribed Medicines
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {patientDetails.medicines?.length ? (
                                        <table className="w-full text-sm">
                                          <thead>
                                            <tr className="border-b bg-emerald-50">
                                              <th className="p-2 text-left">Medicine</th>
                                              <th className="p-2 text-left">Dosage</th>
                                              <th className="p-2 text-left">Frequency</th>
                                              <th className="p-2 text-left">Duration</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {patientDetails.medicines.map((m: any) => (
                                              <tr key={m.id} className="border-b">
                                                <td className="p-2">{m.medicine_name}</td>
                                                <td className="p-2">{m.dosage}</td>
                                                <td className="p-2">{m.frequency}</td>
                                                <td className="p-2">{m.duration}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <p className="text-slate-600">No medicines prescribed.</p>
                                      )}
                                    </CardContent>
                                  </Card>

                                  <Card className="border border-emerald-300">
                                    <CardHeader>
                                      <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                                        <FlaskConical className="h-5 w-5 text-emerald-700" />
                                        Prescribed Lab Tests
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {patientDetails.lab_tests?.length ? (
                                        patientDetails.lab_tests.map((lab: any) => (
                                          <div key={lab.id} className="border rounded p-2 mb-2 bg-white">
                                            <p className="font-medium">{lab.test_name}</p>
                                            <p className="text-sm text-slate-600">Category: {lab.category}</p>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-slate-600">No lab tests prescribed.</p>
                                      )}
                                    </CardContent>
                                  </Card>

                                  <Card className="border border-emerald-300">
                                    <CardHeader>
                                      <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5 text-emerald-700" />
                                        Prescribed Procedures
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {patientDetails.procedures?.length ? (
                                        patientDetails.procedures.map((proc: any) => (
                                          <div key={proc.id} className="border rounded p-2 mb-2 bg-white">
                                            <p className="font-medium">{proc.procedure_name}</p>
                                            <p className="text-sm text-slate-600">{proc.description}</p>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-slate-600">No procedures prescribed.</p>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              ) : (
                                <p className="text-slate-600">No patient details available.</p>
                              )}
                            </div>
                          )}
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
                        {/* When appointment is NOT done */}
                        {a.status !== "done" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 min-w-[100px]"
                              onClick={() => toggleExpand(a)}
                            >
                              {expandedRow === a.id ? "Hide" : "Details"}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 min-w-[100px]"
                              disabled={actionBusyId === a.id}
                              onClick={() => setRescheduleAppointment(a)}
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
                          </>
                        )}

                        {/* When appointment is DONE */}
                        {a.status === "done" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 min-w-[100px]"
                              onClick={() => generateInvoicePDF(a)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 min-w-[100px]"
                              onClick={() => generatePrescriptionPDF(a)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Prescription
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 min-w-[100px]"
                              onClick={() => toggleExpand(a)}
                            >
                              {expandedRow === a.id ? "Hide" : "Details"}
                            </Button>
                          </>
                        )}
                      </div>
                      {expandedRow === a.id && (
                        <div className="mt-3 p-3 rounded-lg border border-emerald-300 bg-slate-50 transition-all duration-300 ease-in-out animate-slideDown">

                          {loadingPatient ? (
                            <div className="flex items-center gap-2 text-emerald-700">
                              <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-emerald-700 rounded-full"></span>
                              Loading patient details…
                            </div>
                          ) : patientDetails ? (
                            <div className="space-y-6">

                              {/* PATIENT INFO */}
                              <Card className="border border-emerald-300">
                                <CardHeader>
                                  <CardTitle className="text-emerald-800 text-base flex items-center gap-2">
                                    <User className="h-5 w-5 text-emerald-700" />
                                    Patient Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                  <p><strong>Name:</strong> {patientDetails.full_name}</p>
                                  <p><strong>Email:</strong> {patientDetails.email}</p>
                                  <p><strong>Phone:</strong> {patientDetails.phone}</p>
                                </CardContent>
                              </Card>

                              {/* APPOINTMENTS */}
                              <Card className="border border-emerald-300">
                                <CardHeader>
                                  <CardTitle className="text-emerald-800 text-base flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-emerald-700" />
                                    Appointments
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {patientDetails.appointments?.length ? (
                                    patientDetails.appointments.map((appt: any) => (
                                      <div key={appt.id} className="border rounded p-2 mb-2 bg-white">
                                        <p className="font-medium">
                                          {new Date(appt.appointment_date).toLocaleDateString()} — {appt.appointment_time}
                                        </p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-slate-600">No past appointments.</p>
                                  )}
                                </CardContent>
                              </Card>

                              {/* MEDICINES */}
                              <Card className="border border-emerald-300">
                                <CardHeader>
                                  <CardTitle className="text-emerald-800 text-base flex items-center gap-2">
                                    <Pill className="h-5 w-5 text-emerald-700" />
                                    Medicines
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {patientDetails.medicines?.length ? (
                                    patientDetails.medicines.map((m: any) => (
                                      <div key={m.id} className="border rounded p-2 mb-2 bg-white">
                                        <p className="font-medium">{m.medicine_name}</p>
                                        <p className="text-sm text-slate-600">{m.dosage} — {m.frequency} — {m.duration}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-slate-600">No medicines prescribed.</p>
                                  )}
                                </CardContent>
                              </Card>

                              {/* LAB TESTS */}
                              <Card className="border border-emerald-300">
                                <CardHeader>
                                  <CardTitle className="text-emerald-800 text-base flex items-center gap-2">
                                    <FlaskConical className="h-5 w-5 text-emerald-700" />
                                    Lab Tests
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {patientDetails.lab_tests?.length ? (
                                    patientDetails.lab_tests.map((lab: any) => (
                                      <div key={lab.id} className="border rounded p-2 mb-2 bg-white">
                                        <p className="font-medium">{lab.test_name}</p>
                                        <p className="text-sm text-slate-600">Category: {lab.category}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-slate-600">No tests prescribed.</p>
                                  )}
                                </CardContent>
                              </Card>

                              {/* PROCEDURES */}
                              <Card className="border border-emerald-300 mb-2">
                                <CardHeader>
                                  <CardTitle className="text-emerald-800 text-base flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-emerald-700" />
                                    Procedures
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {patientDetails.procedures?.length ? (
                                    patientDetails.procedures.map((p: any) => (
                                      <div key={p.id} className="border rounded p-2 mb-2 bg-white">
                                        <p className="font-medium">{p.procedure_name}</p>
                                        <p className="text-sm text-slate-600">{p.description}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-slate-600">No procedures prescribed.</p>
                                  )}
                                </CardContent>
                              </Card>

                            </div>
                          ) : (
                            <p className="text-slate-600">No patient details available.</p>
                          )}
                        </div>
                      )}




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

        {/* Reschedule Modal */}
        {rescheduleAppointment && (
          <RescheduleModal
            isOpen={!!rescheduleAppointment}
            onClose={() => setRescheduleAppointment(null)}
            appointmentId={rescheduleAppointment.id}
            patientName={rescheduleAppointment.full_name}
            currentDate={rescheduleAppointment.appointment_date}
            currentTime={rescheduleAppointment.appointment_time}
            onSuccess={fetchAppointments}
          />
        )}
      </ConsoleShell>
    </>
  );
}
