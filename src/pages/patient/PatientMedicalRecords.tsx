import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomAuth } from "@/contexts/CustomAuthContext";

interface Visit {
  id: string;
  visit_date: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  notes: string | null;
}

const PatientMedicalRecords = () => {
  const { user } = useCustomAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      
      // Fetch patient visits
      const { data: visitsData, error: visitsError } = await supabase
        .from('patient_visits')
        .select('*')
        .order('visit_date', { ascending: false });

      if (!visitsError && visitsData) {
        setVisits(visitsData);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique diagnoses from visits
  const diagnoses = visits
    .filter(v => v.diagnosis)
    .map(v => ({
      id: v.id,
      date: v.visit_date,
      condition: v.diagnosis,
      status: "Recorded"
    }));

  // Extract doctor notes from visits
  const doctorNotes = visits
    .filter(v => v.notes)
    .map(v => ({
      id: v.id,
      date: v.visit_date,
      note: v.notes
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading medical records...</p>
      </div>
    );
  }

  return (
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
          {visits.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No visit records found</p>
              </CardContent>
            </Card>
          ) : (
            visits.map(visit => (
              <Card key={visit.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {visit.visit_date 
                            ? new Date(visit.visit_date).toLocaleDateString()
                            : 'Date not recorded'}
                        </span>
                        <Badge variant="outline">Visit</Badge>
                      </div>
                      {visit.symptoms && (
                        <p className="text-sm"><strong>Symptoms:</strong> {visit.symptoms}</p>
                      )}
                      {visit.diagnosis && (
                        <p className="text-sm"><strong>Diagnosis:</strong> {visit.diagnosis}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="diagnoses" className="mt-6 space-y-4">
          {diagnoses.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No diagnosis records found</p>
              </CardContent>
            </Card>
          ) : (
            diagnoses.map(diagnosis => (
              <Card key={diagnosis.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{diagnosis.condition}</span>
                        <Badge variant="secondary">{diagnosis.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Recorded on {diagnosis.date 
                          ? new Date(diagnosis.date).toLocaleDateString()
                          : 'Date not available'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-6 space-y-4">
          {doctorNotes.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No doctor notes found</p>
              </CardContent>
            </Card>
          ) : (
            doctorNotes.map(note => (
              <Card key={note.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {note.date 
                          ? new Date(note.date).toLocaleDateString()
                          : 'Date not available'}
                      </span>
                    </div>
                    <p className="text-sm bg-muted p-3 rounded-lg">{note.note}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="discharge" className="mt-6 space-y-4">
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">No discharge summaries available</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientMedicalRecords;
