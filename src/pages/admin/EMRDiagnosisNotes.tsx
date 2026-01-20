import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Calendar, User, Edit, Trash2, Save, RefreshCw, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

interface DiagnosisNote {
  id: number;
  patient_id: number | null;
  patient_name: string;
  diagnosis: string;
  symptoms: string;
  notes: string;
  status: "draft" | "final";
  created_at: string;
}

export default function EMRDiagnosisNotes() {
  const [notes, setNotes] = useState<DiagnosisNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "", diagnosis: "", symptoms: "", notes: "", status: "draft" as "draft" | "final"
  });

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/dashboard/emr/diagnosis-notes?search=${searchTerm}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error('Error fetching diagnosis notes:', err);
      toast.error('Failed to load diagnosis notes');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async () => {
    if (!formData.patient_name.trim() || !formData.diagnosis.trim()) {
      toast.error('Patient name and diagnosis are required');
      return;
    }
    
    try {
      const res = await apiPost('/api/dashboard/emr/diagnosis-notes', formData);
      if (res.ok) {
        toast.success('Diagnosis note added successfully');
        setIsDialogOpen(false);
        setFormData({ patient_name: "", diagnosis: "", symptoms: "", notes: "", status: "draft" });
        fetchNotes();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add note');
      }
    } catch (err) {
      toast.error('Failed to add diagnosis note');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const res = await apiDelete(`/api/dashboard/emr/diagnosis-notes/${id}`);
      if (res.ok) {
        toast.success('Note deleted');
        fetchNotes();
      }
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Patient', 'Diagnosis', 'Symptoms', 'Notes', 'Status', 'Date'].join(','),
      ...notes.map(n => [n.id, n.patient_name, n.diagnosis, n.symptoms, n.notes, n.status, n.created_at].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagnosis_notes.csv';
    a.click();
    toast.success('Export completed');
  };

  const filteredNotes = notes.filter(note =>
    note.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diagnosis Notes</h1>
            <p className="text-muted-foreground">Create and manage patient diagnosis records</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchNotes}><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-2" />New Diagnosis</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Diagnosis Note</DialogTitle>
                  <DialogDescription>Enter diagnosis details for the patient</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Patient Name *</Label>
                      <Input placeholder="Enter patient name" value={formData.patient_name} onChange={e => setFormData({ ...formData, patient_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value: "draft" | "final") => setFormData({ ...formData, status: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="final">Final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosis *</Label>
                    <Input placeholder="Enter diagnosis" value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Symptoms</Label>
                    <Textarea placeholder="List symptoms" value={formData.symptoms} onChange={e => setFormData({ ...formData, symptoms: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Clinical Notes</Label>
                    <Textarea placeholder="Enter detailed clinical notes" className="min-h-[100px]" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700"><Save className="h-4 w-4 mr-2" />Save Note</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by patient or diagnosis..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No diagnosis notes found</div>
        ) : (
          <div className="grid gap-4">
            {filteredNotes.map(note => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{note.patient_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(note.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={note.status === "final" ? "default" : "secondary"}>
                        {note.status === "final" ? "Final" : "Draft"}
                      </Badge>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(note.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Diagnosis:</span>
                    <p className="font-medium text-emerald-700">{note.diagnosis}</p>
                  </div>
                  {note.symptoms && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Symptoms:</span>
                      <p className="text-sm">{note.symptoms}</p>
                    </div>
                  )}
                  {note.notes && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                      <p className="text-sm text-muted-foreground">{note.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ConsoleShell>
  );
}
