import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Pill, FlaskConical, Stethoscope, User } from "lucide-react";

type Patient = {
  id: number;
  full_name: string;
  phone: string | null;
  email: string | null;
  is_new_patient?: boolean;
};

type MedicineCatalog = {
  id: number;
  name: string;
  form: string | null;
  strength: string | null;
  default_frequency: string | null;
  duration: string | null;
  route: string | null;
};

type LabCatalog = {
  id: number;
  name: string;
  category: string | null;
  sample_type: string | null;
  preparation_instructions: string | null;
  turnaround_time: string | null;
};

type ProcedureCatalog = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  duration: string | null;
  preparation_instructions: string | null;
};

import { apiFetch } from "@/lib/api";

export default function Consultation() {
  const { user, loading: authLoading } = useCustomAuth();
  const navigate = useNavigate();

  // Patient states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Catalogs
  const [medicinesCatalog, setMedicinesCatalog] = useState<MedicineCatalog[]>([]);
  const [labCatalog, setLabCatalog] = useState<LabCatalog[]>([]);
  const [proceduresCatalog, setProceduresCatalog] = useState<ProcedureCatalog[]>([]);

  // Medicine prescription form
  const [medicinePrescription, setMedicinePrescription] = useState({
    medicine_id: "",
    medicine_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  });

  // Lab test prescription form
  const [labPrescription, setLabPrescription] = useState({
    test_name: "",
    category: "",
    sample_type: "",
    preparation_instructions: "",
    lab_catalogue_id: ""
  });

  // Procedure prescription form
  const [procedurePrescription, setProcedurePrescription] = useState({
    procedure_name: "",
    category: "",
    description: "",
    preparation_instructions: "",
    procedure_catalogue_id: ""
  });

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      loadPatients();
      loadMedicinesCatalog();
      loadLabCatalog();
      loadProceduresCatalog();
    }
  }, [user]);

  // Load all patients
  const loadPatients = async () => {
    try {
      const res = await apiFetch("/api/patients");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load patients");
      setPatients(Array.isArray(data) ? data : data.items || []);
    } catch (err: any) {
      toast.error("Failed to load patients: " + err.message);
    }
  };

  // Load catalogs
  const loadMedicinesCatalog = async () => {
    try {
      const res = await apiFetch("/api/medicines/catalog");
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Failed to load catalog");
      setMedicinesCatalog(js.items || []);
    } catch (err: any) {
      toast.error("Failed to load medicines catalog: " + err.message);
    }
  };

  const loadLabCatalog = async () => {
    try {
      const res = await apiFetch("/api/lab-tests/catalog");
      const data = await res.json();
      setLabCatalog(data);
    } catch (e: any) {
      toast.error("Failed to load lab catalog: " + e.message);
    }
  };

  const loadProceduresCatalog = async () => {
    try {
      const res = await apiFetch("/api/procedures/catalog");
      if (!res.ok) throw new Error("Failed to load procedures");
      const data = await res.json();
      setProceduresCatalog(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Error loading procedures: " + err.message);
    }
  };

  // Search patients
  const handleSearchPatient = async () => {
    if (!searchTerm.trim()) {
      loadPatients();
      return;
    }
    try {
      const res = await apiFetch(`/api/patients?q=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Search failed");
      const list: Patient[] = Array.isArray(data) ? data : data.items || [];
      setPatients(list);
      if (!list.length) {
        toast.info("No patients found");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  // Select patient
  const selectPatient = (p: Patient) => {
    setSelectedPatient(p);
    // Reset all prescription forms
    setMedicinePrescription({ medicine_id: "", medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" });
    setLabPrescription({ test_name: "", category: "", sample_type: "", preparation_instructions: "", lab_catalogue_id: "" });
    setProcedurePrescription({ procedure_name: "", category: "", description: "", preparation_instructions: "", procedure_catalogue_id: "" });
  };

  // Medicine catalog selection
  const handleMedicineSelect = (medicineId: string) => {
    const medicine = medicinesCatalog.find(m => String(m.id) === medicineId);
    if (medicine) {
      setMedicinePrescription({
        medicine_id: String(medicine.id),
        medicine_name: medicine.name,
        dosage: medicine.strength || "",
        frequency: medicine.default_frequency || "",
        duration: medicine.duration || "",
        instructions: medicine.route ? `Route: ${medicine.route}` : ""
      });
    }
  };

  // Lab test catalog selection
  const handleLabTestSelect = (testId: string) => {
    if (!testId) {
      setLabPrescription({ test_name: "", category: "", sample_type: "", preparation_instructions: "", lab_catalogue_id: "" });
      return;
    }
    const selectedTest = labCatalog.find((test) => test.id === parseInt(testId));
    if (selectedTest) {
      setLabPrescription({
        test_name: selectedTest.name,
        category: selectedTest.category || "",
        sample_type: selectedTest.sample_type || "",
        preparation_instructions: selectedTest.preparation_instructions || "",
        lab_catalogue_id: testId
      });
    }
  };

  // Procedure catalog selection
  const handleProcedureSelect = (procId: string) => {
    if (!procId) {
      setProcedurePrescription({ procedure_name: "", category: "", description: "", preparation_instructions: "", procedure_catalogue_id: "" });
      return;
    }
    const proc = proceduresCatalog.find((p) => p.id === parseInt(procId));
    if (proc) {
      setProcedurePrescription({
        procedure_name: proc.name,
        category: proc.category || "",
        description: proc.description || "",
        preparation_instructions: proc.preparation_instructions || "",
        procedure_catalogue_id: procId
      });
    }
  };

  // Prescribe medicine
  const handlePrescribeMedicine = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    if (!medicinePrescription.medicine_name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    try {
      const res = await apiFetch("/api/medicines", {
        method: "POST",
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          full_name: selectedPatient.full_name,
          email: selectedPatient.email,
          phone: selectedPatient.phone,
          medicine_name: medicinePrescription.medicine_name,
          dosage: medicinePrescription.dosage,
          frequency: medicinePrescription.frequency,
          duration: medicinePrescription.duration,
          instructions: medicinePrescription.instructions
        })
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Failed to prescribe");
      toast.success("Medicine prescribed successfully");
      setMedicinePrescription({ medicine_id: "", medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" });
    } catch (err: any) {
      toast.error("Error prescribing medicine: " + err.message);
    }
  };

  // Prescribe lab test
  const handlePrescribeLabTest = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    if (!labPrescription.test_name.trim()) {
      toast.error("Test name is required");
      return;
    }
    try {
      const payload = {
        patient_id: selectedPatient.id,
        ...labPrescription,
        lab_catalogue_id: labPrescription.lab_catalogue_id || null
      };
      const res = await apiFetch("/api/lab-tests", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to prescribe test");
      toast.success("Lab test prescribed successfully!");
      setLabPrescription({ test_name: "", category: "", sample_type: "", preparation_instructions: "", lab_catalogue_id: "" });
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  // Prescribe procedure
  const handlePrescribeProcedure = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    if (!procedurePrescription.procedure_name.trim()) {
      toast.error("Procedure name is required");
      return;
    }
    try {
      const payload = {
        patient_id: selectedPatient.id,
        procedure_catalogue_id: procedurePrescription.procedure_catalogue_id ? parseInt(procedurePrescription.procedure_catalogue_id) : null,
        procedure_name: procedurePrescription.procedure_name.trim(),
        category: procedurePrescription.category.trim() || null,
        description: procedurePrescription.description.trim() || null,
        preparation_instructions: procedurePrescription.preparation_instructions.trim() || null
      };
      const res = await apiFetch("/api/procedures", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const js = await res.json();
        throw new Error(js?.error || "Failed to prescribe procedure");
      }
      toast.success("Procedure prescribed successfully");
      setProcedurePrescription({ procedure_name: "", category: "", description: "", preparation_instructions: "", procedure_catalogue_id: "" });
    } catch (err: any) {
      toast.error("Error prescribing procedure: " + err.message);
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-emerald-900 mb-1">Consultation</h1>
          <p className="text-sm text-emerald-700">Select a patient and prescribe medicines, lab tests, and procedures</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patients List */}
          <Card className="p-4 md:p-6 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-emerald-700" />
              <h3 className="text-lg font-semibold text-emerald-900">Patients</h3>
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search patient by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
                className="bg-white"
              />
              <Button onClick={handleSearchPatient} className="bg-emerald-700 hover:bg-emerald-800 shrink-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => selectPatient(patient)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? "bg-emerald-100 border-2 border-emerald-500"
                      : "bg-emerald-50 hover:bg-emerald-100 border border-emerald-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-emerald-900">{patient.full_name}</div>
                      <div className="text-sm text-emerald-700">
                        {patient.phone || "No phone"}
                      </div>
                      <div className="text-sm text-emerald-600">
                        {patient.email || "No email"}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${patient.is_new_patient ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                      {patient.is_new_patient ? "New" : "Regular"}
                    </span>
                  </div>
                </div>
              ))}
              {patients.length === 0 && (
                <p className="text-center text-emerald-700 py-4">No patients found</p>
              )}
            </div>
          </Card>

          {/* Prescription Forms */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPatient ? (
              <>
                {/* Selected Patient Info */}
                <Card className="p-4 bg-emerald-50 border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-700">Selected Patient:</p>
                      <p className="font-semibold text-emerald-900 text-lg">{selectedPatient.full_name}</p>
                      <p className="text-sm text-emerald-700">{selectedPatient.phone} • {selectedPatient.email}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                      Clear Selection
                    </Button>
                  </div>
                </Card>

                {/* Prescribe Medicine */}
                <Card className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Pill className="h-5 w-5 text-emerald-700" />
                    <h3 className="text-lg font-semibold text-emerald-900">Prescribe Medicine</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Select from Catalog (Optional)</Label>
                      <Select onValueChange={handleMedicineSelect}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Choose medicine from catalog" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicinesCatalog.map((med) => (
                            <SelectItem key={med.id} value={String(med.id)}>
                              {med.name} {med.strength ? `- ${med.strength}` : ""} {med.form ? `(${med.form})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Medicine Name *</Label>
                      <Input
                        placeholder="Enter medicine name"
                        value={medicinePrescription.medicine_name}
                        onChange={(e) => setMedicinePrescription({ ...medicinePrescription, medicine_name: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Dosage</Label>
                        <Input
                          placeholder="e.g., 500mg"
                          value={medicinePrescription.dosage}
                          onChange={(e) => setMedicinePrescription({ ...medicinePrescription, dosage: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label>Frequency</Label>
                        <Input
                          placeholder="e.g., Twice daily"
                          value={medicinePrescription.frequency}
                          onChange={(e) => setMedicinePrescription({ ...medicinePrescription, frequency: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., 7 days"
                        value={medicinePrescription.duration}
                        onChange={(e) => setMedicinePrescription({ ...medicinePrescription, duration: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Label>Instructions</Label>
                      <Textarea
                        placeholder="Additional instructions..."
                        value={medicinePrescription.instructions}
                        onChange={(e) => setMedicinePrescription({ ...medicinePrescription, instructions: e.target.value })}
                        className="bg-white min-h-[60px]"
                      />
                    </div>

                    <Button onClick={handlePrescribeMedicine} className="w-full bg-emerald-700 hover:bg-emerald-800">
                      <Pill className="h-4 w-4 mr-2" />
                      Prescribe Medicine
                    </Button>
                  </div>
                </Card>

                {/* Prescribe Lab Test */}
                <Card className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="h-5 w-5 text-emerald-700" />
                    <h3 className="text-lg font-semibold text-emerald-900">Prescribe Lab Test</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Select from Catalog (Optional)</Label>
                      <select
                        className="w-full border border-border rounded-md p-2 bg-white text-foreground"
                        value={labPrescription.lab_catalogue_id}
                        onChange={(e) => handleLabTestSelect(e.target.value)}
                      >
                        <option value="">-- Select Lab Test --</option>
                        {labCatalog.map((test) => (
                          <option key={test.id} value={test.id}>
                            {test.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Test Name *</Label>
                      <Input
                        placeholder="Enter test name"
                        value={labPrescription.test_name}
                        onChange={(e) => setLabPrescription({ ...labPrescription, test_name: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Category</Label>
                        <Input
                          placeholder="e.g., Hematology"
                          value={labPrescription.category}
                          onChange={(e) => setLabPrescription({ ...labPrescription, category: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label>Sample Type</Label>
                        <Input
                          placeholder="e.g., Blood"
                          value={labPrescription.sample_type}
                          onChange={(e) => setLabPrescription({ ...labPrescription, sample_type: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Preparation Instructions</Label>
                      <Textarea
                        placeholder="e.g., Fasting required for 8-12 hours"
                        value={labPrescription.preparation_instructions}
                        onChange={(e) => setLabPrescription({ ...labPrescription, preparation_instructions: e.target.value })}
                        className="bg-white min-h-[60px]"
                      />
                    </div>

                    <Button onClick={handlePrescribeLabTest} className="w-full bg-emerald-700 hover:bg-emerald-800">
                      <FlaskConical className="h-4 w-4 mr-2" />
                      Prescribe Lab Test
                    </Button>
                  </div>
                </Card>

                {/* Prescribe Procedure */}
                <Card className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="h-5 w-5 text-emerald-700" />
                    <h3 className="text-lg font-semibold text-emerald-900">Prescribe Procedure</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Select from Catalog (Optional)</Label>
                      <select
                        className="w-full border border-border rounded-md p-2 bg-white text-foreground"
                        value={procedurePrescription.procedure_catalogue_id}
                        onChange={(e) => handleProcedureSelect(e.target.value)}
                      >
                        <option value="">-- Select Procedure --</option>
                        {proceduresCatalog.map((proc) => (
                          <option key={proc.id} value={proc.id}>
                            {proc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Procedure Name *</Label>
                      <Input
                        placeholder="Enter procedure name"
                        value={procedurePrescription.procedure_name}
                        onChange={(e) => setProcedurePrescription({ ...procedurePrescription, procedure_name: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Label>Category</Label>
                      <Input
                        placeholder="e.g., Diagnostic"
                        value={procedurePrescription.category}
                        onChange={(e) => setProcedurePrescription({ ...procedurePrescription, category: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Brief description"
                        value={procedurePrescription.description}
                        onChange={(e) => setProcedurePrescription({ ...procedurePrescription, description: e.target.value })}
                        className="bg-white min-h-[60px]"
                      />
                    </div>

                    <div>
                      <Label>Preparation Instructions</Label>
                      <Textarea
                        placeholder="Patient preparation instructions"
                        value={procedurePrescription.preparation_instructions}
                        onChange={(e) => setProcedurePrescription({ ...procedurePrescription, preparation_instructions: e.target.value })}
                        className="bg-white min-h-[60px]"
                      />
                    </div>

                    <Button onClick={handlePrescribeProcedure} className="w-full bg-emerald-700 hover:bg-emerald-800">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Prescribe Procedure
                    </Button>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <User className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-700 text-lg">Please select a patient from the list to prescribe medicines, lab tests, and procedures</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ConsoleShell>
  );
}
