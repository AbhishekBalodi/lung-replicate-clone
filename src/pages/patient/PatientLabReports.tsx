import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Download, Calendar, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

const PatientLabReports = () => {
  // Note: Lab reports would typically come from a lab_results table
  // For now, showing placeholder as no lab_results table exists
  const [reports] = useState<any[]>([]);

  const pendingReports = reports.filter(r => r.status !== "report-ready");
  const completedReports = reports.filter(r => r.status === "report-ready");

  return (
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
                        <span className="font-semibold">{report.testName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
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
                        <span className="font-semibold">{report.testName}</span>
                        <Badge variant="outline">Pending</Badge>
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
  );
};

export default PatientLabReports;
