import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Search, Plus, Settings, Pencil, Trash2, UserCircle, CalendarDays, Pill, Beaker, Scissors } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type PatientStatus = "Active" | "Critical" | "Recovering" | "Discharged";

interface Patient {
  id: number | null;
  patient_uid?: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  age?: number | null;
  gender?: string | null;
  assigned_doctor?: string | null;
  dashboard_access?: boolean;
  status?: PatientStatus;
}

type AppointmentItem = {
  id: number;
  appointment_date: string;
  appointment_time: string;
  doctor_name?: string | null;
  selected_doctor?: string | null;
  status?: string | null;
  message?: string | null;
};

type MedicineItem = {
  id: number;
  medicine_name?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
  prescribed_date?: string | null;
};

type LabItem = {
  id: number;
  test_name?: string | null;
  category?: string | null;
  sample_type?: string | null;
  preparation_instructions?: string | null;
  prescribed_date?: string | null;
};

type ProcedureItem = {
  id: number;
  procedure_name?: string | null;
  category?: string | null;
  description?: string | null;
  preparation_instructions?: string | null;
  prescribed_date?: string | null;
};

type PatientDetails = Patient & {
  date_of_birth?: string | null;
  address?: string | null;
  doctor_id?: number | null;
  medicines: MedicineItem[];
  lab_tests: LabItem[];
  procedures: ProcedureItem[];
  appointments: AppointmentItem[];
};

const STATUS_BADGE_MAP: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Critical: "bg-red-100 text-red-700",
  Recovering: "bg-orange-100 text-orange-700",
  Discharged: "bg-slate-100 text-slate-600",
};

const APPOINTMENT_STATUS_BADGE_MAP: Record<string, string> = {
  done: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  confirmed: "bg-blue-100 text-blue-700",
};

const statusBadge = (status?: string) => {
  const s = status || "Active";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_MAP[s] || STATUS_BADGE_MAP.Active}`}>
      {s}
    </span>
  );
};

const appointmentStatusBadge = (status?: string | null) => {
  const s = (status || "pending").toLowerCase();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${APPOINTMENT_STATUS_BADGE_MAP[s] || "bg-slate-100 text-slate-700"}`}>
      {s}
    </span>
  );
};

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-amber-500",
  "bg-rose-500", "bg-indigo-500", "bg-cyan-500", "bg-teal-500",
];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name: string) => name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

const parseAppointmentDateTime = (date: string, time: string) => {
  if (!date) return null;
  const raw = (time || "").trim();

  if (/^\d{1,2}:\d{2}:\d{2}$/.test(raw)) {
    return new Date(`${date}T${raw}`);
  }

  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    return new Date(`${date}T${raw}:00`);
  }

  const m = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    let h = Number(m[1]);
    const mins = m[2];
    const period = m[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return new Date(`${date}T${String(h).padStart(2, "0")}:${mins}:00`);
  }

  return new Date(`${date}T00:00:00`);
};

