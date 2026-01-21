import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Pill, FlaskConical, Stethoscope, Activity, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

interface TimelineEvent {
  type: string;
  id: number;
  title: string;
  description: string;
  event_date: string;
  doctor_name: string | null;
}

const PatientHealthTimeline = () => {
  const { user } = useCustomAuth();
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      const res = await apiGet(`/api/dashboard/patient/timeline?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      
      if (res.ok) {
        setTimeline(data.timeline || []);
      } else {
        throw new Error(data.error || 'Failed to load health timeline');
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast.error('Failed to load health timeline');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'prescription':
        return <Pill className="h-4 w-4" />;
      case 'lab_test':
        return <FlaskConical className="h-4 w-4" />;
      default:
        return <Stethoscope className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-primary text-primary-foreground';
      case 'prescription':
        return 'bg-emerald-500 text-white';
      case 'lab_test':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Badge className="bg-primary/10 text-primary">Appointment</Badge>;
      case 'prescription':
        return <Badge className="bg-emerald-500/10 text-emerald-600">Prescription</Badge>;
      case 'lab_test':
        return <Badge className="bg-purple-500/10 text-purple-600">Lab Test</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  // Group events by month
  const groupedTimeline = timeline.reduce((acc, event) => {
    const date = new Date(event.event_date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Timeline</h1>
          <p className="text-muted-foreground">Your complete health history</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchTimeline}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="trends">Health Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          {timeline.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No health records found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your health timeline will appear here as you visit the clinic
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedTimeline).map(([monthYear, events]) => (
                <div key={monthYear}>
                  <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-background py-2">
                    {monthYear}
                  </h2>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={`${event.type}-${event.id}`} className="relative pl-10">
                          {/* Timeline dot */}
                          <div className={`absolute left-2 top-3 w-5 h-5 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                            {getEventIcon(event.type)}
                          </div>
                          
                          <Card>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{event.title}</h3>
                                    {getTypeBadge(event.type)}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {event.description}
                                  </p>
                                  {event.doctor_name && (
                                    <p className="text-sm text-muted-foreground">
                                      Dr. {event.doctor_name}
                                    </p>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground whitespace-nowrap">
                                  {new Date(event.event_date).toLocaleDateString()}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardContent className="py-10 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Health trends will be available once more data is recorded
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientHealthTimeline;
