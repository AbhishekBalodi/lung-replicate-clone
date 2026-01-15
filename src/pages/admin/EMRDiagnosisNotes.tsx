import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Calendar, User, Edit, Trash2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DiagnosisNote {
  id: number;
  patientName: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  notes: string;
  status: "draft" | "final";
}

const mockNotes: DiagnosisNote[] = [
  { id: 1, patientName: "Rahul Sharma", date: "2026-01-15", diagnosis: "Type 2 Diabetes", symptoms: "Frequent urination, thirst, fatigue", notes: "Patient shows elevated HbA1c levels. Started on Metformin 500mg.", status: "final" },
  { id: 2, patientName: "Priya Patel", date: "2026-01-14", diagnosis: "Hypertension Stage 1", symptoms: "Headaches, dizziness", notes: "BP readings consistently above 140/90. Lifestyle modifications advised.", status: "final" },
  { id: 3, patientName: "Amit Kumar", date: "2026-01-14", diagnosis: "Acute Bronchitis", symptoms: "Cough, chest congestion, mild fever", notes: "Prescribed antibiotics and bronchodilators. Follow-up in 5 days.", status: "draft" },
];

export default function EMRDiagnosisNotes() {
  const [notes, setNotes] = useState<DiagnosisNote[]>(mockNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    patientName: "",
    diagnosis: "",
    symptoms: "",
    notes: "",
    status: "draft" as "draft" | "final"
  });

  const filteredNotes = notes.filter(
    note =>
      note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNote = () => {
    const note: DiagnosisNote = {
      id: notes.length + 1,
      ...newNote,
      date: new Date().toISOString().split('T')[0]
    };
    setNotes([note, ...notes]);
    setNewNote({ patientName: "", diagnosis: "", symptoms: "", notes: "", status: "draft" });
    setIsDialogOpen(false);
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diagnosis Notes</h1>
            <p className="text-muted-foreground">Create and manage patient diagnosis records</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Diagnosis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Diagnosis Note</DialogTitle>
                <DialogDescription>Enter diagnosis details for the patient</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient Name</Label>
                    <Input
                      placeholder="Enter patient name"
                      value={newNote.patientName}
                      onChange={(e) => setNewNote({ ...newNote, patientName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newNote.status}
                      onValueChange={(value: "draft" | "final") => setNewNote({ ...newNote, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <Input
                    placeholder="Enter diagnosis"
                    value={newNote.diagnosis}
                    onChange={(e) => setNewNote({ ...newNote, diagnosis: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Symptoms</Label>
                  <Textarea
                    placeholder="List symptoms"
                    value={newNote.symptoms}
                    onChange={(e) => setNewNote({ ...newNote, symptoms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Clinical Notes</Label>
                  <Textarea
                    placeholder="Enter detailed clinical notes"
                    className="min-h-[100px]"
                    value={newNote.notes}
                    onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddNote} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient or diagnosis..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{note.patientName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={note.status === "final" ? "default" : "secondary"}>
                      {note.status === "final" ? "Final" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Diagnosis:</span>
                  <p className="font-medium text-emerald-700">{note.diagnosis}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Symptoms:</span>
                  <p className="text-sm">{note.symptoms}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                  <p className="text-sm text-muted-foreground">{note.notes}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
