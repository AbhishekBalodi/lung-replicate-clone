import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Heart, User, Calendar, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CarePlan {
  id: number;
  patientName: string;
  condition: string;
  startDate: string;
  duration: string;
  goals: { text: string; completed: boolean }[];
  instructions: string[];
  careTeam: string[];
  progress: number;
}

const mockCarePlans: CarePlan[] = [
  {
    id: 1,
    patientName: "Rahul Sharma",
    condition: "Type 2 Diabetes Management",
    startDate: "2026-01-01",
    duration: "6 months",
    goals: [
      { text: "Maintain fasting glucose 80-130 mg/dL", completed: false },
      { text: "HbA1c below 7%", completed: false },
      { text: "30 minutes daily exercise", completed: true },
      { text: "Reduce weight by 5kg", completed: false },
    ],
    instructions: [
      "Take Metformin 500mg with breakfast and dinner",
      "Check blood sugar before breakfast daily",
      "Follow low-carb diet plan",
      "Walk for 30 minutes after dinner",
    ],
    careTeam: ["Dr. Priya Mehta", "Nutritionist Anita", "Nurse Ravi"],
    progress: 35,
  },
  {
    id: 2,
    patientName: "Priya Patel",
    condition: "Hypertension Control",
    startDate: "2025-12-15",
    duration: "Ongoing",
    goals: [
      { text: "Maintain BP below 130/80", completed: true },
      { text: "Reduce sodium intake", completed: true },
      { text: "Regular exercise 5x/week", completed: false },
      { text: "Stress management practices", completed: false },
    ],
    instructions: [
      "Take Amlodipine 5mg every morning",
      "Monitor BP twice daily",
      "Limit salt to 2g/day",
      "Practice deep breathing for 10 minutes",
    ],
    careTeam: ["Dr. Priya Mehta", "Dietician Sunita"],
    progress: 50,
  },
];

export default function CarePlans() {
  const [carePlans, setCarePlans] = useState<CarePlan[]>(mockCarePlans);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlans = carePlans.filter(plan =>
    plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleGoal = (planId: number, goalIndex: number) => {
    setCarePlans(carePlans.map(plan => {
      if (plan.id === planId) {
        const newGoals = [...plan.goals];
        newGoals[goalIndex] = { ...newGoals[goalIndex], completed: !newGoals[goalIndex].completed };
        const completedCount = newGoals.filter(g => g.completed).length;
        return { ...plan, goals: newGoals, progress: Math.round((completedCount / newGoals.length) * 100) };
      }
      return plan;
    }));
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Long-Term Care Plans</h1>
            <p className="text-muted-foreground">Comprehensive care plans for chronic conditions</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Care Plan
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search care plans..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.patientName}</CardTitle>
                      <CardDescription>{plan.condition}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Started {new Date(plan.startDate).toLocaleDateString()}
                    </div>
                    <Badge variant="outline" className="mt-1">{plan.duration}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Goals */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Care Goals
                    </h4>
                    <div className="space-y-2">
                      {plan.goals.map((goal, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${goal.completed ? 'bg-emerald-50' : ''}`}
                          onClick={() => toggleGoal(plan.id, idx)}
                        >
                          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${goal.completed ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}>
                            {goal.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                          <span className={`text-sm ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {goal.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Care Instructions
                    </h4>
                    <ul className="space-y-2">
                      {plan.instructions.map((instruction, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs shrink-0">
                            {idx + 1}
                          </span>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Care Team */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Care Team</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.careTeam.map((member, idx) => (
                      <Badge key={idx} variant="secondary">
                        <User className="h-3 w-3 mr-1" />
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">Edit Plan</Button>
                  <Button variant="outline" size="sm">Print Instructions</Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Send to Patient</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
