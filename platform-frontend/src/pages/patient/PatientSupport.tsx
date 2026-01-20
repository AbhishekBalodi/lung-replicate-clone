import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageSquare, Phone, Mail, Clock, CheckCircle, AlertCircle, Plus, RefreshCw } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  category: string;
  status: "open" | "in-progress" | "resolved";
  created_at: string;
  last_update: string;
}

const PatientSupport = () => {
  const { user } = useCustomAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [newTicket, setNewTicket] = useState({ category: "", subject: "", description: "" });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/dashboard/patient/support/tickets?email=${encodeURIComponent(user?.email || '')}`);
      if (res.ok) { const data = await res.json(); setTickets(data.tickets || []); }
    } catch (error) { console.error('Error fetching tickets:', error); toast.error('Failed to load support tickets'); } 
    finally { setLoading(false); }
  }, [user?.email]);

  useEffect(() => { if (user?.email) fetchTickets(); }, [user?.email, fetchTickets]);

  const handleSubmitTicket = async () => {
    if (!newTicket.category || !newTicket.subject || !newTicket.description) { toast.error('Please fill all fields'); return; }
    try {
      setSubmitting(true);
      const res = await apiPost('/api/dashboard/patient/support/tickets', { email: user?.email, category: newTicket.category, subject: newTicket.subject, description: newTicket.description });
      if (res.ok) { const data = await res.json(); setTickets(prev => [data.ticket, ...prev]); toast.success("Ticket submitted. We'll get back to you within 24 hours."); setNewTicket({ category: "", subject: "", description: "" }); setShowNewTicket(false); } 
      else toast.error('Failed to submit ticket');
    } catch (error) { console.error('Error submitting ticket:', error); toast.error('Failed to submit ticket'); } 
    finally { setSubmitting(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge variant="secondary" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Resolved</Badge>;
      case "in-progress": return <Badge className="flex items-center gap-1"><Clock className="h-3 w-3" />In Progress</Badge>;
      default: return <Badge variant="outline" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Open</Badge>;
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Loading support tickets...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Helpdesk & Support</h1><p className="text-muted-foreground">Get help with any issues or questions</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchTickets}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => setShowNewTicket(true)}><Plus className="h-4 w-4 mr-2" />New Ticket</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-primary/10 rounded-full"><Phone className="h-6 w-6 text-primary" /></div><div><p className="font-medium">Call Us</p><p className="text-sm text-muted-foreground">+91 1800-123-4567</p><p className="text-xs text-muted-foreground">Mon-Sat, 8AM-8PM</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-secondary rounded-full"><Mail className="h-6 w-6 text-secondary-foreground" /></div><div><p className="font-medium">Email Us</p><p className="text-sm text-muted-foreground">support@hospital.com</p><p className="text-xs text-muted-foreground">Response within 24hrs</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-accent rounded-full"><MessageSquare className="h-6 w-6 text-accent-foreground" /></div><div><p className="font-medium">Live Chat</p><p className="text-sm text-muted-foreground">Chat with support</p><p className="text-xs text-muted-foreground">Available 24/7</p></div></div></CardContent></Card>
      </div>

      {showNewTicket && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Submit a Support Ticket</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Category</Label><Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="technical">Technical Issue</SelectItem><SelectItem value="billing">Billing & Payment</SelectItem><SelectItem value="appointment">Appointment Related</SelectItem><SelectItem value="reports">Reports & Documents</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Subject</Label><Input placeholder="Brief description of your issue" value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Please describe your issue in detail..." value={newTicket.description} onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} rows={5} /></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setShowNewTicket(false)}>Cancel</Button><Button onClick={handleSubmitTicket} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Ticket'}</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>My Support Tickets</CardTitle></CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground"><HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No support tickets</p></div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2"><span className="font-mono text-sm text-muted-foreground">{ticket.ticket_number}</span><Badge variant="outline">{ticket.category}</Badge>{getStatusBadge(ticket.status)}</div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">Created: {new Date(ticket.created_at).toLocaleDateString()} • Last update: {new Date(ticket.last_update).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSupport;
