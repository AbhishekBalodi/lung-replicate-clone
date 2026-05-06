import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, User, Calendar, Pill, FlaskConical, Activity } from "lucide-react";

type Patient = {
  id: number | null;
  patient_uid?: string;
  full_name: string;
  phone: string | null;
  email: string | null;
};

type Appointment = {
  id: string | number;
  appointment_date: string;
  appointment_time: string;
  message: string | null;
  created_at?: string | null;
};

type BackendMedicine = {
  id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  prescribed_date?: string | null; // ← MySQL column you have
  created_at?: string | null;      // fallback if you add it later
};

type LabTest = {
  id: number;
  test_name: string;
  category: string | null;
  sample_type: string | null;
  preparation_instructions: string | null;
  prescribed_date?: string | null;
  created_at?: string | null;
};

type Procedure = {
  id: number;
  procedure_name: string;
  category: string | null;
  description: string | null;
  preparation_instructions: string | null;
  prescribed_date?: string | null;
  created_at?: string | null;
};

import { apiFetch } from "@/lib/api";

export default function PatientsPage() {
  const { user, loading: authLoading } = useCustomAuth();
  const navigate = useNavigate();
  const { id: patientIdParam } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<BackendMedicine[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  /** Load all patients (server merges patients + appointments and upserts) */
  const loadPatients = async () => {
    try {
      const res = await apiFetch("/api/patients");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load patients");
      setPatients(Array.isArray(data) ? data : data.items || []);
      return Array.isArray(data) ? data : data.items || [];
    } catch (err: any) {
      toast.error("Failed to load patients: " + err.message);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      const allPatients = await loadPatients();
      // If URL has patient ID, load that patient directly
      if (patientIdParam) {
        const patient = allPatients.find((p: Patient) => String(p.id) === patientIdParam);
        if (patient) {
          selectPatient(patient);
        }
      }
    };
    init();
  }, [patientIdParam]);

  // Listen for prescription events from sidebar components to refresh data
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (selectedPatient && detail?.patientId === selectedPatient.id) {
        selectPatient(selectedPatient);
      }
    };
    window.addEventListener("medicine-prescribed", handler);
    window.addEventListener("lab-test-prescribed", handler);
    window.addEventListener("procedure-prescribed", handler);
    return () => {
      window.removeEventListener("medicine-prescribed", handler);
      window.removeEventListener("lab-test-prescribed", handler);
      window.removeEventListener("procedure-prescribed", handler);
    };
  }, [selectedPatient]);

  /** Search using ?q= so matches from appointments are included */
  const handleSearch = async () => {
    const q = searchTerm.trim();
    if (!q) {
      toast.error("Please enter a patient name, email, or phone");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(`/api/patients?q=${encodeURIComponent(q)}`);
      const data: Patient[] = res.ok ? await res.json() : [];
      if (!data.length) {
        toast.error("Patient not found");
        setSelectedPatient(null);
        setAppointments([]);
        setMedicines([]);
        setLabTests([]);
        setProcedures([]);
        return;
      }
      await selectPatient(data[0]);
    } catch (err: any) {
      toast.error("Error searching patient: " + err.message);
      setSelectedPatient(null);
      setAppointments([]);
      setMedicines([]);
      setLabTests([]);
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  /** Load details for a specific patient */
  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.full_name);

    // 1) Appointments (from MySQL backend)
    try {
      let appointmentsUrl = `/api/appointment?`;

      // Try email first if available
      if (patient.email) {
        appointmentsUrl += `email=${encodeURIComponent(patient.email)}`;
      }
      // Fallback to phone if no email
      else if (patient.phone) {
        appointmentsUrl += `phone=${encodeURIComponent(patient.phone)}`;
      }
      // Last resort: search by name
      else {
        appointmentsUrl += `q=${encodeURIComponent(patient.full_name)}`;
      }

      const apptRes = await apiFetch(appointmentsUrl);
      if (!apptRes.ok) throw new Error("Failed to fetch appointments");

      const apptData = await apptRes.json();
      setAppointments(Array.isArray(apptData) ? apptData : []);
    } catch (err: any) {
      toast.error("Error loading appointments: " + err.message);
      setAppointments([]);
    }

    // 2) Medicines (Express/MySQL)
    try {
      if (!patient.id) {
        // If patient exists only via appointments union and doesn’t have an id yet,
        // there won’t be medicines tied to a numeric patient_id.
        setMedicines([]);
        return;
      }
      const res = await apiFetch(`/api/patients/${patient.id}`);
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Failed to load patient details");
      setMedicines(js.medicines || []);
      setLabTests(js.lab_tests || []);
      setProcedures(js.procedures || []);
    } catch (err: any) {
      toast.error("Error loading prescriptions: " + err.message);
      setMedicines([]);
      setLabTests([]);
      setProcedures([]);
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">Manage Patient</h1>
            <p className="text-sm text-slate-500">Control patient access and review medical records.</p>
          </div>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search patient by name, email, or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-11 border-slate-200 pl-9"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="h-11 bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {!selectedPatient && (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-900">Patient Directory</CardTitle>
              <CardDescription>{patients.length} patients available</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {patients.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[860px]">
                    <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <div className="col-span-3">Patient</div>
                      <div className="col-span-3">Email</div>
                      <div className="col-span-2">Phone</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>
                    <div className="divide-y">
                      {patients.map((p) => (
                        <div key={p.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-700">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{p.full_name}</p>
                              {p.patient_uid && <p className="text-xs font-mono text-slate-500">{p.patient_uid}</p>}
                            </div>
                          </div>
                          <div className="col-span-3 text-sm text-slate-600">{p.email || "-"}</div>
                          <div className="col-span-2 text-sm text-slate-600">{p.phone || "-"}</div>
                          <div className="col-span-2">
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                              Active
                            </span>
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/patients/${p.id}`)}>
                              Configure
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500">No patients found</div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedPatient && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Patient Profile</CardTitle>
                <CardDescription>Basic account and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPatient.patient_uid && (
                  <div>
                    <Label className="text-slate-500">Patient UID</Label>
                    <p className="font-mono text-sm text-slate-900">{selectedPatient.patient_uid}</p>
                  </div>
                )}
                <div>
                  <Label className="text-slate-500">Full Name</Label>
                  <p className="text-base font-semibold text-slate-900">{selectedPatient.full_name}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Phone</Label>
                  <p className="text-sm text-slate-700">{selectedPatient.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Email</Label>
                  <p className="text-sm text-slate-700">{selectedPatient.email || "N/A"}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedPatient(null);
                    setSearchTerm("");
                    setAppointments([]);
                    setMedicines([]);
                    setLabTests([]);
                    setProcedures([]);
                  }}
                >
                  Back to Patient List
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Appointments
                </CardTitle>
                <CardDescription>{appointments.length} appointment records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {appointments.length > 0 ? (
                    appointments.map((appt) => (
                      <div key={appt.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-900">
                              {format(new Date(appt.appointment_date), "EEE, MMM dd, yyyy")}
                            </p>
                            <p className="text-sm text-slate-600">{appt.appointment_time}</p>
                          </div>
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                            {new Date(appt.appointment_date) > new Date() ? "Upcoming" : "Past"}
                          </span>
                        </div>
                        {appt.message && <p className="mt-2 text-sm text-slate-600">{appt.message}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-center text-slate-500">No appointments found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Pill className="h-5 w-5 text-blue-600" />
                  Medicines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-slate-500">
                          <th className="py-2">Medicine</th>
                          <th className="py-2">Dosage</th>
                          <th className="py-2">Frequency</th>
                          <th className="py-2">Duration</th>
                          <th className="py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((m) => (
                          <tr key={m.id} className="border-b border-slate-50 text-slate-700">
                            <td className="py-2 font-medium">{m.medicine_name}</td>
                            <td className="py-2">{m.dosage || "-"}</td>
                            <td className="py-2">{m.frequency || "-"}</td>
                            <td className="py-2">{m.duration || "-"}</td>
                            <td className="py-2">
                              {m.prescribed_date
                                ? format(new Date(m.prescribed_date), "MMM dd, yyyy")
                                : m.created_at
                                  ? format(new Date(m.created_at), "MMM dd, yyyy")
                                  : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-6 text-center text-slate-500">No medicines prescribed yet</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <FlaskConical className="h-5 w-5 text-blue-600" />
                  Lab Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {labTests.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {labTests.map((test) => (
                      <div key={test.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-slate-900">{test.test_name}</p>
                        <p className="text-sm text-slate-600">Category: {test.category || "N/A"}</p>
                        <p className="text-sm text-slate-600">Sample: {test.sample_type || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-slate-500">No lab tests prescribed yet</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Procedures
                </CardTitle>
              </CardHeader>
              <CardContent>
                {procedures.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {procedures.map((proc) => (
                      <div key={proc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-slate-900">{proc.procedure_name}</p>
                        <p className="text-sm text-slate-600">Category: {proc.category || "N/A"}</p>
                        <p className="text-sm text-slate-600">{proc.description || "No description"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-slate-500">No procedures prescribed yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ConsoleShell>
  );
}
