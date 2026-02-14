import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import api from '@/lib/api';

type MedicineCatalog = { 
  id: number; 
  name: string; 
  form: string; 
  strength: string; 
  default_frequency: string; 
  duration: string; 
  route: string; 
};

type Patient = {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
};

type PrescribedMedicine = {
  id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  prescribed_date: string;
};

export default function MedicinesContent() {
  const { user } = useCustomAuth();
  
  // Catalog form states
  const [name, setName] = useState("");
  const [form, setForm] = useState("");
  const [strength, setStrength] = useState("");
  const [defaultFrequency, setDefaultFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [route, setRoute] = useState("");
  const [catalogItems, setCatalogItems] = useState<MedicineCatalog[]>([]);

  // Patient search states
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);

  // Prescribe medicine states
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [medicineStrength, setMedicineStrength] = useState("");
  const [medicineFrequency, setMedicineFrequency] = useState("");
  const [medicineDuration, setMedicineDuration] = useState("");
  const [medicineInstructions, setMedicineInstructions] = useState("");

  useEffect(() => {
    loadCatalog();
    loadPatients();
  }, []);

  async function loadCatalog() {
    try {
      const res = await api.apiGet('/api/medicines/catalog');
      const js = await res.json();
      setCatalogItems(js.items || []);
    } catch (err: any) {
      toast.error("Failed to load catalog: " + err.message);
    }
  }

  async function loadPatients() {
    try {
      const res = await api.apiGet('/api/patients');
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Failed to load patients: " + err.message);
    }
  }

  async function addToCatalog() {
    if (!name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    
    try {
      const payload = { name, form, strength, default_frequency: defaultFrequency, duration, route };
      const res = await api.apiPost('/api/medicines/catalog', payload);
      if (!res.ok) {
        const js = await res.json();
        throw new Error(js.error || "Failed to add");
      }
      toast.success("Medicine added to catalog");
      setName(""); setForm(""); setStrength(""); setDefaultFrequency(""); setDuration(""); setRoute("");
      loadCatalog();
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  }

  async function searchPatients() {
    if (!searchQuery.trim()) {
      loadPatients();
      return;
    }
    try {
      const res = await api.apiGet(`/api/patients/search?term=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
      if (data.length === 0) {
        toast.info("No patients found");
      }
    } catch (err: any) {
      toast.error("Search failed: " + err.message);
    }
  }

  async function selectPatient(patient: Patient) {
    setSelectedPatient(patient);
    try {
      const res = await api.apiGet(`/api/patients/${patient.id}`);
      const data = await res.json();
      setPrescribedMedicines(data.medicines || []);
    } catch (err: any) {
      toast.error("Failed to load patient medicines: " + err.message);
    }
  }

  function handleMedicineSelect(med: MedicineCatalog) {
    setSelectedMedicineId(String(med.id));
    setMedicineName(med.name);
    setMedicineStrength(med.strength || "");
    setMedicineFrequency(med.default_frequency || "");
    setMedicineDuration(med.duration || "");
  }

  async function prescribeMedicine() {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    if (!medicineName.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    try {
      const payload = {
        patient_id: selectedPatient.id,
        medicine_catalogue_id: selectedMedicineId ? parseInt(selectedMedicineId) : null,
        medicine_name: medicineName.trim(),
        dosage: medicineStrength.trim() || null,
        frequency: medicineFrequency.trim() || null,
        duration: medicineDuration.trim() || null,
        instructions: medicineInstructions.trim() || null,
      };
      const res = await api.apiPost('/api/medicines', payload);
      if (!res.ok) {
        const js = await res.json();
        throw new Error(js.error || "Failed to prescribe medicine");
      }
      toast.success("Medicine prescribed successfully");
      setSelectedMedicineId("");
      setMedicineName("");
      setMedicineStrength("");
      setMedicineFrequency("");
      setMedicineDuration("");
      setMedicineInstructions("");
      // Reload patient medicines
      selectPatient(selectedPatient);
      // Notify other components (e.g., Patients.tsx) to refresh
      window.dispatchEvent(new CustomEvent("medicine-prescribed", { detail: { patientId: selectedPatient.id } }));
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Medicines Management</h1>
      <p className="text-sm text-muted-foreground">Manage medicine catalog and prescribe medicines to patients</p>

      {/* Add to Catalog Section */}
      <Collapsible>
        <Card className="p-6 bg-card border-border">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg text-foreground">Add to Medicines Catalog</h3>
            </div>
            <ChevronDown className="h-5 w-5 text-primary" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Medicine Name *</Label>
                <Input 
                  placeholder="Brand / Generic Name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="bg-background" 
                />
              </div>
              <div>
                <Label className="text-foreground">Form</Label>
                <Input 
                  placeholder="e.g., Tablet, Capsule, Syrup" 
                  value={form} 
                  onChange={e => setForm(e.target.value)} 
                  className="bg-background" 
                />
              </div>
              <div>
                <Label className="text-foreground">Strength</Label>
                <Input 
                  placeholder="e.g., 500mg, 10ml" 
                  value={strength} 
                  onChange={e => setStrength(e.target.value)} 
                  className="bg-background" 
                />
              </div>
              <div>
                <Label className="text-foreground">Default Frequency</Label>
                <Input 
                  placeholder="e.g., Once daily, Twice daily" 
                  value={defaultFrequency} 
                  onChange={e => setDefaultFrequency(e.target.value)} 
                  className="bg-background" 
                />
              </div>
              <div>
                <Label className="text-foreground">Duration</Label>
                <Input 
                  placeholder="e.g., 7 days, 2 weeks" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  className="bg-background" 
                />
              </div>
              <div>
                <Label className="text-foreground">Route</Label>
                <Input 
                  placeholder="e.g., Oral, IV, Topical" 
                  value={route} 
                  onChange={e => setRoute(e.target.value)} 
                  className="bg-background" 
                />
              </div>
            </div>
            <Button onClick={addToCatalog} className="mt-4 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add to Catalog
            </Button>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Patient Section */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-semibold text-lg mb-4 text-foreground">Search Patient</h3>
          <div className="flex gap-2 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient by name..."
              className="bg-background"
              onKeyDown={(e) => e.key === "Enter" && searchPatients()}
            />
            <Button onClick={searchPatients} className="bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => selectPatient(patient)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <div className="font-medium text-foreground">{patient.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {patient.email || "No email"} • {patient.phone || "No phone"}
                </div>
              </div>
            ))}
            {patients.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No patients found</p>
            )}
          </div>
        </Card>

        {/* Prescribe Medicine Section */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-semibold text-lg mb-4 text-foreground">💊 Prescribe Medicine</h3>
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Selected Patient:</div>
                <div className="font-medium text-foreground">{selectedPatient.full_name}</div>
              </div>
              
              <div>
                <Label className="text-foreground">Select from Catalog (optional)</Label>
                <select
                  value={selectedMedicineId}
                  onChange={(e) => {
                    const med = catalogItems.find((m) => m.id === parseInt(e.target.value));
                    if (med) handleMedicineSelect(med);
                  }}
                  className="w-full p-2 border rounded-md bg-background text-foreground"
                >
                  <option value="">-- Select Medicine --</option>
                  {catalogItems.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} {med.strength ? `(${med.strength})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-foreground">Medicine Name *</Label>
                <Input
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Medicine name"
                  className="bg-background"
                />
              </div>

              <div>
                <Label className="text-foreground">Dosage/Strength</Label>
                <Input
                  value={medicineStrength}
                  onChange={(e) => setMedicineStrength(e.target.value)}
                  placeholder="e.g., 500mg"
                  className="bg-background"
                />
              </div>

              <div>
                <Label className="text-foreground">Frequency</Label>
                <Input
                  value={medicineFrequency}
                  onChange={(e) => setMedicineFrequency(e.target.value)}
                  placeholder="e.g., Twice daily"
                  className="bg-background"
                />
              </div>

              <div>
                <Label className="text-foreground">Duration</Label>
                <Input
                  value={medicineDuration}
                  onChange={(e) => setMedicineDuration(e.target.value)}
                  placeholder="e.g., 7 days"
                  className="bg-background"
                />
              </div>

              <div>
                <Label className="text-foreground">Instructions</Label>
                <Input
                  value={medicineInstructions}
                  onChange={(e) => setMedicineInstructions(e.target.value)}
                  placeholder="e.g., Take after meals"
                  className="bg-background"
                />
              </div>

              <Button onClick={prescribeMedicine} className="w-full bg-primary hover:bg-primary/90">
                Prescribe Medicine
              </Button>

              {prescribedMedicines.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-foreground mb-2">Prescribed Medicines</h4>
                  <div className="space-y-2">
                    {prescribedMedicines.map((med, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg text-sm">
                        <p className="font-medium text-foreground">{med.medicine_name}</p>
                        <p className="text-muted-foreground">
                          {[med.dosage, med.frequency, med.duration].filter(Boolean).join(" • ")}
                        </p>
                        {med.instructions && (
                          <p className="text-muted-foreground italic">{med.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Please search and select a patient first</p>
          )}
        </Card>
      </div>

      {/* Medicines Catalog Table */}
      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold text-lg mb-4 text-foreground">
          Medicines Catalog ({catalogItems.length})
        </h3>
        {catalogItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No medicines in catalog yet</p>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Name</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Form</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Strength</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Frequency</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Duration</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground">Route</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogItems.map((med) => (
                    <tr key={med.id} className="border-b border-border hover:bg-muted">
                      <td className="p-3 text-sm text-foreground font-medium">{med.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">{med.form || "N/A"}</td>
                      <td className="p-3 text-sm text-muted-foreground">{med.strength || "N/A"}</td>
                      <td className="p-3 text-sm text-muted-foreground">{med.default_frequency || "N/A"}</td>
                      <td className="p-3 text-sm text-muted-foreground">{med.duration || "N/A"}</td>
                      <td className="p-3 text-sm text-muted-foreground">{med.route || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {catalogItems.map((med) => (
                <div key={med.id} className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold text-foreground mb-2">{med.name}</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Form: {med.form || "N/A"}</p>
                    <p>Strength: {med.strength || "N/A"}</p>
                    <p>Frequency: {med.default_frequency || "N/A"}</p>
                    <p>Duration: {med.duration || "N/A"}</p>
                    <p>Route: {med.route || "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
