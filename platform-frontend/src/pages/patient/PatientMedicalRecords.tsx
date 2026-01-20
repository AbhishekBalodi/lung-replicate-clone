import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Pill, FlaskConical, Stethoscope, Loader2, Calendar, User } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { toast } from "sonner";
import api from "@/lib/api";

interface Prescription {
  id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  prescribed_date: string;
  doctor_name: string;
}

interface LabTest {
  id: number;
  test_name: string;
  status: string;
  result: string | null;
  prescribed_date: string;
  completed_date: string | null;
  doctor_name: string;
}

interface Procedure {
  id: number;
  procedure_name: string;
  status: string;
  notes: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  doctor_name: string;
}

const PatientMedicalRecords = () => {
  const { user } = useCustomAuth();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  useEffect(() => {
    if (user?.email) {
      fetchMedicalRecords();
    }
  }, [user?.email]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const res = await api.apiGet(`/api/dashboard/patient/medical-records?email=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      
      if (res.ok) {
        setPrescriptions(data.prescriptions || []);
        setLabTests(data.labTests || []);
        setProcedures(data.procedures || []);
      } else {
        throw new Error(data.error || 'Failed to load medical records');
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Medical Records</h1>
        <p className="text-muted-foreground">View your complete medical history (Read Only)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Pill className="h-4 w-4" /> Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Lab Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labTests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Stethoscope className="h-4 w-4" /> Procedures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{procedures.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prescriptions">
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="lab-tests">Lab Tests</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="mt-6 space-y-4">
          {prescriptions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No prescriptions found</p>
              </CardContent>
            </Card>
          ) : (
            prescriptions.map(rx => (
              <Card key={rx.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{rx.medicine_name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {rx.dosage && <span>{rx.dosage}</span>}
                        {rx.frequency && <span> • {rx.frequency}</span>}
                        {rx.duration && <span> • {rx.duration}</span>}
                      </div>
                      {rx.instructions && (
                        <p className="text-sm text-muted-foreground">{rx.instructions}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(rx.prescribed_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Dr. {rx.doctor_name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="lab-tests" className="mt-6 space-y-4">
          {labTests.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No lab tests found</p>
              </CardContent>
            </Card>
          ) : (
            labTests.map(test => (
              <Card key={test.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{test.test_name}</h3>
                      <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                      {test.result && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">Result: {test.result}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(test.prescribed_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Dr. {test.doctor_name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="procedures" className="mt-6 space-y-4">
          {procedures.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No procedures found</p>
              </CardContent>
            </Card>
          ) : (
            procedures.map(proc => (
              <Card key={proc.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{proc.procedure_name}</h3>
                      <Badge variant={proc.status === 'completed' ? 'default' : 'secondary'}>
                        {proc.status}
                      </Badge>
                      {proc.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{proc.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {proc.scheduled_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(proc.scheduled_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Dr. {proc.doctor_name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientMedicalRecords;