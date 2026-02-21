import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Download, Printer, Calendar, Info, RefreshCw } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Prescription {
  id: string;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  prescribed_date: string | null;
}

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/dashboard/patient/prescriptions');
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.prescriptions || data || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Consider prescriptions from last 30 days as "current"
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const currentPrescriptions = prescriptions.filter(p => {
    if (!p.prescribed_date) return true;
    return new Date(p.prescribed_date) >= thirtyDaysAgo;
  });
  
  const pastPrescriptions = prescriptions.filter(p => {
    if (!p.prescribed_date) return false;
    return new Date(p.prescribed_date) < thirtyDaysAgo;
  });

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-lg">{prescription.medicine_name}</span>
              <Badge variant="default">Active</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Dosage</span>
                <span className="font-medium">{prescription.dosage || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Frequency</span>
                <span className="font-medium">{prescription.frequency || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Duration</span>
                <span className="font-medium">{prescription.duration || 'As directed'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Prescribed Date</span>
                <span className="font-medium">
                  {prescription.prescribed_date 
                    ? new Date(prescription.prescribed_date).toLocaleDateString()
                    : 'Not recorded'}
                </span>
              </div>
            </div>

            {prescription.instructions && (
              <div className="flex items-start gap-2 bg-muted p-3 rounded-lg">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm">{prescription.instructions}</span>
              </div>
            )}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading prescriptions...</p>
      </div>
    );
  }

  return (
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
  );
};

export default PatientPrescriptions;
