import { useState, useEffect } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Plus, Pill } from "lucide-react";

type Patient = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  is_new_patient: boolean;
};

type Medicine = {
  id: string;
  name: string;
  form: string | null;
  strength: string | null;
  default_frequency: string | null;
  duration: string | null;
  route: string | null;
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

export default function MedicinesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medicinesCatalog, setMedicinesCatalog] = useState<Medicine[]>([]);
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);
  
  // New medicine catalog form
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

  // Load medicines catalog
  const loadMedicinesCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from("medicines_catalog")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      setMedicinesCatalog(data || []);
    } catch (err: any) {
      toast.error("Failed to load medicines: " + err.message);
    }
  };

  // Load all patients
  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("full_name", { ascending: true });
      
      if (error) throw error;
      setPatients(data || []);
    } catch (err: any) {
      toast.error("Failed to load patients: " + err.message);
    }
  };

  useEffect(() => {
    loadMedicinesCatalog();
    loadPatients();
  }, []);

  // Search patient
  const handleSearchPatient = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a patient name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .ilike("full_name", `%${searchTerm}%`)
        .single();

      if (error) throw error;
      
      if (data) {
        setSelectedPatient(data);
        await loadPrescribedMedicines(data.id);
      }
    } catch (err: any) {
      if (err.code === 'PGRST116') {
        toast.error("Patient not found");
      } else {
        toast.error("Error: " + err.message);
      }
      setSelectedPatient(null);
      setPrescribedMedicines([]);
    }
  };

  // Load prescribed medicines for patient
  const loadPrescribedMedicines = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from("prescribed_medicines")
        .select("*")
        .eq("patient_id", patientId)
        .order("prescribed_date", { ascending: false });

      if (error) throw error;
      setPrescribedMedicines(data || []);
    } catch (err: any) {
      toast.error("Error loading prescriptions: " + err.message);
    }
  };

  // Add medicine to catalog
  const handleAddMedicineToCatalog = async () => {
    if (!newMedicine.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }

    try {
      const { error } = await supabase
        .from("medicines_catalog")
        .insert([newMedicine]);

      if (error) throw error;
      
      toast.success("Medicine added to catalog");
      setNewMedicine({ name: "", form: "", strength: "", default_frequency: "", duration: "", route: "" });
      loadMedicinesCatalog();
    } catch (err: any) {
      toast.error("Error adding medicine: " + err.message);
    }
  };

  // Prescribe medicine
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
      const { error } = await supabase
        .from("prescribed_medicines")
        .insert([{
          patient_id: selectedPatient.id,
          visit_id: null,
          medicine_id: prescription.medicine_id || null,
          medicine_name: prescription.medicine_name,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: prescription.instructions
        }]);

      if (error) throw error;
      
      toast.success("Medicine prescribed successfully");
      setPrescription({ medicine_id: "", medicine_name: "", dosage: "", frequency: "", duration: "", instructions: "" });
      loadPrescribedMedicines(selectedPatient.id);
    } catch (err: any) {
      toast.error("Error prescribing medicine: " + err.message);
    }
  };

  // Handle medicine selection from catalog
  const handleMedicineSelect = (medicineId: string) => {
    const medicine = medicinesCatalog.find(m => m.id === medicineId);
    if (medicine) {
      setPrescription({
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        dosage: medicine.strength || "",
        frequency: medicine.default_frequency || "",
        duration: medicine.duration || "",
        instructions: `Route: ${medicine.route || "N/A"}`
      });
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-emerald-900">Medicines Management</h1>

        {/* Add Medicine to Catalog */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-emerald-700" />
            <h3 className="text-xl font-semibold text-emerald-900">Add to Medicines Catalog</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
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
          
          <Button onClick={handleAddMedicineToCatalog} className="bg-emerald-700 hover:bg-emerald-800">
            <Plus className="h-4 w-4 mr-2" />
            Add to Catalog
          </Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Search & Selection */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-emerald-900">Search Patient</h3>
            
            <div className="flex gap-3 mb-4">
              <Input
                placeholder="Search patient by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
                className="bg-white"
              />
              <Button onClick={handleSearchPatient} className="bg-emerald-700 hover:bg-emerald-800">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {selectedPatient && (
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-emerald-900">{selectedPatient.full_name}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      selectedPatient.is_new_patient
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedPatient.is_new_patient ? "New" : "Regular"}
                  </span>
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
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="h-5 w-5 text-emerald-700" />
              <h3 className="text-xl font-semibold text-emerald-900">Prescribe Medicine</h3>
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
                        <SelectItem key={med.id} value={med.id}>
                          {med.name} - {med.strength} ({med.form})
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

                <div className="grid grid-cols-2 gap-3">
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
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-emerald-900">Medicines Catalog</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-100">
                  <th className="text-left py-2 px-3 text-emerald-900">Name</th>
                  <th className="text-left py-2 px-3 text-emerald-900">Form</th>
                  <th className="text-left py-2 px-3 text-emerald-900">Strength</th>
                  <th className="text-left py-2 px-3 text-emerald-900">Frequency</th>
                  <th className="text-left py-2 px-3 text-emerald-900">Duration</th>
                  <th className="text-left py-2 px-3 text-emerald-900">Route</th>
                </tr>
              </thead>
              <tbody>
                {medicinesCatalog.map((med) => (
                  <tr key={med.id} className="border-b border-emerald-50">
                    <td className="py-2 px-3 font-medium">{med.name}</td>
                    <td className="py-2 px-3">{med.form || "N/A"}</td>
                    <td className="py-2 px-3">{med.strength || "N/A"}</td>
                    <td className="py-2 px-3">{med.default_frequency || "N/A"}</td>
                    <td className="py-2 px-3">{med.duration || "N/A"}</td>
                    <td className="py-2 px-3">{med.route || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {medicinesCatalog.length === 0 && (
              <p className="text-emerald-700 text-center py-4">No medicines in catalog</p>
            )}
          </div>
        </Card>
      </div>
    </ConsoleShell>
  );
}
