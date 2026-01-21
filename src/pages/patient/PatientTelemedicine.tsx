import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Video,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Upload,
  RefreshCw,
  Send,
  Phone,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiGet, apiFetch } from "@/lib/api";
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

interface ChatMessage {
  id: number;
  sender_type: 'patient' | 'doctor';
  message: string;
  timestamp: string;
  is_read: boolean;
}

const PatientTelemedicine = () => {
  const { user } = useCustomAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<TeleconsultSession[]>([]);
  const [pastSessions, setPastSessions] = useState<TeleconsultSession[]>([]);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TeleconsultSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Video call state
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [startingCall, setStartingCall] = useState(false);

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

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const openChat = async (session: TeleconsultSession) => {
    setSelectedSession(session);
    setChatOpen(true);
    setLoadingChat(true);
    
    try {
      const res = await apiGet(`/api/dashboard/patient/telemedicine/chat/${session.id}?email=${encodeURIComponent(user?.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat messages');
    } finally {
      setLoadingChat(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;
    
    setSendingMessage(true);
    try {
      const res = await apiFetch(`/api/dashboard/patient/telemedicine/chat/${selectedSession.id}`, {
        method: 'POST',
        body: JSON.stringify({
          email: user?.email,
          message: newMessage.trim()
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, data.message]);
        setNewMessage("");
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const startVideoCall = async (session: TeleconsultSession) => {
    setSelectedSession(session);
    setStartingCall(true);
    
    try {
      const res = await apiFetch(`/api/dashboard/patient/telemedicine/start-video/${session.id}`, {
        method: 'POST',
        body: JSON.stringify({ email: user?.email })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMeetingLink(data.meetingLink);
        setVideoCallOpen(true);
        // Open in new tab
        window.open(data.meetingLink, '_blank');
      } else {
        throw new Error('Failed to start video call');
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
    } finally {
      setStartingCall(false);
    }
  };

  const endVideoCall = async () => {
    if (!selectedSession) return;
    
    try {
      await apiFetch(`/api/dashboard/patient/telemedicine/end-video/${selectedSession.id}`, {
        method: 'POST'
      });
      setVideoCallOpen(false);
      setMeetingLink(null);
      fetchSessions();
      toast.success('Video call ended');
    } catch (error) {
      console.error('Error ending video call:', error);
    }
  };

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
              <div className="p-3 bg-primary/10 rounded-full">
                <Video className="h-6 w-6 text-primary" />
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
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
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
              <div className="p-3 bg-purple-500/10 rounded-full">
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openChat(session)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => startVideoCall(session)}
                      disabled={startingCall}
                    >
                      {startingCall ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Video className="h-4 w-4 mr-1" />
                      )}
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
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openChat(session)}
                    >
                      View Chat
                    </Button>
                    <Button variant="outline" size="sm">View Summary</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-lg h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat with {selectedSession?.doctor_name}
            </DialogTitle>
            <DialogDescription>
              {selectedSession?.specialization}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col min-h-0">
            {loadingChat ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'patient' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.sender_type === 'patient'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_type === 'patient' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
            )}
            
            <div className="flex gap-2 pt-4 border-t">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={sendingMessage}
              />
              <Button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()}>
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Call Dialog */}
      <Dialog open={videoCallOpen} onOpenChange={setVideoCallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Call with {selectedSession?.doctor_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Your video call has started in a new tab. Use the controls below to manage your session.
            </p>
            
            {meetingLink && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Meeting Link:</p>
                <a 
                  href={meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {meetingLink}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open(meetingLink || '', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Rejoin Call
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={endVideoCall}
              >
                <Phone className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientTelemedicine;
