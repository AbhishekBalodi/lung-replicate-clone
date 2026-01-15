import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Download, Calendar, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import PatientConsoleShell from "@/layouts/PatientConsoleShell";

interface LabReport {
  id: string;
  testName: string;
  date: string;
  status: "ordered" | "sample-collected" | "report-ready";
  result?: string;
  normalRange?: string;
  indicator?: "normal" | "high" | "low";
}

const PatientLabReports = () => {
  const [reports] = useState<LabReport[]>([
    { id: "1", testName: "Complete Blood Count (CBC)", date: "2026-01-12", status: "report-ready", result: "Normal", indicator: "normal" },
    { id: "2", testName: "Blood Glucose (Fasting)", date: "2026-01-12", status: "report-ready", result: "110 mg/dL", normalRange: "70-100 mg/dL", indicator: "high" },
    { id: "3", testName: "HbA1c", date: "2026-01-12", status: "report-ready", result: "6.2%", normalRange: "< 5.7%", indicator: "high" },
    { id: "4", testName: "Lipid Profile", date: "2026-01-15", status: "sample-collected" },
    { id: "5", testName: "Thyroid Panel", date: "2026-01-15", status: "ordered" },
    { id: "6", testName: "Vitamin D", date: "2025-12-20", status: "report-ready", result: "18 ng/mL", normalRange: "30-100 ng/mL", indicator: "low" },
  ]);

  const pendingReports = reports.filter(r => r.status !== "report-ready");
  const completedReports = reports.filter(r => r.status === "report-ready");

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      "ordered": { variant: "outline", label: "Ordered" },
      "sample-collected": { variant: "secondary", label: "Sample Collected" },
      "report-ready": { variant: "default", label: "Ready" }
    };
    const config = variants[status] || variants.ordered;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getIndicatorIcon = (indicator?: string) => {
    switch (indicator) {
      case "high":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case "low":
        return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case "normal":
        return <Minus className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getIndicatorBadge = (indicator?: string) => {
    switch (indicator) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "low":
        return <Badge className="bg-orange-500">Low</Badge>;
      case "normal":
        return <Badge className="bg-green-500">Normal</Badge>;
      default:
        return null;
    }
  };

  return (
    <PatientConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Lab & Diagnostic Reports</h1>
          <p className="text-muted-foreground">View your test results (Read-Only)</p>
        </div>

        <Tabs defaultValue="completed">
          <TabsList>
            <TabsTrigger value="completed">Results ({completedReports.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedReports.map(report => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold">{report.testName}</span>
                        {getIndicatorBadge(report.indicator)}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">Result:</span>
                        <span className="font-medium flex items-center gap-1">
                          {getIndicatorIcon(report.indicator)}
                          {report.result}
                        </span>
                        {report.normalRange && (
                          <>
                            <span className="text-muted-foreground">|</span>
                            <span className="text-muted-foreground">Normal: {report.normalRange}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                          <span className="font-semibold">{report.testName}</span>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Ordered on {new Date(report.date).toLocaleDateString()}</span>
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
            <div className="flex gap-6 text-sm">
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
    </PatientConsoleShell>
  );
};

export default PatientLabReports;
