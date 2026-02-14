import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, User, Calendar, Pill, FlaskConical, Activity } from "lucide-react";

type Patient = {
  id: number | null;
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

const API_ROOT =
  (import.meta as any)?.env?.VITE_API_URL
    ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, "")}/api`
    : "/api";

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
      const res = await fetch(`${API_ROOT}/patients`);
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
      const res = await fetch(`${API_ROOT}/patients?q=${encodeURIComponent(q)}`);
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
      let appointmentsUrl = `${API_ROOT}/appointment?`;

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

      const apptRes = await fetch(appointmentsUrl);
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
      const res = await fetch(`${API_ROOT}/patients/${patient.id}`);
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
      <div className="space-y-4 md:space-y-6">
        {/* Header & Search */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-emerald-900">Patient Management</h1>
        </div>

        {/* Search Bar */}
        <Card className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search patient by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800 w-full sm:w-auto"
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="sm:inline">Search</span>
            </Button>
          </div>
        </Card>

        {/* Patient List (when none selected) */}
        {!selectedPatient && patients.length > 0 && (
          <Card className="p-3 md:p-4">
            <h3 className="font-semibold mb-4 text-emerald-900 text-lg md:text-xl">All Patients</h3>
            <div className="divide-y">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/patients/${p.id}`)}
                  className="w-full text-left py-3 px-2 hover:bg-emerald-50 rounded transition-colors"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-emerald-700 shrink-0" />
                      <div>
                        <div className="font-medium text-emerald-900">{p.full_name}</div>
                        <div className="text-sm text-emerald-700 break-all">
                          {p.phone || "N/A"} • {p.email || "N/A"}
                        </div>
                      </div>
                    </div>
                    {!p.id && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 self-start sm:self-center">
                        From Appointment
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Patient Details */}
        {selectedPatient && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Info */}
            <Card className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h3 className="text-lg md:text-xl font-semibold text-emerald-900">Patient Information</h3>
                {!selectedPatient.id && (
                  <span className="text-xs sm:text-sm px-3 py-1 rounded bg-yellow-100 text-yellow-800 self-start sm:self-center">
                    From Appointment
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-emerald-900">Full Name</Label>
                  <p className="text-base md:text-lg font-medium break-words">{selectedPatient.full_name}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-emerald-900">Phone</Label>
                    <p className="break-all">{selectedPatient.phone || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-900">Email</Label>
                    <p className="text-sm break-all">{selectedPatient.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedPatient(null);
                  setSearchTerm("");
                  setAppointments([]);
                  setMedicines([]);
                  setLabTests([]);
                }}
                variant="outline"
                className="w-full mt-4"
              >
                Clear Selection
              </Button>
            </Card>

            {/* Appointments History */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-emerald-700" />
                <h3 className="text-lg md:text-xl font-semibold text-emerald-900">Appointments</h3>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {appointments.length > 0 ? (
                  appointments.map((appt) => (
                    <div key={appt.id} className="border border-emerald-100 rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-emerald-900">
                            {format(new Date(appt.appointment_date), "EEEE, MMM dd, yyyy")}
                          </div>
                          <div className="text-sm text-emerald-700">{appt.appointment_time}</div>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                          {new Date(appt.appointment_date) > new Date() ? "Upcoming" : "Past"}
                        </span>
                      </div>
                      {appt.message && (
                        <p className="text-sm text-gray-600 mt-2">{appt.message}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-emerald-700 text-center py-4">No appointments found</p>
                )}
              </div>
            </Card>

            {/* Prescribed Medicines */}
            <Card className="p-4 md:p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="h-5 w-5 text-emerald-700" />
                <h3 className="text-lg md:text-xl font-semibold text-emerald-900">Prescribed Medicines</h3>
              </div>

              {medicines.length > 0 ? (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-emerald-100">
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Medicine</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Dosage</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Frequency</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Duration</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Date</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicines.map((m) => (
                          <tr key={m.id} className="border-b border-emerald-50">
                            <td className="py-2 px-3 font-medium text-sm">{m.medicine_name}</td>
                            <td className="py-2 px-3 text-sm">{m.dosage || "N/A"}</td>
                            <td className="py-2 px-3 text-sm">{m.frequency || "N/A"}</td>
                            <td className="py-2 px-3 text-sm">{m.duration || "N/A"}</td>
                            <td className="py-2 px-3 text-sm">
                              {m.prescribed_date
                                ? format(new Date(m.prescribed_date), "MMM dd, yyyy")
                                : m.created_at
                                  ? format(new Date(m.created_at), "MMM dd, yyyy")
                                  : "-"}
                            </td>
                            <td className="py-2 px-3 text-sm">{m.instructions || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card view */}
                  <div className="md:hidden space-y-3">
                    {medicines.map((m) => (
                      <div key={m.id} className="p-3 bg-emerald-50 rounded-lg">
                        <div className="font-medium text-emerald-900 mb-2">{m.medicine_name}</div>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-emerald-700">Dosage:</span> {m.dosage || "N/A"}</div>
                          <div><span className="text-emerald-700">Frequency:</span> {m.frequency || "N/A"}</div>
                          <div><span className="text-emerald-700">Duration:</span> {m.duration || "N/A"}</div>
                          <div><span className="text-emerald-700">Date:</span> {
                            m.prescribed_date
                              ? format(new Date(m.prescribed_date), "MMM dd, yyyy")
                              : m.created_at
                                ? format(new Date(m.created_at), "MMM dd, yyyy")
                                : "-"
                          }</div>
                          {m.instructions && (
                            <div><span className="text-emerald-700">Instructions:</span> {m.instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-emerald-700 text-center py-4">No medicines prescribed yet</p>
              )}
            </Card>

            {/* Prescribed Lab Tests */}
            <Card className="p-4 md:p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="h-5 w-5 text-emerald-700" />
                <h3 className="text-lg md:text-xl font-semibold text-emerald-900">Prescribed Lab Tests</h3>
              </div>

              {labTests.length > 0 ? (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-emerald-100">
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Test Name</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Category</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Sample Type</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Date</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labTests.map((test) => (
                          <tr key={test.id} className="border-b border-emerald-50">
                            <td className="py-2 px-3 font-medium text-sm">{test.test_name}</td>
                            <td className="py-2 px-3 text-sm">{test.category || "N/A"}</td>
                            <td className="py-2 px-3 text-sm">{test.sample_type || "N/A"}</td>
                            <td className="py-2 px-3 text-sm">
                              {test.prescribed_date
                                ? format(new Date(test.prescribed_date), "MMM dd, yyyy")
                                : test.created_at
                                  ? format(new Date(test.created_at), "MMM dd, yyyy")
                                  : "-"}
                            </td>
                            <td className="py-2 px-3 text-sm">{test.preparation_instructions || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card view */}
                  <div className="md:hidden space-y-3">
                    {labTests.map((test) => (
                      <div key={test.id} className="p-3 bg-emerald-50 rounded-lg">
                        <div className="font-medium text-emerald-900 mb-2">{test.test_name}</div>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-emerald-700">Category:</span> {test.category || "N/A"}</div>
                          <div><span className="text-emerald-700">Sample:</span> {test.sample_type || "N/A"}</div>
                          <div><span className="text-emerald-700">Date:</span> {
                            test.prescribed_date
                              ? format(new Date(test.prescribed_date), "MMM dd, yyyy")
                              : test.created_at
                                ? format(new Date(test.created_at), "MMM dd, yyyy")
                                : "-"
                          }</div>
                          {test.preparation_instructions && (
                            <div><span className="text-emerald-700">Instructions:</span> {test.preparation_instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-emerald-700 text-center py-4">No lab tests prescribed yet</p>
              )}
            </Card>

            {/* Prescribed Procedures */}
            <Card className="p-4 md:p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-emerald-700" />
                <h3 className="text-lg md:text-xl font-semibold text-emerald-900">Prescribed Procedures</h3>
              </div>

              {procedures.length > 0 ? (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-emerald-100">
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Procedure Name</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Category</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Description</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Date</th>
                          <th className="text-left py-2 px-3 text-emerald-900 text-sm">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {procedures.map((proc) => (
                          <tr key={proc.id} className="border-b border-emerald-50">
                            <td className="py-2 px-3 font-medium text-sm">{proc.procedure_name}</td>
                            <td className="py-2 px-3 text-sm">{proc.category || "N/A"}</td>
                            <td className="py-2 px-3 text-sm">{proc.description || "N/A"}</td>
                            <td className="py-2 px-3 text-sm">
                              {proc.prescribed_date
                                ? format(new Date(proc.prescribed_date), "MMM dd, yyyy")
                                : proc.created_at
                                  ? format(new Date(proc.created_at), "MMM dd, yyyy")
                                  : "-"}
                            </td>
                            <td className="py-2 px-3 text-sm">{proc.preparation_instructions || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card view */}
                  <div className="md:hidden space-y-3">
                    {procedures.map((proc) => (
                      <div key={proc.id} className="p-3 bg-emerald-50 rounded-lg">
                        <div className="font-medium text-emerald-900 mb-2">{proc.procedure_name}</div>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-emerald-700">Category:</span> {proc.category || "N/A"}</div>
                          <div><span className="text-emerald-700">Description:</span> {proc.description || "N/A"}</div>
                          <div><span className="text-emerald-700">Date:</span> {
                            proc.prescribed_date
                              ? format(new Date(proc.prescribed_date), "MMM dd, yyyy")
                              : proc.created_at
                                ? format(new Date(proc.created_at), "MMM dd, yyyy")
                                : "-"
                          }</div>
                          {proc.preparation_instructions && (
                            <div><span className="text-emerald-700">Instructions:</span> {proc.preparation_instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-emerald-700 text-center py-4">No procedures prescribed yet</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </ConsoleShell>
  );
}
