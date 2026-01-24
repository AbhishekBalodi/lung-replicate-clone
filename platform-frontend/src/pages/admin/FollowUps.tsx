import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, User, Phone, Mail, Bell, CheckCircle2, Clock, AlertCircle, RefreshCw, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiGet, apiPost, apiPut } from "@/lib/api";

interface FollowUp {
  id: number;
  patient_id: number | null;
  patient_name: string;
  phone: string;
  email: string;
  follow_up_date: string;
  reason: string;
  reminder_sent: boolean;
  status: "pending" | "completed" | "overdue" | "cancelled";
  notes: string;
}

interface Summary {
  total: number;
  pending: number;
  overdue: number;
  today: number;
}

export default function FollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, pending: 0, overdue: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "completed">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "", follow_up_date: "", reason: "", notes: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, listRes] = await Promise.all([
        apiGet('/api/dashboard/follow-ups/summary'),
        apiGet(`/api/dashboard/follow-ups?status=${filter}&search=${searchTerm}`)
      ]);
      
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
      
      if (listRes.ok) {
        const data = await listRes.json();
        setFollowUps(data.followUps || []);
      }
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
      toast.error('Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!formData.patient_name.trim() || !formData.follow_up_date) {
      toast.error('Patient name and date are required');
      return;
    }
    
    try {
      const res = await apiPost('/api/dashboard/follow-ups', formData);
      if (res.ok) {
        toast.success('Follow-up scheduled successfully');
        setIsDialogOpen(false);
        setFormData({ patient_name: "", follow_up_date: "", reason: "", notes: "" });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add follow-up');
      }
    } catch (err) {
      toast.error('Failed to schedule follow-up');
    }
  };

  const markComplete = async (id: number) => {
    try {
      const res = await apiPut(`/api/dashboard/follow-ups/${id}/complete`, {});
      if (res.ok) {
        toast.success('Follow-up marked complete');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update follow-up');
    }
  };

  const toggleReminder = async (id: number, nextValue: boolean) => {
    // Optimistic UI update
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, reminder_sent: nextValue } : f)));

    try {
      const followUp = followUps.find((f) => f.id === id);
      if (!followUp) return;

      // Backend table typically stores only pending/completed; 'overdue' is a UI-enriched status.
      const safeStatus = followUp.status === 'overdue' ? 'pending' : followUp.status;

      const res = await apiPut(`/api/dashboard/follow-ups/${id}`, {
        follow_up_date: followUp.follow_up_date,
        reason: followUp.reason,
        notes: followUp.notes,
        status: safeStatus,
        reminder_sent: nextValue,
      });

      if (!res.ok) {
        throw new Error('Failed');
      }

      fetchData();
    } catch (err) {
      // Revert on error
      setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, reminder_sent: !nextValue } : f)));
      toast.error('Failed to update reminder');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Patient', 'Phone', 'Email', 'Date', 'Reason', 'Status', 'Notes'].join(','),
      ...followUps.map(f => [f.id, f.patient_name, f.phone, f.email, f.follow_up_date, f.reason, f.status, f.notes].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'follow_ups.csv';
    a.click();
    toast.success('Export completed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-amber-600" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "overdue": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800";
      case "completed": return "bg-emerald-100 text-emerald-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Follow-Ups & Care Plans</h1>
            <p className="text-muted-foreground">Manage patient follow-ups and send reminders</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-2" />Schedule Follow-Up</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Follow-Up</DialogTitle>
                  <DialogDescription>Enter follow-up details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div><Label>Patient Name *</Label><Input value={formData.patient_name} onChange={e => setFormData({...formData, patient_name: e.target.value})} /></div>
                  <div><Label>Follow-Up Date *</Label><Input type="date" value={formData.follow_up_date} onChange={e => setFormData({...formData, follow_up_date: e.target.value})} /></div>
                  <div><Label>Reason</Label><Input value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} /></div>
                  <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
                  <Button onClick={handleSubmit} className="w-full">Schedule</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-emerald-600">{summary.total}</div><div className="text-sm text-muted-foreground">Total Follow-Ups</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-amber-600">{summary.pending}</div><div className="text-sm text-muted-foreground">Pending</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-red-600">{summary.overdue}</div><div className="text-sm text-muted-foreground">Overdue</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{summary.today}</div><div className="text-sm text-muted-foreground">Due Today</div></CardContent></Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search patients..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "overdue", "completed"].map(status => (
              <Button key={status} variant={filter === status ? "default" : "outline"} size="sm" onClick={() => setFilter(status as any)} className={filter === status ? "bg-emerald-600" : ""}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : followUps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No follow-ups found</div>
        ) : (
          <div className="grid gap-4">
            {followUps.map(followUp => (
              <Card key={followUp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{followUp.patient_name}</h3>
                          <Badge className={getStatusColor(followUp.status)}>
                            {getStatusIcon(followUp.status)}
                            <span className="ml-1">{followUp.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{followUp.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          {followUp.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{followUp.phone}</span>}
                          {followUp.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{followUp.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="text-center md:text-right">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Calendar className="h-4 w-4" />
                          {new Date(followUp.follow_up_date).toLocaleDateString()}
                        </div>
                        {followUp.notes && <div className="text-xs text-muted-foreground mt-1">{followUp.notes}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Switch id={`reminder-${followUp.id}`} checked={!!followUp.reminder_sent} onCheckedChange={(checked) => toggleReminder(followUp.id, checked)} />
                          <Label htmlFor={`reminder-${followUp.id}`} className="text-xs"><Bell className="h-3 w-3" /></Label>
                        </div>
                        {followUp.status !== "completed" && (
                          <Button variant="outline" size="sm" onClick={() => markComplete(followUp.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ConsoleShell>
  );
}
