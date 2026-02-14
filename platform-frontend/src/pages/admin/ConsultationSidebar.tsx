import { useState, useEffect } from "react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
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

export default function ConsultationSidebar() {
  const { user } = useCustomAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [medicinesCatalog, setMedicinesCatalog] = useState<MedicineCatalog[]>([]);
  const [labCatalog, setLabCatalog] = useState<LabCatalog[]>([]);
  const [proceduresCatalog, setProceduresCatalog] = useState<ProcedureCatalog[]>([]);

  const [medicinePrescription, setMedicinePrescription] = useState({
    medicine_id: "",
    medicine_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  });

  const [labPrescription, setLabPrescription] = useState({
    test_name: "",
    category: "",
    sample_type: "",
    preparation_instructions: "",
    lab_catalogue_id: ""
  });

  const [procedurePrescription, setProcedurePrescription] = useState({
    procedure_name: "",
    category: "",
    description: "",
    preparation_instructions: "",
    procedure_catalogue_id: ""
  });

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      loadPatients();
      loadMedicinesCatalog();
      loadLabCatalog();
      loadProceduresCatalog();
    }
  }, [user]);

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
      if (!list.length) toast.info("No patients found");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  const selectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setMedicinePrescription({ medicine_id: "", medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" });
    setLabPrescription({ test_name: "", category: "", sample_type: "", preparation_instructions: "", lab_catalogue_id: "" });
    setProcedurePrescription({ procedure_name: "", category: "", description: "", preparation_instructions: "", procedure_catalogue_id: "" });
  };

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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-emerald-900 mb-1">Consultation</h2>
        <p className="text-sm text-emerald-700">Select patient and prescribe</p>
      </div>

      {/* Patients Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
          className="bg-white text-sm"
        />
        <Button onClick={handleSearchPatient} size="sm" className="bg-emerald-700 hover:bg-emerald-800 shrink-0">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Patients List */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {patients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => selectPatient(patient)}
            className={`p-2 rounded-lg cursor-pointer text-sm transition-colors ${
              selectedPatient?.id === patient.id
                ? "bg-emerald-100 border-2 border-emerald-500"
                : "bg-white hover:bg-emerald-50 border border-emerald-100"
            }`}
          >
            <div className="font-medium text-emerald-900">{patient.full_name}</div>
            <div className="text-xs text-emerald-600">{patient.email || patient.phone || "No contact"}</div>
          </div>
        ))}
        {patients.length === 0 && (
          <p className="text-center text-emerald-700 py-2 text-sm">No patients found</p>
        )}
      </div>

      {selectedPatient && (
        <>
          {/* Selected Patient Info */}
          <Card className="p-3 bg-emerald-50 border-emerald-200">
            <p className="text-xs text-emerald-700">Selected:</p>
            <p className="font-semibold text-emerald-900">{selectedPatient.full_name}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setSelectedPatient(null)}>
              Clear
            </Button>
          </Card>

          {/* Prescribe Medicine */}
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="h-4 w-4 text-emerald-700" />
              <h3 className="font-semibold text-emerald-900 text-sm">Prescribe Medicine</h3>
            </div>

            <div className="space-y-3">
              <Select onValueChange={handleMedicineSelect}>
                <SelectTrigger className="bg-white text-sm">
                  <SelectValue placeholder="Select from catalog" />
                </SelectTrigger>
                <SelectContent>
                  {medicinesCatalog.map((med) => (
                    <SelectItem key={med.id} value={String(med.id)}>
                      {med.name} {med.strength ? `- ${med.strength}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Medicine name *"
                value={medicinePrescription.medicine_name}
                onChange={(e) => setMedicinePrescription({ ...medicinePrescription, medicine_name: e.target.value })}
                className="bg-white text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Dosage"
                  value={medicinePrescription.dosage}
                  onChange={(e) => setMedicinePrescription({ ...medicinePrescription, dosage: e.target.value })}
                  className="bg-white text-sm"
                />
                <Input
                  placeholder="Frequency"
                  value={medicinePrescription.frequency}
                  onChange={(e) => setMedicinePrescription({ ...medicinePrescription, frequency: e.target.value })}
                  className="bg-white text-sm"
                />
              </div>

              <Input
                placeholder="Duration"
                value={medicinePrescription.duration}
                onChange={(e) => setMedicinePrescription({ ...medicinePrescription, duration: e.target.value })}
                className="bg-white text-sm"
              />

              <Textarea
                placeholder="Instructions"
                value={medicinePrescription.instructions}
                onChange={(e) => setMedicinePrescription({ ...medicinePrescription, instructions: e.target.value })}
                className="bg-white text-sm"
                rows={2}
              />

              <Button onClick={handlePrescribeMedicine} className="w-full bg-emerald-700 hover:bg-emerald-800" size="sm">
                Prescribe Medicine
              </Button>
            </div>
          </Card>

          {/* Prescribe Lab Test */}
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="h-4 w-4 text-emerald-700" />
              <h3 className="font-semibold text-emerald-900 text-sm">Prescribe Lab Test</h3>
            </div>

            <div className="space-y-3">
              <Select onValueChange={handleLabTestSelect}>
                <SelectTrigger className="bg-white text-sm">
                  <SelectValue placeholder="Select from catalog" />
                </SelectTrigger>
                <SelectContent>
                  {labCatalog.map((test) => (
                    <SelectItem key={test.id} value={String(test.id)}>
                      {test.name} {test.category ? `(${test.category})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Test name *"
                value={labPrescription.test_name}
                onChange={(e) => setLabPrescription({ ...labPrescription, test_name: e.target.value })}
                className="bg-white text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Category"
                  value={labPrescription.category}
                  onChange={(e) => setLabPrescription({ ...labPrescription, category: e.target.value })}
                  className="bg-white text-sm"
                />
                <Input
                  placeholder="Sample type"
                  value={labPrescription.sample_type}
                  onChange={(e) => setLabPrescription({ ...labPrescription, sample_type: e.target.value })}
                  className="bg-white text-sm"
                />
              </div>

              <Textarea
                placeholder="Preparation instructions"
                value={labPrescription.preparation_instructions}
                onChange={(e) => setLabPrescription({ ...labPrescription, preparation_instructions: e.target.value })}
                className="bg-white text-sm"
                rows={2}
              />

              <Button onClick={handlePrescribeLabTest} className="w-full bg-emerald-700 hover:bg-emerald-800" size="sm">
                Prescribe Lab Test
              </Button>
            </div>
          </Card>

          {/* Prescribe Procedure */}
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="h-4 w-4 text-emerald-700" />
              <h3 className="font-semibold text-emerald-900 text-sm">Prescribe Procedure</h3>
            </div>

            <div className="space-y-3">
              <Select onValueChange={handleProcedureSelect}>
                <SelectTrigger className="bg-white text-sm">
                  <SelectValue placeholder="Select from catalog" />
                </SelectTrigger>
                <SelectContent>
                  {proceduresCatalog.map((proc) => (
                    <SelectItem key={proc.id} value={String(proc.id)}>
                      {proc.name} {proc.category ? `(${proc.category})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Procedure name *"
                value={procedurePrescription.procedure_name}
                onChange={(e) => setProcedurePrescription({ ...procedurePrescription, procedure_name: e.target.value })}
                className="bg-white text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Category"
                  value={procedurePrescription.category}
                  onChange={(e) => setProcedurePrescription({ ...procedurePrescription, category: e.target.value })}
                  className="bg-white text-sm"
                />
                <Input
                  placeholder="Duration"
                  value={procedurePrescription.description}
                  onChange={(e) => setProcedurePrescription({ ...procedurePrescription, description: e.target.value })}
                  className="bg-white text-sm"
                />
              </div>

              <Textarea
                placeholder="Preparation instructions"
                value={procedurePrescription.preparation_instructions}
                onChange={(e) => setProcedurePrescription({ ...procedurePrescription, preparation_instructions: e.target.value })}
                className="bg-white text-sm"
                rows={2}
              />

              <Button onClick={handlePrescribeProcedure} className="w-full bg-emerald-700 hover:bg-emerald-800" size="sm">
                Prescribe Procedure
              </Button>
            </div>
          </Card>
        </>
      )}

      {!selectedPatient && (
        <Card className="p-4 text-center text-emerald-700 text-sm">
          Please search and select a patient to prescribe
        </Card>
      )}
    </div>
  );
}
