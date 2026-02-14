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
import { Search, Plus, Pill } from "lucide-react";

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

type PrescribedMedicine = {
  id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  prescribed_date?: string | null;
  created_at?: string | null;
};

import { apiFetch } from '@/lib/api';

export default function MedicinesManagement() {
  const { user, loading: authLoading } = useCustomAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [medicinesCatalog, setMedicinesCatalog] = useState<MedicineCatalog[]>([]);
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // New catalog item form
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    form: "",
    strength: "",
    default_frequency: "",
    duration: "",
    route: ""
  });

  // Prescription form
  const [prescription, setPrescription] = useState({
    medicine_id: "",
    medicine_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  });

  /** ---- Catalog: load & add (via Express/MySQL) ---- */
  const loadMedicinesCatalog = async () => {
    try {
      const res = await apiFetch('/api/medicines/catalog');
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Failed to load catalog");
      setMedicinesCatalog(js.items || []);
    } catch (err: any) {
      toast.error("Failed to load medicines: " + err.message);
    }
  };

  const handleAddMedicineToCatalog = async () => {
    if (!newMedicine.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    try {
      const res = await apiFetch('/api/medicines/catalog', { method: 'POST', body: JSON.stringify(newMedicine) });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Failed to add medicine");
      toast.success("Medicine added to catalog");
      setNewMedicine({ name: "", form: "", strength: "", default_frequency: "", duration: "", route: "" });
      loadMedicinesCatalog();
    } catch (err: any) {
      toast.error("Error adding medicine: " + err.message);
    }
  };

  /** ---- Patients: search & select (via Express) ---- */
  const loadPatients = async () => {
    try {
      const res = await apiFetch('/api/patients');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load patients");
      setPatients(Array.isArray(data) ? data : data.items || []);
    } catch (err: any) {
      toast.error("Failed to load patients: " + err.message);
    }
  };

  const handleSearchPatient = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a patient name");
      return;
    }
    try {
      const res = await apiFetch(`/api/patients?q=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Search failed");
      const list: Patient[] = Array.isArray(data) ? data : data.items || [];
      if (!list.length) {
        toast.error("Patient not found");
        setSelectedPatient(null);
        setPrescribedMedicines([]);
        return;
      }
      selectPatient(list[0]);
    } catch (err: any) {
      toast.error("Error: " + err.message);
      setSelectedPatient(null);
      setPrescribedMedicines([]);
    }
  };

  const selectPatient = async (p: Patient) => {
    setSelectedPatient(p);
    setSearchTerm(p.full_name);

    // Load meds for patient
    try {
      const res = await apiFetch(`/api/patients/${p.id}`);
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Failed to load patient meds");
      setPrescribedMedicines(js.medicines || []);
    } catch (err: any) {
      toast.error("Error loading prescriptions: " + err.message);
      setPrescribedMedicines([]);
    }
  };

  /** ---- Prescribe medicine (via Express/MySQL) ---- */
  const handlePrescribeMedicine = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    if (!prescription.medicine_name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    try {
      const res = await apiFetch('/api/medicines', { method: 'POST', body: JSON.stringify({
        patient_id: selectedPatient.id,
        full_name: selectedPatient.full_name,
        email: selectedPatient.email,
        phone: selectedPatient.phone,
        medicine_name: prescription.medicine_name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
      }) });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || "Failed to prescribe");
      toast.success("Medicine prescribed successfully");
      setPrescription({ medicine_id: "", medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" });
      // Reload patient meds
      selectPatient(selectedPatient);
    } catch (err: any) {
      toast.error("Error prescribing medicine: " + err.message);
    }
  };

  /** ---- Catalog selection autofills the form ---- */
  const handleMedicineSelect = (medicineId: string) => {
    const medicine = medicinesCatalog.find(m => String(m.id) === medicineId);
    if (medicine) {
      setPrescription({
        medicine_id: String(medicine.id),
        medicine_name: medicine.name,
        dosage: medicine.strength || "",
        frequency: medicine.default_frequency || "",
        duration: medicine.duration || "",
        instructions: medicine.route ? `Route: ${medicine.route}` : "",
      });
    }
  };

  useEffect(() => {
    loadMedicinesCatalog();
    loadPatients();
  }, []);

  return (
    <ConsoleShell>
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-emerald-900">Medicines Management</h1>

        {/* Add Medicine to Catalog */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-emerald-700" />
            <h3 className="text-lg md:text-xl font-semibold text-emerald-900">Add to Medicines Catalog</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Medicine Name *"
              value={newMedicine.name}
              onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
              className="bg-white"
            />
            <Input
              placeholder="Form (e.g., Tablet, Syrup)"
              value={newMedicine.form}
              onChange={(e) => setNewMedicine({ ...newMedicine, form: e.target.value })}
              className="bg-white"
            />
            <Input
              placeholder="Strength (e.g., 500mg)"
              value={newMedicine.strength}
              onChange={(e) => setNewMedicine({ ...newMedicine, strength: e.target.value })}
              className="bg-white"
            />
            <Input
              placeholder="Default Frequency (e.g., Twice daily)"
              value={newMedicine.default_frequency}
              onChange={(e) => setNewMedicine({ ...newMedicine, default_frequency: e.target.value })}
              className="bg-white"
            />
            <Input
              placeholder="Duration (e.g., 7 days)"
              value={newMedicine.duration}
              onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
              className="bg-white"
            />
            <Input
              placeholder="Route (e.g., Oral)"
              value={newMedicine.route}
              onChange={(e) => setNewMedicine({ ...newMedicine, route: e.target.value })}
              className="bg-white"
            />
          </div>

          <Button onClick={handleAddMedicineToCatalog} className="bg-emerald-700 hover:bg-emerald-800 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add to Catalog
          </Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Patient Search & Selection */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-emerald-900">Search Patient</h3>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input
                placeholder="Search patient by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
                className="bg-white flex-1"
              />
              <Button onClick={handleSearchPatient} className="bg-emerald-700 hover:bg-emerald-800 w-full sm:w-auto">
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="sm:inline">Search</span>
              </Button>
            </div>

            {selectedPatient && (
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-emerald-900">{selectedPatient.full_name}</h4>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">Regular</span>
                </div>
                <p className="text-sm text-emerald-700">{selectedPatient.phone}</p>
                <p className="text-sm text-emerald-700">{selectedPatient.email}</p>
              </div>
            )}

            {/* Previous Prescriptions */}
            {selectedPatient && prescribedMedicines.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-emerald-900">Previous Prescriptions</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {prescribedMedicines.map((med) => (
                    <div key={med.id} className="p-3 bg-white border border-emerald-100 rounded">
                      <div className="font-medium text-emerald-900">{med.medicine_name}</div>
                      <div className="text-sm text-emerald-700">
                        {med.dosage} • {med.frequency} • {med.duration}
                      </div>
                      {med.instructions && (
                        <div className="text-xs text-gray-600 mt-1">{med.instructions}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Prescribe Medicine */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="h-5 w-5 text-emerald-700" />
              <h3 className="text-lg md:text-xl font-semibold text-emerald-900">Prescribe Medicine</h3>
            </div>

            {!selectedPatient ? (
              <p className="text-emerald-700 text-center py-8">Please search and select a patient first</p>
            ) : (
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
                    value={prescription.medicine_name}
                    onChange={(e) => setPrescription({ ...prescription, medicine_name: e.target.value })}
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Dosage</Label>
                    <Input
                      placeholder="e.g., 500mg"
                      value={prescription.dosage}
                      onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Input
                      placeholder="e.g., Twice daily"
                      value={prescription.frequency}
                      onChange={(e) => setPrescription({ ...prescription, frequency: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div>
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 7 days"
                    value={prescription.duration}
                    onChange={(e) => setPrescription({ ...prescription, duration: e.target.value })}
                    className="bg-white"
                  />
                </div>

                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    placeholder="Additional instructions..."
                    value={prescription.instructions}
                    onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
                    className="bg-white min-h-[80px]"
                  />
                </div>

                <Button onClick={handlePrescribeMedicine} className="w-full bg-emerald-700 hover:bg-emerald-800">
                  <Pill className="h-4 w-4 mr-2" />
                  Prescribe Medicine
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Medicines Catalog Display */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4 text-emerald-900">Medicines Catalog</h3>
          
          {medicinesCatalog.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-emerald-100">
                      <th className="text-left py-2 px-3 text-emerald-900 text-sm">Name</th>
                      <th className="text-left py-2 px-3 text-emerald-900 text-sm">Form</th>
                      <th className="text-left py-2 px-3 text-emerald-900 text-sm">Strength</th>
                      <th className="text-left py-2 px-3 text-emerald-900 text-sm">Frequency</th>
                      <th className="text-left py-2 px-3 text-emerald-900 text-sm">Duration</th>
                      <th className="text-left py-2 px-3 text-emerald-900 text-sm">Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicinesCatalog.map((med) => (
                      <tr key={med.id} className="border-b border-emerald-50">
                        <td className="py-2 px-3 font-medium text-sm">{med.name}</td>
                        <td className="py-2 px-3 text-sm">{med.form || "N/A"}</td>
                        <td className="py-2 px-3 text-sm">{med.strength || "N/A"}</td>
                        <td className="py-2 px-3 text-sm">{med.default_frequency || "N/A"}</td>
                        <td className="py-2 px-3 text-sm">{med.duration || "N/A"}</td>
                        <td className="py-2 px-3 text-sm">{med.route || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="md:hidden space-y-3">
                {medicinesCatalog.map((med) => (
                  <div key={med.id} className="p-3 bg-emerald-50 rounded-lg">
                    <div className="font-medium text-emerald-900 mb-2">{med.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-emerald-700">Form:</span> {med.form || "N/A"}</div>
                      <div><span className="text-emerald-700">Strength:</span> {med.strength || "N/A"}</div>
                      <div><span className="text-emerald-700">Frequency:</span> {med.default_frequency || "N/A"}</div>
                      <div><span className="text-emerald-700">Duration:</span> {med.duration || "N/A"}</div>
                      <div className="col-span-2"><span className="text-emerald-700">Route:</span> {med.route || "N/A"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-emerald-700 text-center py-4">No medicines in catalog</p>
          )}
        </Card>
      </div>
    </ConsoleShell>
  );
}
