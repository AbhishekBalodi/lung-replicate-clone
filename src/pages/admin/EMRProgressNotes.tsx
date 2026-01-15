import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProgressNote {
  id: number;
  patientName: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  author: string;
}

const mockNotes: ProgressNote[] = [
  {
    id: 1,
    patientName: "Rahul Sharma",
    date: "2026-01-15",
    subjective: "Patient reports improved energy levels. Occasional mild headaches. Compliance with medication is good.",
    objective: "BP: 130/85 mmHg, Weight: 78kg (down 2kg), Fasting glucose: 126 mg/dL",
    assessment: "Type 2 Diabetes - Improving. BP slightly elevated but better than previous visit.",
    plan: "Continue current medications. Increase physical activity. Follow-up in 2 weeks.",
    author: "Dr. Priya Mehta"
  },
  {
    id: 2,
    patientName: "Priya Patel",
    date: "2026-01-14",
    subjective: "Headaches have reduced significantly. Sleeping better. Following low sodium diet.",
    objective: "BP: 128/82 mmHg, Heart rate: 72 bpm, No edema",
    assessment: "Hypertension - Well controlled on current regimen.",
    plan: "Continue Amlodipine 5mg. Maintain lifestyle modifications. Next visit in 1 month.",
    author: "Dr. Priya Mehta"
  },
  {
    id: 3,
    patientName: "Amit Kumar",
    date: "2026-01-12",
    subjective: "Cough has improved by 70%. No fever for 3 days. Appetite returning.",
    objective: "Chest clear on auscultation. Temperature: 98.4°F. SpO2: 98%",
    assessment: "Acute Bronchitis - Resolving well with treatment.",
    plan: "Complete antibiotic course. Continue bronchodilator PRN. No follow-up needed unless symptoms worsen.",
    author: "Dr. Amit Verma"
  },
];

export default function EMRProgressNotes() {
  const [notes, setNotes] = useState<ProgressNote[]>(mockNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set([1]));

  const filteredNotes = notes.filter(
    note =>
      note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.assessment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotes(newExpanded);
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Progress Notes (SOAP)</h1>
            <p className="text-muted-foreground">Document patient progress with SOAP format</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Progress Note
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredNotes.map((note) => (
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
                          <CardTitle className="text-lg">{note.patientName}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(note.date).toLocaleDateString()} • {note.author}
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
                      <div className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r">
                        <h4 className="font-semibold text-blue-800 mb-1">S - Subjective</h4>
                        <p className="text-sm">{note.subjective}</p>
                      </div>
                      <div className="border-l-4 border-green-400 pl-4 py-2 bg-green-50 rounded-r">
                        <h4 className="font-semibold text-green-800 mb-1">O - Objective</h4>
                        <p className="text-sm">{note.objective}</p>
                      </div>
                      <div className="border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 rounded-r">
                        <h4 className="font-semibold text-amber-800 mb-1">A - Assessment</h4>
                        <p className="text-sm">{note.assessment}</p>
                      </div>
                      <div className="border-l-4 border-purple-400 pl-4 py-2 bg-purple-50 rounded-r">
                        <h4 className="font-semibold text-purple-800 mb-1">P - Plan</h4>
                        <p className="text-sm">{note.plan}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm">Edit Note</Button>
                      <Button variant="outline" size="sm">Print</Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
