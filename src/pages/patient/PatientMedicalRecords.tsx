import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, User } from "lucide-react";
import PatientConsoleShell from "@/layouts/PatientConsoleShell";

const PatientMedicalRecords = () => {
  const [visits] = useState([
    { id: "1", date: "2026-01-10", doctor: "Dr. Smith", type: "Consultation", summary: "Regular heart checkup, ECG normal" },
    { id: "2", date: "2026-01-05", doctor: "Dr. Patel", type: "Follow-up", summary: "Knee pain improved, continue physiotherapy" },
    { id: "3", date: "2025-12-28", doctor: "Dr. Johnson", type: "Consultation", summary: "Flu symptoms, prescribed antibiotics" },
  ]);

  const [diagnoses] = useState([
    { id: "1", date: "2026-01-10", condition: "Hypertension (controlled)", doctor: "Dr. Smith", status: "Active" },
    { id: "2", date: "2025-11-15", condition: "Seasonal Allergies", doctor: "Dr. Johnson", status: "Resolved" },
    { id: "3", date: "2025-08-20", condition: "Minor Knee Sprain", doctor: "Dr. Patel", status: "Resolved" },
  ]);

  const [doctorNotes] = useState([
    { id: "1", date: "2026-01-10", doctor: "Dr. Smith", note: "Patient reports improved blood pressure control. Continue current medication. Schedule follow-up in 3 months." },
    { id: "2", date: "2025-12-28", doctor: "Dr. Johnson", note: "Flu symptoms present for 3 days. Prescribed rest and antibiotics. Return if fever persists beyond 5 days." },
  ]);

  const [dischargeSummaries] = useState([
    { id: "1", date: "2025-06-15", hospital: "City Hospital", reason: "Appendectomy", duration: "3 days" },
  ]);

  return (
    <PatientConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">View your complete medical history (Read-Only)</p>
        </div>

        <Tabs defaultValue="visits">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
            <TabsTrigger value="notes">Doctor Notes</TabsTrigger>
            <TabsTrigger value="discharge">Discharge</TabsTrigger>
          </TabsList>

          <TabsContent value="visits" className="mt-6 space-y-4">
            {visits.map(visit => (
              <Card key={visit.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{new Date(visit.date).toLocaleDateString()}</span>
                        <Badge variant="outline">{visit.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{visit.doctor}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{visit.summary}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="diagnoses" className="mt-6 space-y-4">
            {diagnoses.map(diagnosis => (
              <Card key={diagnosis.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{diagnosis.condition}</span>
                        <Badge variant={diagnosis.status === "Active" ? "default" : "secondary"}>
                          {diagnosis.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Diagnosed on {new Date(diagnosis.date).toLocaleDateString()} by {diagnosis.doctor}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="notes" className="mt-6 space-y-4">
            {doctorNotes.map(note => (
              <Card key={note.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{new Date(note.date).toLocaleDateString()}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{note.doctor}</span>
                    </div>
                    <p className="text-sm bg-muted p-3 rounded-lg">{note.note}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="discharge" className="mt-6 space-y-4">
            {dischargeSummaries.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">No discharge summaries available</p>
                </CardContent>
              </Card>
            ) : (
              dischargeSummaries.map(summary => (
                <Card key={summary.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{new Date(summary.date).toLocaleDateString()}</span>
                        </div>
                        <p className="font-medium">{summary.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {summary.hospital} • Duration: {summary.duration}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PatientConsoleShell>
  );
};

export default PatientMedicalRecords;
