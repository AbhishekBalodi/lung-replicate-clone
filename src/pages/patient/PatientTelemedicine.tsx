import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Upload,
  RefreshCw,
} from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

interface TeleconsultSession {
  id: number;
  doctor_name: string;
  specialization: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  session_type: string;
  meeting_link: string | null;
}

const PatientTelemedicine = () => {
  const { user } = useCustomAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<TeleconsultSession[]>([]);
  const [pastSessions, setPastSessions] = useState<TeleconsultSession[]>([]);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/dashboard/patient/telemedicine/sessions?email=${encodeURIComponent(user?.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        setUpcomingSessions(data.upcomingSessions || []);
        setPastSessions(data.pastSessions || []);
      }
    } catch (error) {
      console.error('Error fetching telemedicine sessions:', error);
      toast.error('Failed to load telemedicine sessions');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchSessions();
    }
  }, [user?.email, fetchSessions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading telemedicine sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Telemedicine</h1>
          <p className="text-muted-foreground">
            Virtual consultations with your doctors
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchSessions}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">Video Consultation</h3>
              <p className="text-sm text-muted-foreground">
                Face-to-face virtual visit with doctor
              </p>
              <Button className="w-full mt-2">Schedule Now</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">Chat Consultation</h3>
              <p className="text-sm text-muted-foreground">
                Text-based consultation with doctor
              </p>
              <Button variant="outline" className="w-full mt-2">Start Chat</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium">Upload Reports</h3>
              <p className="text-sm text-muted-foreground">
                Share images/reports during call
              </p>
              <Button variant="outline" className="w-full mt-2">Upload</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming teleconsultations</p>
              <Button className="mt-4">Schedule a Session</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{session.doctor_name}</span>
                      <Badge variant={session.session_type === "video" ? "default" : "secondary"}>
                        {session.session_type === "video" ? (
                          <>
                            <Video className="h-3 w-3 mr-1" />
                            Video
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.scheduled_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.scheduled_time}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button size="sm" disabled={!session.meeting_link}>
                      <Video className="h-4 w-4 mr-1" />
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Past Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {pastSessions.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No past sessions</p>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{session.doctor_name}</span>
                      <Badge variant="secondary">{session.session_type}</Badge>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.scheduled_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.scheduled_time}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Summary</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientTelemedicine;
