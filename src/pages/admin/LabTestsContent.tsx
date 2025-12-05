import { useEffect, useState } from "react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";

interface Patient {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface LabCatalog {
  id: number;
  name: string;
  category: string | null;
  sample_type: string | null;
  preparation_instructions: string | null;
  turnaround_time: string | null;
}

interface PrescribedLabTest {
  id: number;
  test_name: string;
  category: string | null;
  sample_type: string | null;
  preparation_instructions: string | null;
  prescribed_date: string;
}

export default function LabTestsContent() {
  const { user } = useCustomAuth();
  const [labCatalog, setLabCatalog] = useState<LabCatalog[]>([]);
  const [newLabTest, setNewLabTest] = useState({
    name: "",
    category: "",
    sample_type: "",
    preparation_instructions: "",
    turnaround_time: "",
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescribedTests, setPrescribedTests] = useState<PrescribedLabTest[]>([]);

  const [prescription, setPrescription] = useState({
    test_name: "",
    category: "",
    sample_type: "",
    preparation_instructions: "",
    lab_catalogue_id: "",
  });

  useEffect(() => {
    if (user && user.role === "admin") {
      loadLabCatalog();
      loadPatients();
    }
  }, [user]);

  const loadLabCatalog = async () => {
    try {
      const res = await fetch("/api/lab-tests/catalog");
      const data = await res.json();
      setLabCatalog(data);
    } catch (e: any) {
      toast.error("Failed to load lab catalog: " + e.message);
    }
  };

  const handleAddLabTestToCatalog = async () => {
    if (!newLabTest.name.trim()) {
      toast.error("Test name is required");
      return;
    }

    try {
      const res = await fetch("/api/lab-tests/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLabTest),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to add test");

      toast.success("Lab test added to catalog!");
      setNewLabTest({
        name: "",
        category: "",
        sample_type: "",
        preparation_instructions: "",
        turnaround_time: "",
      });
      loadLabCatalog();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch (e: any) {
      toast.error("Failed to load patients: " + e.message);
    }
  };

  const handleSearchPatient = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    try {
      const res = await fetch(`/api/patients/search?term=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setPatients(data);
    } catch (e: any) {
      toast.error("Search failed: " + e.message);
    }
  };

  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    try {
      const res = await fetch(`/api/patients/${patient.id}`);
      const data = await res.json();
      setPrescribedTests(data.lab_tests || []);
    } catch (e: any) {
      toast.error("Failed to load patient lab tests: " + e.message);
    }
  };

  const handlePrescribeLabTest = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }

    if (!prescription.test_name.trim()) {
      toast.error("Test name is required");
      return;
    }

    try {
      const payload = {
        patient_id: selectedPatient.id,
        ...prescription,
        lab_catalogue_id: prescription.lab_catalogue_id || null,
      };

      const res = await fetch("/api/lab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to prescribe test");

      toast.success("Lab test prescribed successfully!");
      setPrescription({
        test_name: "",
        category: "",
        sample_type: "",
        preparation_instructions: "",
        lab_catalogue_id: "",
      });
      selectPatient(selectedPatient);
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  const handleLabTestSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const testId = e.target.value;
    if (!testId) {
      setPrescription({
        test_name: "",
        category: "",
        sample_type: "",
        preparation_instructions: "",
        lab_catalogue_id: "",
      });
      return;
    }

    const selectedTest = labCatalog.find((test) => test.id === parseInt(testId));
    if (selectedTest) {
      setPrescription({
        test_name: selectedTest.name,
        category: selectedTest.category || "",
        sample_type: selectedTest.sample_type || "",
        preparation_instructions: selectedTest.preparation_instructions || "",
        lab_catalogue_id: testId,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-1">Lab Tests Management</h1>
        <p className="text-sm text-muted-foreground">Manage lab test catalog and prescribe tests to patients</p>
      </div>

      {/* Add to Lab Catalog */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Add to Lab Test Catalog</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="test-name">Test Name *</Label>
            <Input
              id="test-name"
              placeholder="e.g., Complete Blood Count"
              value={newLabTest.name}
              onChange={(e) => setNewLabTest({ ...newLabTest, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Hematology, Biochemistry"
              value={newLabTest.category}
              onChange={(e) => setNewLabTest({ ...newLabTest, category: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="sample-type">Sample Type</Label>
            <Input
              id="sample-type"
              placeholder="e.g., Blood, Urine"
              value={newLabTest.sample_type}
              onChange={(e) => setNewLabTest({ ...newLabTest, sample_type: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="turnaround">Turnaround Time</Label>
            <Input
              id="turnaround"
              placeholder="e.g., 24 hours"
              value={newLabTest.turnaround_time}
              onChange={(e) => setNewLabTest({ ...newLabTest, turnaround_time: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="prep-instructions">Preparation Instructions</Label>
            <Input
              id="prep-instructions"
              placeholder="e.g., Fasting required for 8-12 hours"
              value={newLabTest.preparation_instructions}
              onChange={(e) => setNewLabTest({ ...newLabTest, preparation_instructions: e.target.value })}
            />
          </div>
        </div>

        <Button onClick={handleAddLabTestToCatalog} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add to Catalog
        </Button>
      </Card>

      {/* Search Patient & Prescribe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Patient */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Search Patient</h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search patient by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
            />
            <Button onClick={handleSearchPatient} className="bg-primary hover:bg-primary/90">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => selectPatient(patient)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border hover:bg-muted"
                }`}
              >
                <p className="font-medium text-foreground">{patient.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.email || patient.phone || "No contact info"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Prescribe Lab Test */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Prescribe Lab Test</h2>

          {selectedPatient ? (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Selected Patient:</p>
                <p className="font-medium text-foreground">{selectedPatient.full_name}</p>
              </div>

              <div>
                <Label htmlFor="select-test">Select from Catalog</Label>
                <select
                  id="select-test"
                  className="w-full border border-border rounded-md p-2 bg-background text-foreground"
                  value={prescription.lab_catalogue_id}
                  onChange={handleLabTestSelect}
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
                <Label htmlFor="rx-test-name">Test Name *</Label>
                <Input
                  id="rx-test-name"
                  value={prescription.test_name}
                  onChange={(e) => setPrescription({ ...prescription, test_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="rx-category">Category</Label>
                <Input
                  id="rx-category"
                  value={prescription.category}
                  onChange={(e) => setPrescription({ ...prescription, category: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="rx-sample">Sample Type</Label>
                <Input
                  id="rx-sample"
                  value={prescription.sample_type}
                  onChange={(e) => setPrescription({ ...prescription, sample_type: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="rx-prep">Preparation Instructions</Label>
                <Input
                  id="rx-prep"
                  value={prescription.preparation_instructions}
                  onChange={(e) => setPrescription({ ...prescription, preparation_instructions: e.target.value })}
                />
              </div>

              <Button onClick={handlePrescribeLabTest} className="w-full bg-primary hover:bg-primary/90">
                Prescribe Lab Test
              </Button>

              {prescribedTests.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground mb-2">Prescribed Lab Tests</h3>
                  <div className="space-y-2">
                    {prescribedTests.map((test, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg text-sm">
                        <p className="font-medium text-foreground">{test.test_name}</p>
                        {test.category && <p className="text-muted-foreground">Category: {test.category}</p>}
                        {test.sample_type && <p className="text-muted-foreground">Sample: {test.sample_type}</p>}
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

      {/* Lab Catalog Table */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Lab Tests Catalog</h2>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-semibold text-foreground">Name</th>
                <th className="text-left p-3 text-sm font-semibold text-foreground">Category</th>
                <th className="text-left p-3 text-sm font-semibold text-foreground">Sample Type</th>
                <th className="text-left p-3 text-sm font-semibold text-foreground">Turnaround</th>
              </tr>
            </thead>
            <tbody>
              {labCatalog.map((test) => (
                <tr key={test.id} className="border-b border-border hover:bg-muted">
                  <td className="p-3 text-sm text-foreground">{test.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{test.category || "N/A"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{test.sample_type || "N/A"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{test.turnaround_time || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {labCatalog.map((test) => (
            <div key={test.id} className="p-4 bg-muted rounded-lg">
              <p className="font-semibold text-foreground mb-2">{test.name}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Category: {test.category || "N/A"}</p>
                <p>Sample: {test.sample_type || "N/A"}</p>
                <p>Turnaround: {test.turnaround_time || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
