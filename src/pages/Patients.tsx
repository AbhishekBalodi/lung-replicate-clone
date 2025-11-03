import { useState, useEffect } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, User, Calendar, Pill } from "lucide-react";

type Patient = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  is_new_patient: boolean;
  first_visit_date: string;
  last_visit_date: string | null;
  notes: string | null;
};

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  message: string | null;
  created_at: string;
};

type PrescribedMedicine = {
  id: string;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  prescribed_date: string;
};

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all patients
  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setPatients(data || []);
    } catch (err: any) {
      toast.error("Failed to load patients: " + err.message);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Search/select patient
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a patient name");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .ilike("full_name", `%${searchTerm}%`)
        .single();

      if (error) throw error;
      
      if (data) {
        setSelectedPatient(data);
        await loadPatientData(data.id, data.full_name);
      }
    } catch (err: any) {
      if (err.code === 'PGRST116') {
        toast.error("Patient not found");
      } else {
        toast.error("Error searching patient: " + err.message);
      }
      setSelectedPatient(null);
      setAppointments([]);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // Load patient appointments and medicines
  const loadPatientData = async (patientId: string, fullName: string) => {
    try {
      // Load appointments
      const { data: apptData, error: apptError } = await supabase
        .from("appointments")
        .select("*")
        .eq("full_name", fullName)
        .order("appointment_date", { ascending: false });

      if (apptError) throw apptError;
      setAppointments(apptData || []);

      // Load prescribed medicines
      const { data: medData, error: medError } = await supabase
        .from("prescribed_medicines")
        .select("*")
        .eq("patient_id", patientId)
        .order("prescribed_date", { ascending: false });

      if (medError) throw medError;
      setMedicines(medData || []);
    } catch (err: any) {
      toast.error("Error loading patient data: " + err.message);
    }
  };

  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.full_name);
    await loadPatientData(patient.id, patient.full_name);
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Header & Search */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-emerald-900">Patient Management</h1>
        </div>

        {/* Search Bar */}
        <Card className="p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search patient by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="bg-emerald-700 hover:bg-emerald-800">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Patient List */}
        {!selectedPatient && patients.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-4 text-emerald-900">All Patients</h3>
            <div className="divide-y">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => selectPatient(patient)}
                  className="w-full text-left py-3 px-2 hover:bg-emerald-50 rounded transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-emerald-700" />
                      <div>
                        <div className="font-medium text-emerald-900">{patient.full_name}</div>
                        <div className="text-sm text-emerald-700">
                          {patient.phone} • {patient.email}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        patient.is_new_patient
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {patient.is_new_patient ? "New Patient" : "Regular Patient"}
                    </span>
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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-emerald-900">Patient Information</h3>
                <span
                  className={`text-sm px-3 py-1 rounded ${
                    selectedPatient.is_new_patient
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedPatient.is_new_patient ? "New Patient" : "Regular Patient"}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-emerald-900">Full Name</Label>
                  <p className="text-lg font-medium">{selectedPatient.full_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-emerald-900">Phone</Label>
                    <p>{selectedPatient.phone || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-900">Email</Label>
                    <p className="text-sm">{selectedPatient.email || "N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-emerald-900">First Visit</Label>
                    <p>{format(new Date(selectedPatient.first_visit_date), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <Label className="text-emerald-900">Last Visit</Label>
                    <p>
                      {selectedPatient.last_visit_date
                        ? format(new Date(selectedPatient.last_visit_date), "MMM dd, yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                {selectedPatient.notes && (
                  <div>
                    <Label className="text-emerald-900">Notes</Label>
                    <p className="text-sm">{selectedPatient.notes}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  setSelectedPatient(null);
                  setSearchTerm("");
                  setAppointments([]);
                  setMedicines([]);
                }}
                variant="outline"
                className="w-full mt-4"
              >
                Clear Selection
              </Button>
            </Card>

            {/* Appointments History */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-emerald-700" />
                <h3 className="text-xl font-semibold text-emerald-900">Appointments</h3>
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
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="h-5 w-5 text-emerald-700" />
                <h3 className="text-xl font-semibold text-emerald-900">Prescribed Medicines</h3>
              </div>

              <div className="overflow-x-auto">
                {medicines.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-emerald-100">
                        <th className="text-left py-2 px-3 text-emerald-900">Medicine</th>
                        <th className="text-left py-2 px-3 text-emerald-900">Dosage</th>
                        <th className="text-left py-2 px-3 text-emerald-900">Frequency</th>
                        <th className="text-left py-2 px-3 text-emerald-900">Duration</th>
                        <th className="text-left py-2 px-3 text-emerald-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((med) => (
                        <tr key={med.id} className="border-b border-emerald-50">
                          <td className="py-2 px-3 font-medium">{med.medicine_name}</td>
                          <td className="py-2 px-3">{med.dosage || "N/A"}</td>
                          <td className="py-2 px-3">{med.frequency || "N/A"}</td>
                          <td className="py-2 px-3">{med.duration || "N/A"}</td>
                          <td className="py-2 px-3">
                            {format(new Date(med.prescribed_date), "MMM dd, yyyy")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-emerald-700 text-center py-4">No medicines prescribed yet</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </ConsoleShell>
  );
}
