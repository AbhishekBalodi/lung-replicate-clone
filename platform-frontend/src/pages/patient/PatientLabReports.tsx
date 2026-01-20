import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Calendar, User, Loader2, Download, Eye } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { toast } from "sonner";
import api from "@/lib/api";

interface LabReport {
  id: number;
  test_name: string;
  status: string;
  result: string | null;
  notes: string | null;
  prescribed_date: string;
  completed_date: string | null;
  doctor_name: string;
  category: string | null;
  sample_type: string | null;
}

const PatientLabReports = () => {
  const { user } = useCustomAuth();
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchLabReports();
    }
  }, [user?.email]);

  const fetchLabReports = async () => {
    try {
      setLoading(true);
      const res = await api.apiGet(`/api/dashboard/patient/lab-reports?email=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      
      if (res.ok) {
        setLabReports(data.labReports || []);
      } else {
        throw new Error(data.error || 'Failed to load lab reports');
      }
    } catch (error) {
      console.error('Error fetching lab reports:', error);
      toast.error('Failed to load lab reports');
    } finally {
      setLoading(false);
    }
  };

  const pendingReports = labReports.filter(r => r.status !== 'completed');
  const completedReports = labReports.filter(r => r.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary">In Progress</Badge>;
      case 'sample_collected':
        return <Badge variant="secondary">Sample Collected</Badge>;
      default:
        return <Badge variant="outline">Ordered</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const LabReportCard = ({ report }: { report: LabReport }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
              <FlaskConical className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{report.test_name}</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {report.category && (
                  <Badge variant="outline">{report.category}</Badge>
                )}
                {report.sample_type && (
                  <span className="text-muted-foreground">Sample: {report.sample_type}</span>
                )}
              </div>
              {report.notes && (
                <p className="text-sm text-muted-foreground mt-2">{report.notes}</p>
              )}
              {report.result && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Result:</strong> {report.result}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(report.status)}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
              <Calendar className="h-3 w-3" />
              {new Date(report.prescribed_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              Dr. {report.doctor_name}
            </div>
            {report.status === 'completed' && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lab Reports</h1>
        <p className="text-muted-foreground">View your laboratory test results</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingReports.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting results</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{completedReports.length}</div>
            <p className="text-xs text-muted-foreground">Results available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labReports.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending lab reports</p>
              </CardContent>
            </Card>
          ) : (
            pendingReports.map(report => (
              <LabReportCard key={report.id} report={report} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedReports.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No completed lab reports</p>
              </CardContent>
            </Card>
          ) : (
            completedReports.map(report => (
              <LabReportCard key={report.id} report={report} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientLabReports;