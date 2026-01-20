import { useState, useEffect } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, FileText, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface ProgressNote {
  id: number;
  patient_id: number | null;
  patient_name: string;
  note_type: string;
  content: string;
  vitals: string;
  doctor_id: number | null;
  created_at: string;
}

interface SOAPContent {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export default function EMRProgressNotes() {
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '', subjective: '', objective: '', assessment: '', plan: '', author: ''
  });

  useEffect(() => {
    fetchNotes();
  }, [searchTerm]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const res = await apiFetch(`/api/dashboard/emr/progress-notes?${params}`).then(r => r.json());
      setNotes(res.notes || []);
      // Auto-expand first note if exists
      if (res.notes?.length > 0 && expandedNotes.size === 0) {
        setExpandedNotes(new Set([res.notes[0].id]));
      }
    } catch (error) {
      console.error('Failed to fetch progress notes:', error);
      toast.error('Failed to load progress notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.patient_name) {
      toast.error('Patient name is required');
      return;
    }
    try {
      const content = JSON.stringify({
        subjective: formData.subjective,
        objective: formData.objective,
        assessment: formData.assessment,
        plan: formData.plan,
        author: formData.author
      });
      await apiFetch('/api/dashboard/emr/progress-notes', {
        method: 'POST',
        body: JSON.stringify({
          patient_name: formData.patient_name,
          note_type: 'SOAP',
          content: content,
          vitals: formData.objective
        })
      });
      toast.success('Progress note created successfully');
      setIsModalOpen(false);
      setFormData({ patient_name: '', subjective: '', objective: '', assessment: '', plan: '', author: '' });
      fetchNotes();
    } catch (error) {
      toast.error('Failed to create progress note');
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotes(newExpanded);
  };

  const parseSOAPContent = (content: string): SOAPContent => {
    try {
      const parsed = JSON.parse(content);
      return {
        subjective: parsed.subjective || '',
        objective: parsed.objective || '',
        assessment: parsed.assessment || '',
        plan: parsed.plan || ''
      };
    } catch {
      return { subjective: content, objective: '', assessment: '', plan: '' };
    }
  };

  const getAuthor = (content: string): string => {
    try {
      const parsed = JSON.parse(content);
      return parsed.author || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Progress Notes (SOAP)</h1>
            <p className="text-muted-foreground">Document patient progress with SOAP format</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Progress Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Progress Note</DialogTitle>
                <DialogDescription>Enter the SOAP note details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_name">Patient Name *</Label>
                    <Input id="patient_name" value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author / Doctor</Label>
                    <Input id="author" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjective" className="text-blue-700">S - Subjective</Label>
                  <Textarea id="subjective" rows={2} placeholder="Patient's symptoms, complaints, history..." value={formData.subjective} onChange={(e) => setFormData({...formData, subjective: e.target.value})} className="border-blue-200 focus:border-blue-400" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objective" className="text-green-700">O - Objective</Label>
                  <Textarea id="objective" rows={2} placeholder="Vitals, physical exam findings, lab results..." value={formData.objective} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="border-green-200 focus:border-green-400" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessment" className="text-amber-700">A - Assessment</Label>
                  <Textarea id="assessment" rows={2} placeholder="Diagnosis, clinical impression..." value={formData.assessment} onChange={(e) => setFormData({...formData, assessment: e.target.value})} className="border-amber-200 focus:border-amber-400" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan" className="text-purple-700">P - Plan</Label>
                  <Textarea id="plan" rows={2} placeholder="Treatment plan, medications, follow-up..." value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})} className="border-purple-200 focus:border-purple-400" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">Create Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="space-y-4">
          {loading ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : notes.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No progress notes found. Create your first SOAP note!</CardContent></Card>
          ) : (
            notes.map((note) => {
              const soap = parseSOAPContent(note.content);
              return (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <Collapsible open={expandedNotes.has(note.id)} onOpenChange={() => toggleExpand(note.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-emerald-700" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{note.patient_name}</CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {new Date(note.created_at).toLocaleDateString()} • {getAuthor(note.content)}
                              </CardDescription>
                            </div>
                          </div>
                          {expandedNotes.has(note.id) ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        <div className="grid gap-4">
                          {soap.subjective && (
                            <div className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r">
                              <h4 className="font-semibold text-blue-800 mb-1">S - Subjective</h4>
                              <p className="text-sm">{soap.subjective}</p>
                            </div>
                          )}
                          {soap.objective && (
                            <div className="border-l-4 border-green-400 pl-4 py-2 bg-green-50 rounded-r">
                              <h4 className="font-semibold text-green-800 mb-1">O - Objective</h4>
                              <p className="text-sm">{soap.objective}</p>
                            </div>
                          )}
                          {soap.assessment && (
                            <div className="border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 rounded-r">
                              <h4 className="font-semibold text-amber-800 mb-1">A - Assessment</h4>
                              <p className="text-sm">{soap.assessment}</p>
                            </div>
                          )}
                          {soap.plan && (
                            <div className="border-l-4 border-purple-400 pl-4 py-2 bg-purple-50 rounded-r">
                              <h4 className="font-semibold text-purple-800 mb-1">P - Plan</h4>
                              <p className="text-sm">{soap.plan}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" size="sm">Edit Note</Button>
                          <Button variant="outline" size="sm">Print</Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ConsoleShell>
  );
}
