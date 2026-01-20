import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Download, Calendar, RefreshCw, AlertCircle, User } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<LabReport[]>([]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/dashboard/patient/lab-reports?email=${encodeURIComponent(user?.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.labReports || []);
      }
    } catch (error) {
      console.error('Error fetching lab reports:', error);
      toast.error('Failed to load lab reports');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchReports();
    }
  }, [user?.email, fetchReports]);

  const pendingReports = reports.filter(r => r.status !== 'completed' && r.status !== 'report-ready');
  const completedReports = reports.filter(r => r.status === 'completed' || r.status === 'report-ready');

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'report-ready':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="default">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading lab reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lab & Diagnostic Reports</h1>
          <p className="text-muted-foreground">View your test results (Read-Only)</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchReports}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="completed">
        <TabsList>
          <TabsTrigger value="completed">Results ({completedReports.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedReports.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No lab reports available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Lab reports will appear here once they are completed
                </p>
              </CardContent>
            </Card>
          ) : (
            completedReports.map(report => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold">{report.test_name}</span>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.completed_date || report.prescribed_date).toLocaleDateString()}
                        </span>
                        {report.doctor_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {report.doctor_name}
                          </span>
                        )}
                      </div>
                      {report.result && (
                        <p className="text-sm">
                          <span className="font-medium">Result:</span> {report.result}
                        </p>
                      )}
                      {report.category && (
                        <Badge variant="outline">{report.category}</Badge>
                      )}
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

        <TabsContent value="pending" className="mt-6 space-y-4">
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No pending tests</p>
              </CardContent>
            </Card>
          ) : (
            pendingReports.map(report => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold">{report.test_name}</span>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Ordered on {new Date(report.prescribed_date).toLocaleDateString()}
                        </span>
                        {report.doctor_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {report.doctor_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Understanding Your Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Normal</Badge>
              <span className="text-muted-foreground">Within normal range</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">High</Badge>
              <span className="text-muted-foreground">Above normal range</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500">Low</Badge>
              <span className="text-muted-foreground">Below normal range</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientLabReports;