export default function PatientsPage() {
  const { user, loading: authLoading } = useCustomAuth();
  const navigate = useNavigate();
  const { id: routePatientId } = useParams<{ id: string }>();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | PatientStatus>("All");

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(routePatientId ? Number(routePatientId) : null);
  const [selectedDetails, setSelectedDetails] = useState<PatientDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ full_name: "", email: "", phone: "", age: "", gender: "" });
  const [submitting, setSubmitting] = useState(false);

  const detailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/patients");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load patients");
      const normalized = Array.isArray(data) ? data : data.items || [];
      setPatients(normalized);

      if (!selectedPatientId && normalized.length > 0) {
        const firstId = normalized[0]?.id;
        if (firstId) setSelectedPatientId(Number(firstId));
      }
    } catch (err: any) {
      toast.error("Failed to load patients: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  const loadPatientDetails = useCallback(async (patientId: number) => {
    setLoadingDetails(true);
    try {
      const res = await apiFetch(`/api/patients/${patientId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load patient details");
      setSelectedDetails({
        ...data,
        medicines: Array.isArray(data?.medicines) ? data.medicines : [],
        lab_tests: Array.isArray(data?.lab_tests) ? data.lab_tests : [],
        procedures: Array.isArray(data?.procedures) ? data.procedures : [],
        appointments: Array.isArray(data?.appointments) ? data.appointments : [],
      });
    } catch (err: any) {
      toast.error("Failed to load patient details: " + err.message);
      setSelectedDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadPatients();
  }, [user, loadPatients]);

  useEffect(() => {
    if (routePatientId) {
      const numeric = Number(routePatientId);
      if (!Number.isNaN(numeric)) {
        setSelectedPatientId(numeric);
      }
    }
  }, [routePatientId]);

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDetails(selectedPatientId);
    }
  }, [selectedPatientId, loadPatientDetails]);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || "").includes(searchTerm) ||
      (p.patient_uid || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || (p.status || "Active") === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const appointmentBuckets = useMemo(() => {
    const appointments = selectedDetails?.appointments || [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const past: AppointmentItem[] = [];
    const present: AppointmentItem[] = [];
    const future: AppointmentItem[] = [];

    appointments.forEach((item) => {
      const dt = parseAppointmentDateTime(item.appointment_date, item.appointment_time);
      if (!dt) {
        past.push(item);
        return;
      }
      if (dt > endOfToday) {
        future.push(item);
      } else if (dt >= startOfToday) {
        present.push(item);
      } else {
        past.push(item);
      }
    });

    return { past, present, future };
  }, [selectedDetails]);

  const handleAddPatient = async () => {
    if (!newPatient.full_name.trim()) {
      toast.error("Patient name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: newPatient.full_name.trim(),
          email: newPatient.email.trim() || null,
          phone: newPatient.phone.trim() || null,
          age: newPatient.age ? parseInt(newPatient.age, 10) : null,
          gender: newPatient.gender || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add patient");

      toast.success("Patient added successfully");
      setAddDialogOpen(false);
      setNewPatient({ full_name: "", email: "", phone: "", age: "", gender: "" });
      await loadPatients();
      if (data?.patient?.id) {
        handleSelectPatient(Number(data.patient.id), true);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async (id: number | null) => {
    if (!id) return;
    if (!confirm("Are you sure you want to remove this patient?")) return;

    try {
      const res = await apiFetch(`/api/patients/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error || "Failed");
      }

      toast.success("Patient removed");
      if (selectedPatientId === id) {
        setSelectedPatientId(null);
        setSelectedDetails(null);
      }
      await loadPatients();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSelectPatient = (id: number, scrollToDetails = false) => {
    setSelectedPatientId(id);
    navigate(`/patients/${id}`);
    if (scrollToDetails) {
      requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <ConsoleShell pageTitle="Patient Management" pageSubtitle="Manage and monitor all patient records.">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Patient Management</h1>
            <p className="text-sm text-slate-500">Click any patient row to render complete details below on this same page.</p>
          </div>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] text-white border-0 hover:opacity-90 rounded-full shadow-md"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Patient
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-slate-50 border-slate-200"
              />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(["All", "Active", "Critical", "Recovering", "Discharged"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeFilter === f
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No patients found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Dashboard Access</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tab Settings</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((p) => {
                    const isSelected = p.id !== null && p.id === selectedPatientId;
                    return (
                      <tr
                        key={p.id ?? p.full_name}
                        className={`transition-colors cursor-pointer ${isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50/60"}`}
                        onClick={() => p.id && handleSelectPatient(p.id, true)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${avatarColor(p.full_name)}`}>
                              {getInitials(p.full_name)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 leading-tight">{p.full_name}</p>
                              <p className="text-xs text-slate-500 leading-tight">
                                {[p.patient_uid || null, p.age ? `${p.age}y` : null, p.gender].filter(Boolean).join(" · ")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{p.email || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{p.phone || "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{p.assigned_doctor || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={p.dashboard_access !== false}
                              onCheckedChange={(val) => {
                                setPatients((prev) =>
                                  prev.map((pt) => pt.id === p.id ? { ...pt, dashboard_access: val } : pt)
                                );
                              }}
                              className="data-[state=checked]:bg-green-500"
                            />
                            <span className="text-xs text-slate-500">{p.dashboard_access !== false ? "On" : "Off"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{statusBadge(p.status)}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" className="text-xs h-7 px-2"
                            onClick={() => p.id && handleSelectPatient(p.id, true)}>
                            <Settings className="h-3 w-3 mr-1" /> Configure Tabs
                          </Button>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                              onClick={() => p.id && handleSelectPatient(p.id, true)}
                              title="View patient"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                              onClick={() => handleDeletePatient(p.id)}
                              title="Remove patient"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div ref={detailsRef} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-5">
          {loadingDetails ? (
            <div className="text-center py-8 text-slate-500">Loading patient details...</div>
          ) : !selectedDetails ? (
            <div className="text-center py-8 text-slate-500">Select a patient row above to render full details here.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedDetails.full_name}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {[selectedDetails.patient_uid || null, selectedDetails.email || null, selectedDetails.phone || null].filter(Boolean).join(" | ") || "No contact details"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {[selectedDetails.gender || null, selectedDetails.age ? `${selectedDetails.age} years` : null, selectedDetails.date_of_birth || null].filter(Boolean).join(" | ") || "-"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Address: {selectedDetails.address || "-"}</p>
                </div>
                <div>{statusBadge(selectedDetails.status)}</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Past Appointments</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{appointmentBuckets.past.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Present Appointments</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{appointmentBuckets.present.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Future Appointments</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{appointmentBuckets.future.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Prescribed Medicines</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{selectedDetails.medicines.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Lab/Procedures</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{selectedDetails.lab_tests.length + selectedDetails.procedures.length}</p>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Appointments (Past, Present, Future)
                </h3>
                {selectedDetails.appointments.length === 0 ? (
                  <div className="text-sm text-slate-500">No appointment history found.</div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[860px] text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Time</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Bucket</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Doctor</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDetails.appointments.map((a) => {
                          const dt = parseAppointmentDateTime(a.appointment_date, a.appointment_time);
                          const now = new Date();
                          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                          const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                          const bucket = dt && dt > end ? "Future" : dt && dt >= start ? "Present" : "Past";
                          return (
                            <tr key={a.id}>
                              <td className="px-3 py-2">{a.appointment_date || "-"}</td>
                              <td className="px-3 py-2">{a.appointment_time || "-"}</td>
                              <td className="px-3 py-2"><span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">{bucket}</span></td>
                              <td className="px-3 py-2">{a.doctor_name || a.selected_doctor || "-"}</td>
                              <td className="px-3 py-2">{appointmentStatusBadge(a.status)}</td>
                              <td className="px-3 py-2 text-slate-600">{a.message || "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 flex items-center gap-2">
                    <Pill className="h-4 w-4" /> Prescribed Medicines
                  </h3>
                  {selectedDetails.medicines.length === 0 ? (
                    <div className="text-sm text-slate-500">No medicines prescribed.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedDetails.medicines.map((m) => (
                        <div key={m.id} className="rounded-xl border border-slate-200 p-3">
                          <p className="font-medium text-slate-900">{m.medicine_name || "Unnamed medicine"}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {[m.dosage, m.frequency, m.duration].filter(Boolean).join(" | ") || "No dosage details"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Instructions: {m.instructions || "-"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 flex items-center gap-2">
                    <Beaker className="h-4 w-4" /> Prescribed Lab Tests
                  </h3>
                  {selectedDetails.lab_tests.length === 0 ? (
                    <div className="text-sm text-slate-500">No lab tests prescribed.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedDetails.lab_tests.map((l) => (
                        <div key={l.id} className="rounded-xl border border-slate-200 p-3">
                          <p className="font-medium text-slate-900">{l.test_name || "Unnamed test"}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {[l.category, l.sample_type].filter(Boolean).join(" | ") || "No category details"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Preparation: {l.preparation_instructions || "-"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 flex items-center gap-2">
                  <Scissors className="h-4 w-4" /> Prescribed Procedures
                </h3>
                {selectedDetails.procedures.length === 0 ? (
                  <div className="text-sm text-slate-500">No procedures prescribed.</div>
                ) : (
                  <div className="space-y-2">
                    {selectedDetails.procedures.map((p) => (
                      <div key={p.id} className="rounded-xl border border-slate-200 p-3">
                        <p className="font-medium text-slate-900">{p.procedure_name || "Unnamed procedure"}</p>
                        <p className="text-xs text-slate-500 mt-1">{p.category || "General"}</p>
                        <p className="text-xs text-slate-500 mt-1">{p.description || "-"}</p>
                        <p className="text-xs text-slate-500 mt-1">Preparation: {p.preparation_instructions || "-"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" /> Add New Patient
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Full Name *</Label>
              <Input
                placeholder="Patient full name"
                value={newPatient.full_name}
                onChange={(e) => setNewPatient((p) => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="patient@email.com"
                value={newPatient.email}
                onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Phone</Label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={newPatient.phone}
                onChange={(e) => setNewPatient((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="Age"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient((p) => ({ ...p, age: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Gender</Label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient((p) => ({ ...p, gender: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPatient} disabled={submitting}>
              {submitting ? "Adding..." : "Add Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConsoleShell>
  );
}
