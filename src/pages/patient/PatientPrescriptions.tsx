import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Download, Printer, Calendar, User, RefreshCw, Info } from "lucide-react";
import PatientConsoleShell from "@/layouts/PatientConsoleShell";

interface Prescription {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedDate: string;
  doctor: string;
  status: "active" | "completed";
}

const PatientPrescriptions = () => {
  const [prescriptions] = useState<Prescription[]>([
    { id: "1", medicineName: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "Ongoing", instructions: "Take in the morning with water", prescribedDate: "2026-01-10", doctor: "Dr. Smith", status: "active" },
    { id: "2", medicineName: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "Ongoing", instructions: "Take after meals", prescribedDate: "2026-01-10", doctor: "Dr. Smith", status: "active" },
    { id: "3", medicineName: "Vitamin D3", dosage: "60000 IU", frequency: "Once weekly", duration: "8 weeks", instructions: "Take after breakfast", prescribedDate: "2026-01-05", doctor: "Dr. Patel", status: "active" },
    { id: "4", medicineName: "Azithromycin", dosage: "500mg", frequency: "Once daily", duration: "5 days", instructions: "Take 1 hour before or 2 hours after meals", prescribedDate: "2025-12-28", doctor: "Dr. Johnson", status: "completed" },
    { id: "5", medicineName: "Paracetamol", dosage: "650mg", frequency: "As needed", duration: "5 days", instructions: "Take for fever or pain, max 4 tablets per day", prescribedDate: "2025-12-28", doctor: "Dr. Johnson", status: "completed" },
  ]);

  const currentPrescriptions = prescriptions.filter(p => p.status === "active");
  const pastPrescriptions = prescriptions.filter(p => p.status === "completed");

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-lg">{prescription.medicineName}</span>
              <Badge variant={prescription.status === "active" ? "default" : "secondary"}>
                {prescription.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Dosage</span>
                <span className="font-medium">{prescription.dosage}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Frequency</span>
                <span className="font-medium">{prescription.frequency}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Duration</span>
                <span className="font-medium">{prescription.duration}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Prescribed By</span>
                <span className="font-medium">{prescription.doctor}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-muted p-3 rounded-lg">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-sm">{prescription.instructions}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Prescribed on {new Date(prescription.prescribedDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-2 lg:flex-col">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PatientConsoleShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Prescriptions</h1>
            <p className="text-muted-foreground">View your medication details (Read-Only)</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Request Refill
          </Button>
        </div>

        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">Current ({currentPrescriptions.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastPrescriptions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-6">
            {currentPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active prescriptions</p>
                </CardContent>
              </Card>
            ) : (
              currentPrescriptions.map(p => (
                <PrescriptionCard key={p.id} prescription={p} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastPrescriptions.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">No past prescriptions</p>
                </CardContent>
              </Card>
            ) : (
              pastPrescriptions.map(p => (
                <PrescriptionCard key={p.id} prescription={p} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PatientConsoleShell>
  );
};

export default PatientPrescriptions;
