import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Video, MessageSquare, Phone, User, Calendar, Clock, Play, FileText, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TelemedicineSession {
  id: number;
  patientName: string;
  type: "video" | "chat" | "phone";
  scheduledTime: string;
  duration: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes?: string;
}

const mockSessions: TelemedicineSession[] = [
  { id: 1, patientName: "Rahul Sharma", type: "video", scheduledTime: "2026-01-15T10:00:00", duration: "30 min", status: "scheduled", notes: "Diabetes follow-up" },
  { id: 2, patientName: "Priya Patel", type: "chat", scheduledTime: "2026-01-15T11:30:00", duration: "15 min", status: "scheduled", notes: "Prescription clarification" },
  { id: 3, patientName: "Amit Kumar", type: "video", scheduledTime: "2026-01-14T14:00:00", duration: "20 min", status: "completed", notes: "Post-treatment review" },
  { id: 4, patientName: "Sneha Gupta", type: "phone", scheduledTime: "2026-01-14T09:00:00", duration: "10 min", status: "completed", notes: "Lab results discussion" },
];

export default function Telemedicine() {
  const [sessions, setSessions] = useState<TelemedicineSession[]>(mockSessions);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-5 w-5" />;
      case "chat": return <MessageSquare className="h-5 w-5" />;
      case "phone": return <Phone className="h-5 w-5" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-emerald-100 text-emerald-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const upcomingSessions = sessions.filter(s => s.status === "scheduled" || s.status === "in-progress");
  const pastSessions = sessions.filter(s => s.status === "completed" || s.status === "cancelled");

  const filteredSessions = (activeTab === "upcoming" ? upcomingSessions : pastSessions).filter(s =>
    s.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    today: sessions.filter(s => {
      const sessionDate = new Date(s.scheduledTime).toDateString();
      return sessionDate === new Date().toDateString() && s.status === "scheduled";
    }).length,
    video: sessions.filter(s => s.type === "video" && s.status === "scheduled").length,
    chat: sessions.filter(s => s.type === "chat" && s.status === "scheduled").length,
    completed: sessions.filter(s => s.status === "completed").length,
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Telemedicine</h1>
            <p className="text-muted-foreground">Manage video consultations and patient chat</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Video className="h-4 w-4 mr-2" />
              Start Video Call
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.today}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.video}</div>
                  <div className="text-sm text-muted-foreground">Video Calls</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.chat}</div>
                  <div className="text-sm text-muted-foreground">Chat Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
              <TabsTrigger value="past">Past Sessions ({pastSessions.length})</TabsTrigger>
            </TabsList>
            <div className="relative max-w-md w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="upcoming" className="mt-4">
            <div className="grid gap-4">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          session.type === "video" ? "bg-purple-100 text-purple-600" :
                          session.type === "chat" ? "bg-emerald-100 text-emerald-600" :
                          "bg-blue-100 text-blue-600"
                        }`}>
                          {getTypeIcon(session.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.patientName}</h3>
                            <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.scheduledTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {new Date(session.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Notes
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                            <Play className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredSessions.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                    <p className="text-muted-foreground">Schedule a new telemedicine session</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <div className="grid gap-4">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-600`}>
                          {getTypeIcon(session.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.patientName}</h3>
                            <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-muted-foreground">
                          {new Date(session.scheduledTime).toLocaleDateString()} • {session.duration}
                        </div>
                        <Button variant="outline" size="sm">
                          View Summary
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
