import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Calendar, User, Loader2, FileText } from "lucide-react";
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
  specialization: string | null;
}

const PatientPrescriptions = () => {
  const { user } = useCustomAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchPrescriptions();
    }
  }, [user?.email]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.apiGet(`/api/dashboard/patient/prescriptions?email=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      
      if (res.ok) {
        setPrescriptions(data.prescriptions || []);
      } else {
        throw new Error(data.error || 'Failed to load prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  // Group prescriptions by date for "active" view (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const activePrescriptions = prescriptions.filter(p => new Date(p.prescribed_date) >= thirtyDaysAgo);
  const pastPrescriptions = prescriptions.filter(p => new Date(p.prescribed_date) < thirtyDaysAgo);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
              <Pill className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{prescription.medicine_name}</h3>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {prescription.dosage && <span>{prescription.dosage}</span>}
                {prescription.frequency && <span>• {prescription.frequency}</span>}
                {prescription.duration && <span>• {prescription.duration}</span>}
              </div>
              {prescription.instructions && (
                <p className="text-sm text-muted-foreground mt-2">
                  <FileText className="h-3 w-3 inline mr-1" />
                  {prescription.instructions}
                </p>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(prescription.prescribed_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <User className="h-3 w-3" />
              Dr. {prescription.doctor_name}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Prescriptions</h1>
        <p className="text-muted-foreground">View your medication history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activePrescriptions.length}</div>
            <p className="text-xs text-muted-foreground">From the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {new Set(prescriptions.map(p => p.medicine_name)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different medicines prescribed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({activePrescriptions.length})</TabsTrigger>
          <TabsTrigger value="history">History ({pastPrescriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activePrescriptions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active prescriptions</p>
              </CardContent>
            </Card>
          ) : (
            activePrescriptions.map(rx => (
              <PrescriptionCard key={rx.id} prescription={rx} />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {pastPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No past prescriptions</p>
              </CardContent>
            </Card>
          ) : (
            pastPrescriptions.map(rx => (
              <PrescriptionCard key={rx.id} prescription={rx} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientPrescriptions;