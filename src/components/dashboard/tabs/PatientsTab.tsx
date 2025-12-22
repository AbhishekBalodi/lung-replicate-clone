import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Appointment {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  status?: string | null;
}

interface PatientNote {
  id: number;
  patient_name: string;
  note: string;
  created_at: string;
}

interface PatientsTabProps {
  todaysAppointments: Appointment[];
}

export default function PatientsTab({ todaysAppointments }: PatientsTabProps) {
  const [recentNotes, setRecentNotes] = useState<PatientNote[]>([]);

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

  const getPatientType = (index: number) => {
    const types = ["New Patient", "Follow-up", "Regular"];
    return types[index % types.length];
  };

  // Mock recent notes - in production this would come from API
  useEffect(() => {
    const mockNotes: PatientNote[] = todaysAppointments.slice(0, 3).map((appt, i) => ({
      id: i + 1,
      patient_name: appt.full_name,
      note: `Patient presented for ${appt.message || 'routine check-up'}. Vitals stable. Follow-up recommended in 2 weeks.`,
      created_at: new Date().toISOString()
    }));
    setRecentNotes(mockNotes);
  }, [todaysAppointments]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Today's Patients */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Today's Patients</CardTitle>
          <p className="text-slate-400 text-sm">Patients you're seeing today</p>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
          {todaysAppointments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No patients scheduled for today</p>
          ) : (
            todaysAppointments.map((appt, index) => (
              <div 
                key={appt.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className={getAvatarColor(appt.full_name)}>
                    <AvatarFallback className="text-white font-medium">
                      {getInitials(appt.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{appt.full_name}</p>
                    <p className="text-sm text-slate-400">
                      {30 + (index * 5)} yrs • {index % 2 === 0 ? "Female" : "Male"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`${
                      getPatientType(index) === "New Patient" 
                        ? "border-emerald-500 text-emerald-400" 
                        : getPatientType(index) === "Follow-up"
                        ? "border-amber-500 text-amber-400"
                        : "border-slate-500 text-slate-300"
                    }`}
                  >
                    {getPatientType(index)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    History
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Examine
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Patient Notes */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Recent Patient Notes</CardTitle>
            <p className="text-slate-400 text-sm">Your latest clinical notes</p>
          </div>
          <Button size="sm" className="bg-slate-700 hover:bg-slate-600">
            <Plus className="h-4 w-4 mr-1" />
            New Note
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
          {recentNotes.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No recent notes</p>
          ) : (
            recentNotes.map((note) => (
              <div 
                key={note.id} 
                className="p-4 rounded-lg bg-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className={getAvatarColor(note.patient_name) + " h-8 w-8"}>
                      <AvatarFallback className="text-white text-xs font-medium">
                        {getInitials(note.patient_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{note.patient_name}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Today, {new Date(note.created_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-3">{note.note}</p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-600"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Note
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Note
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
