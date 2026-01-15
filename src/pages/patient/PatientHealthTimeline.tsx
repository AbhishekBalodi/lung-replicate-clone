import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Pill, FlaskConical, Stethoscope, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import PatientConsoleShell from "@/layouts/PatientConsoleShell";

interface TimelineEvent {
  id: string;
  date: string;
  type: "visit" | "test" | "prescription" | "procedure";
  title: string;
  description: string;
  doctor?: string;
}

const PatientHealthTimeline = () => {
  const [events] = useState<TimelineEvent[]>([
    { id: "1", date: "2026-01-12", type: "test", title: "Lab Tests Ordered", description: "CBC, Blood Glucose, HbA1c, Lipid Profile" },
    { id: "2", date: "2026-01-10", type: "visit", title: "Cardiology Consultation", description: "Regular checkup, ECG normal, BP controlled", doctor: "Dr. Smith" },
    { id: "3", date: "2026-01-10", type: "prescription", title: "Medications Prescribed", description: "Amlodipine 5mg, Metformin 500mg" },
    { id: "4", date: "2026-01-05", type: "visit", title: "Orthopedic Follow-up", description: "Knee pain improved with physiotherapy", doctor: "Dr. Patel" },
    { id: "5", date: "2025-12-28", type: "visit", title: "General Medicine Consultation", description: "Flu symptoms, prescribed antibiotics", doctor: "Dr. Johnson" },
    { id: "6", date: "2025-12-20", type: "test", title: "Vitamin D Test", description: "Result: 18 ng/mL (Low)" },
    { id: "7", date: "2025-11-15", type: "procedure", title: "ECG", description: "Routine ECG - Normal sinus rhythm" },
    { id: "8", date: "2025-06-15", type: "procedure", title: "Appendectomy", description: "Laparoscopic appendix removal - Successful" },
  ]);

  const [healthTrends] = useState([
    { metric: "Blood Pressure", current: "125/82", previous: "135/88", trend: "improved", unit: "mmHg" },
    { metric: "Blood Sugar (Fasting)", current: "110", previous: "120", trend: "improved", unit: "mg/dL" },
    { metric: "Weight", current: "72", previous: "74", trend: "improved", unit: "kg" },
    { metric: "BMI", current: "24.2", previous: "24.8", trend: "improved", unit: "" },
    { metric: "Vitamin D", current: "18", previous: "15", trend: "improving", unit: "ng/mL" },
  ]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "visit":
        return <Stethoscope className="h-4 w-4" />;
      case "test":
        return <FlaskConical className="h-4 w-4" />;
      case "prescription":
        return <Pill className="h-4 w-4" />;
      case "procedure":
        return <Activity className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "visit":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "test":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "prescription":
        return "bg-green-100 text-green-700 border-green-200";
      case "procedure":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "improved" || trend === "improving") {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend === "declined") {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <PatientConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Health Timeline & History</h1>
          <p className="text-muted-foreground">Chronological view of your health journey</p>
        </div>

        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="trends">Health Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
              
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={event.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.title}</span>
                              <Badge variant="outline" className="text-xs capitalize">{event.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            {event.doctor && (
                              <p className="text-sm text-muted-foreground">By {event.doctor}</p>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {healthTrends.map((trend, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{trend.metric}</p>
                        <p className="text-2xl font-bold">
                          {trend.current}
                          {trend.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{trend.unit}</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Previous: {trend.previous} {trend.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.trend)}
                        <Badge variant={trend.trend === "improved" || trend.trend === "improving" ? "default" : "secondary"}>
                          {trend.trend}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Health Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your overall health metrics show positive trends. Blood pressure and blood sugar levels have improved 
                  over the past few months. Continue with your current medication and lifestyle modifications. 
                  Vitamin D levels are still low - ensure you're taking the prescribed supplements regularly.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientConsoleShell>
  );
};

export default PatientHealthTimeline;
