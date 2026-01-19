import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Pill, FlaskConical, Stethoscope, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TimelineEvent {
  id: string;
  date: string;
  type: "visit" | "prescription" | "test";
  title: string;
  description: string;
}

const PatientHealthTimeline = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      const timelineEvents: TimelineEvent[] = [];

      // Fetch visits
      const { data: visits } = await supabase
        .from('patient_visits')
        .select('*')
        .order('visit_date', { ascending: false });

      if (visits) {
        visits.forEach(visit => {
          timelineEvents.push({
            id: `visit-${visit.id}`,
            date: visit.visit_date || '',
            type: 'visit',
            title: 'Medical Visit',
            description: visit.diagnosis || visit.symptoms || 'Consultation'
          });
        });
      }

      // Fetch prescriptions
      const { data: prescriptions } = await supabase
        .from('prescribed_medicines')
        .select('*')
        .order('prescribed_date', { ascending: false });

      if (prescriptions) {
        prescriptions.forEach(rx => {
          timelineEvents.push({
            id: `rx-${rx.id}`,
            date: rx.prescribed_date || '',
            type: 'prescription',
            title: 'Medication Prescribed',
            description: `${rx.medicine_name} - ${rx.dosage || ''} ${rx.frequency || ''}`
          });
        });
      }

      // Sort by date
      timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(timelineEvents);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "visit":
        return <Stethoscope className="h-4 w-4" />;
      case "prescription":
        return <Pill className="h-4 w-4" />;
      case "test":
        return <FlaskConical className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "visit":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "prescription":
        return "bg-green-100 text-green-700 border-green-200";
      case "test":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading health timeline...</p>
      </div>
    );
  }

  return (
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
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No health events recorded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
              
              <div className="space-y-4">
                {events.map((event) => (
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
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'Date not recorded'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardContent className="py-10 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Health trends will be available once more data is recorded</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientHealthTimeline;
