import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Video, MessageSquare, Phone, Calendar, Clock, Play, FileText, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";

interface TelemedicineSession {
  id: number;
  patient_id: number | null;
  patient_name: string;
  type: "video" | "chat" | "phone";
  scheduled_time: string;
  duration: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes?: string;
  phone?: string;
  email?: string;
}

interface Summary {
  today: number;
  video: number;
  chat: number;
  completed: number;
}

export default function Telemedicine() {
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [summary, setSummary] = useState<Summary>({ today: 0, video: 0, chat: 0, completed: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "",
    type: "video" as "video" | "chat" | "phone",
    scheduled_time: "",
    duration: "30 min",
    notes: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, sessionsRes] = await Promise.all([
        apiGet("/api/dashboard/telemedicine/summary"),
        apiGet(`/api/dashboard/telemedicine/sessions?status=${activeTab}`)
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching telemedicine data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSession = async () => {
    if (!formData.patient_name || !formData.scheduled_time) {
      toast.error("Patient name and scheduled time are required");
      return;
    }

    try {
      const res = await apiPost("/api/dashboard/telemedicine/sessions", formData);
      if (res.ok) {
        const data = await res.json();
        toast.success("Session scheduled successfully");
        setIsDialogOpen(false);
        setFormData({ patient_name: "", type: "video", scheduled_time: "", duration: "30 min", notes: "" });
        if (data.session) {
          setSessions(prev => [data.session, ...prev]);
        } else {
          fetchData();
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to schedule session");
      }
    } catch (error) {
      toast.error("Failed to schedule session");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await apiPut(`/api/dashboard/telemedicine/sessions/${id}`, { status });
      if (res.ok) {
        toast.success("Session updated");
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status: status as any } : s));
      }
    } catch (error) {
      toast.error("Failed to update session");
    }
  };

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

  const filteredSessions = sessions.filter(s =>
    s.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingSessions = filteredSessions.filter(s => s.status === "scheduled" || s.status === "in-progress");
  const pastSessions = filteredSessions.filter(s => s.status === "completed" || s.status === "cancelled");

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Telemedicine</h1>
            <p className="text-muted-foreground">Manage video consultations and patient chat</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Telemedicine Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Patient Name</Label>
                    <Input
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <Label>Session Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="chat">Chat</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Scheduled Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15 min">15 minutes</SelectItem>
                        <SelectItem value="30 min">30 minutes</SelectItem>
                        <SelectItem value="45 min">45 minutes</SelectItem>
                        <SelectItem value="60 min">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Session notes..."
                    />
                  </div>
                  <Button onClick={handleAddSession} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Schedule Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                  <div className="text-2xl font-bold">{summary.today}</div>
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
                  <div className="text-2xl font-bold">{summary.video}</div>
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
                  <div className="text-2xl font-bold">{summary.chat}</div>
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
                  <div className="text-2xl font-bold">{summary.completed}</div>
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
            {loading ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {upcomingSessions.map((session) => (
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
                              <h3 className="font-medium">{session.patient_name}</h3>
                              <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{session.notes}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Calendar className="h-4 w-4" />
                              {new Date(session.scheduled_time).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {new Date(session.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              Notes
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus(session.id, 'in-progress')}>
                              <Play className="h-4 w-4 mr-1" />
                              Join
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {upcomingSessions.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                      <p className="text-muted-foreground">Schedule a new telemedicine session</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <div className="grid gap-4">
              {pastSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                          {getTypeIcon(session.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.patient_name}</h3>
                            <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-muted-foreground">
                          {new Date(session.scheduled_time).toLocaleDateString()} • {session.duration}
                        </div>
                        <Button variant="outline" size="sm">
                          View Summary
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pastSessions.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No past sessions
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
