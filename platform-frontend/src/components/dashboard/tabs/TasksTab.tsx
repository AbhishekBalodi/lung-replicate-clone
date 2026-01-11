import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, FileText, CheckCircle, Eye, RefreshCw } from "lucide-react";

interface Task {
  id: number;
  title: string;
  patient_name: string;
  due_time: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

interface Prescription {
  id: number;
  patient_name: string;
  medicines: string[];
  prescribed_at: string;
}

export default function TasksTab({ isHospital }: { isHospital?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Review lab results for Emma Thompson",
      patient_name: "Emma Thompson",
      due_time: "Today, 2:00 PM",
      priority: "high",
      completed: false
    },
    {
      id: 2,
      title: "Complete medical certificate for James Wilson",
      patient_name: "James Wilson",
      due_time: "Today, 4:00 PM",
      priority: "medium",
      completed: false
    },
    {
      id: 3,
      title: "Follow-up call with Sarah Johnson",
      patient_name: "Sarah Johnson",
      due_time: "Tomorrow, 10:00 AM",
      priority: "low",
      completed: false
    }
  ]);

  const [prescriptions] = useState<Prescription[]>([
    {
      id: 1,
      patient_name: "Emma Thompson",
      medicines: ["Sumatriptan 50mg, 1 tablet as needed for migraine"],
      prescribed_at: "Today, 09:45 AM"
    },
    {
      id: 2,
      patient_name: "Michael Chen",
      medicines: ["Lisinopril 10mg, 1 tablet daily"],
      prescribed_at: "Today, 11:20 AM"
    }
  ]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-purple-500",
      "bg-blue-500", 
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-cyan-500"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const toggleTask = (taskId: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-rose-500 text-white";
      case "medium": return "bg-amber-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const isHosp = !!isHospital;
  const headerSubText = isHosp ? 'text-slate-100 text-sm' : 'text-slate-400 text-sm';
  const cardClass = isHosp ? 'bg-emerald-700/80 border-emerald-600 text-white' : 'bg-slate-800/50 border-slate-700 text-white';

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Pending Tasks */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Pending Tasks</CardTitle>
          <p className={headerSubText}>Tasks requiring your attention</p>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-start gap-3 p-4 rounded-lg transition-colors ${
                task.completed 
                  ? (isHosp ? "bg-emerald-600/30 opacity-60" : "bg-slate-700/30 opacity-60") 
                  : (isHosp ? "bg-emerald-600/50 hover:bg-emerald-600" : "bg-slate-700/50 hover:bg-slate-700")
              }`}
            >
              <Checkbox 
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-1 border-slate-500 data-[state=checked]:bg-emerald-600"
              />
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? "line-through text-slate-400" : ""}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3.5 w-3.5 text-slate-100" />
                  <span className="text-sm text-slate-100">{task.due_time}</span>
                  <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-600"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Prescriptions */}
      <Card className="bg-emerald-700/80 border-emerald-600 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent Prescriptions</CardTitle>
          <p className="text-slate-400 text-sm">Prescriptions you've written recently</p>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
          {prescriptions.map((prescription) => (
            <div 
              key={prescription.id} 
              className="p-4 rounded-lg bg-slate-700/50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className={getAvatarColor(prescription.patient_name) + " h-8 w-8"}>
                    <AvatarFallback className="text-white text-xs font-medium">
                      {getInitials(prescription.patient_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{prescription.patient_name}</span>
                </div>
                <span className="text-xs text-slate-400">{prescription.prescribed_at}</span>
              </div>
              <ul className="space-y-1 mb-3">
                {prescription.medicines.map((med, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    {med}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-400 hover:text-white hover:bg-slate-600"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Renew
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
