import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ClipboardList, Calendar, User, Edit, CheckCircle2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TreatmentPlan {
  id: number;
  patientName: string;
  diagnosis: string;
  startDate: string;
  endDate: string;
  goals: string[];
  medications: string[];
  progress: number;
  status: "active" | "completed" | "on-hold";
}

const mockPlans: TreatmentPlan[] = [
  {
    id: 1,
    patientName: "Rahul Sharma",
    diagnosis: "Type 2 Diabetes",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    goals: ["Reduce HbA1c to below 7%", "Maintain fasting glucose 80-130 mg/dL", "Weight reduction of 5kg"],
    medications: ["Metformin 500mg BD", "Glimepiride 1mg OD"],
    progress: 45,
    status: "active"
  },
  {
    id: 2,
    patientName: "Priya Patel",
    diagnosis: "Hypertension",
    startDate: "2025-12-15",
    endDate: "2026-06-15",
    goals: ["Maintain BP below 130/80", "Daily 30 min exercise", "Low sodium diet"],
    medications: ["Amlodipine 5mg OD", "Telmisartan 40mg OD"],
    progress: 60,
    status: "active"
  },
  {
    id: 3,
    patientName: "Vikram Singh",
    diagnosis: "Chronic Back Pain",
    startDate: "2025-11-01",
    endDate: "2026-01-15",
    goals: ["Pain reduction to 3/10", "Improved mobility", "Return to normal activities"],
    medications: ["Pregabalin 75mg BD", "Thiocolchicoside 4mg BD"],
    progress: 100,
    status: "completed"
  },
];

export default function EMRTreatmentPlans() {
  const [plans, setPlans] = useState<TreatmentPlan[]>(mockPlans);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "on-hold">("all");

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = 
      plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || plan.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "on-hold": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Treatment Plans</h1>
            <p className="text-muted-foreground">Manage patient treatment plans and track progress</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Treatment Plan
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient or diagnosis..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "completed", "on-hold"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status as any)}
                className={filter === status ? "bg-emerald-600" : ""}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ClipboardList className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.patientName}</CardTitle>
                      <CardDescription>{plan.diagnosis}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(plan.status)}>
                      {plan.status === "active" && <Clock className="h-3 w-3 mr-1" />}
                      {plan.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Treatment Goals</h4>
                    <ul className="space-y-1">
                      {plan.goals.map((goal, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Current Medications</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.medications.map((med, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
