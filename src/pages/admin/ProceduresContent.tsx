import { useState, useEffect } from "react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, ChevronDown, Plus } from "lucide-react";

type Procedure = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  duration: string | null;
  preparation_instructions: string | null;
  created_at?: string;
};

type Patient = {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
};

const API_ROOT = "/api";

export default function ProceduresContent() {
  const { user } = useCustomAuth();
  // Catalog form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [preparationInstructions, setPreparationInstructions] = useState("");
  const [items, setItems] = useState<Procedure[]>([]);
  
  // Patient search states
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Prescribe procedure states
  const [selectedProcedureId, setSelectedProcedureId] = useState("");
  const [procedureName, setProcedureName] = useState("");
  const [procedureCategory, setProcedureCategory] = useState("");
  const [procedureDescription, setProcedureDescription] = useState("");
  const [procedurePreparation, setProcedurePreparation] = useState("");

  const loadCatalog = async () => {
    try {
      const res = await fetch(`${API_ROOT}/procedures/catalog`);
      if (!res.ok) throw new Error("Failed to load procedures");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Error loading procedures: " + err.message);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const addToCatalog = async () => {
    if (!name.trim()) {
      toast.error("Procedure name is required");
      return;
    }
    try {
      const payload = {
        name: name.trim(),
        category: category.trim() || null,
        description: description.trim() || null,
        duration: duration.trim() || null,
        preparation_instructions: preparationInstructions.trim() || null,
      };
      
      const res = await fetch(`${API_ROOT}/procedures/catalog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const js = await res.json();
        throw new Error(js?.error || "Failed to add procedure");
      }
      
      toast.success("Procedure added to catalog");
      setName("");
      setCategory("");
      setDescription("");
      setDuration("");
      setPreparationInstructions("");
      await loadCatalog();
    } catch (err: any) {
      toast.error("Error adding procedure: " + err.message);
    }
  };

  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    try {
      const res = await fetch(`${API_ROOT}/patients?search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Failed to search patients");
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
      if (data.length === 0) {
        toast.info("No patients found");
      }
    } catch (err: any) {
      toast.error("Error searching patients: " + err.message);
    }
  };

  const handleProcedureSelect = (proc: Procedure) => {
    setSelectedProcedureId(String(proc.id));
    setProcedureName(proc.name);
    setProcedureCategory(proc.category || "");
    setProcedureDescription(proc.description || "");
    setProcedurePreparation(proc.preparation_instructions || "");
  };

  const prescribeProcedure = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    if (!procedureName.trim()) {
      toast.error("Procedure name is required");
      return;
    }
    try {
      const payload = {
        patient_id: selectedPatient.id,
        procedure_catalogue_id: selectedProcedureId ? parseInt(selectedProcedureId) : null,
        procedure_name: procedureName.trim(),
        category: procedureCategory.trim() || null,
        description: procedureDescription.trim() || null,
        preparation_instructions: procedurePreparation.trim() || null,
      };
      const res = await fetch(`${API_ROOT}/procedures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const js = await res.json();
        throw new Error(js?.error || "Failed to prescribe procedure");
      }
      toast.success("Procedure prescribed successfully");
      setSelectedProcedureId("");
      setProcedureName("");
      setProcedureCategory("");
      setProcedureDescription("");
      setProcedurePreparation("");
    } catch (err: any) {
      toast.error("Error prescribing procedure: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-emerald-900">Procedures Management</h1>

      {/* Add to Catalog Section */}
      <Collapsible>
        <Card className="p-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-700" />
              <h3 className="font-semibold text-lg text-emerald-900">Add to Procedures Catalog</h3>
            </div>
            <ChevronDown className="h-5 w-5 text-emerald-700" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-emerald-900">Procedure Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Bronchoscopy"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-emerald-900">Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Diagnostic"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-emerald-900">Duration</Label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 30-45 minutes"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-emerald-900">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description"
                  className="bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-emerald-900">Preparation Instructions</Label>
                <Textarea
                  value={preparationInstructions}
                  onChange={(e) => setPreparationInstructions(e.target.value)}
                  placeholder="Patient preparation instructions"
                  className="bg-white"
                />
              </div>
            </div>
            <Button onClick={addToCatalog} className="mt-4 bg-emerald-700 hover:bg-emerald-800">
              <Plus className="h-4 w-4 mr-2" />
              Add to Catalog
            </Button>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Patient Section */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-emerald-900">Search Patient</h3>
          <div className="flex gap-2 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient by name..."
              className="bg-white"
              onKeyDown={(e) => e.key === "Enter" && searchPatients()}
            />
            <Button onClick={searchPatients} className="bg-emerald-700 hover:bg-emerald-800">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {patients.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? "bg-emerald-100 border-2 border-emerald-500"
                      : "bg-emerald-50 hover:bg-emerald-100"
                  }`}
                >
                  <div className="font-medium text-emerald-900">{patient.full_name}</div>
                  <div className="text-sm text-emerald-700">
                    {patient.email || "No email"} • {patient.phone || "No phone"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Prescribe Procedure Section */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-emerald-900">📋 Prescribe Procedure</h3>
          {selectedPatient ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="font-medium text-emerald-900">Selected: {selectedPatient.full_name}</div>
              </div>
              <div>
                <Label className="text-emerald-900">Select from Catalog (optional)</Label>
                <select
                  value={selectedProcedureId}
                  onChange={(e) => {
                    const proc = items.find((p) => p.id === parseInt(e.target.value));
                    if (proc) handleProcedureSelect(proc);
                  }}
                  className="w-full p-2 border rounded-md bg-white"
                >
                  <option value="">-- Select Procedure --</option>
                  {items.map((proc) => (
                    <option key={proc.id} value={proc.id}>
                      {proc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-emerald-900">Procedure Name *</Label>
                <Input
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  placeholder="Procedure name"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-emerald-900">Category</Label>
                <Input
                  value={procedureCategory}
                  onChange={(e) => setProcedureCategory(e.target.value)}
                  placeholder="Category"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-emerald-900">Description</Label>
                <Textarea
                  value={procedureDescription}
                  onChange={(e) => setProcedureDescription(e.target.value)}
                  placeholder="Description"
                  className="bg-white"
                />
              </div>
              <div>
                <Label className="text-emerald-900">Preparation Instructions</Label>
                <Textarea
                  value={procedurePreparation}
                  onChange={(e) => setProcedurePreparation(e.target.value)}
                  placeholder="Preparation instructions"
                  className="bg-white"
                />
              </div>
              <Button onClick={prescribeProcedure} className="w-full bg-emerald-700 hover:bg-emerald-800">
                Prescribe Procedure
              </Button>
            </div>
          ) : (
            <p className="text-center text-emerald-700 py-8">Please search and select a patient first</p>
          )}
        </Card>
      </div>

      {/* Procedures Catalog Table */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 text-emerald-900">
          Procedures Catalog ({items.length})
        </h3>
        {items.length === 0 ? (
          <p className="text-center text-emerald-700 py-8">No procedures in catalog yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Preparation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((proc) => (
                <TableRow key={proc.id}>
                  <TableCell className="font-medium">{proc.name}</TableCell>
                  <TableCell>{proc.category || "N/A"}</TableCell>
                  <TableCell>{proc.description || "N/A"}</TableCell>
                  <TableCell>{proc.duration || "N/A"}</TableCell>
                  <TableCell>{proc.preparation_instructions || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
