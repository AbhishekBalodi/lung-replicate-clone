import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface ScheduleTabProps {
  todaysAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  onViewAppointment: (appointment: Appointment) => void;
}

export default function ScheduleTab({ 
  todaysAppointments, 
  upcomingAppointments,
  onViewAppointment 
}: ScheduleTabProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getVisitType = (message: string | null) => {
    if (!message) return "Check-up";
    if (message.toLowerCase().includes("follow")) return "Follow-up";
    if (message.toLowerCase().includes("consult")) return "Consultation";
    return "Check-up";
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

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Today's Schedule */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Today's Schedule</CardTitle>
          <p className="text-slate-400 text-sm">
            You have {todaysAppointments.length} appointments for today
          </p>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
          {todaysAppointments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No appointments for today</p>
          ) : (
            todaysAppointments.map((appt) => (
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
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{appt.appointment_time}</span>
                      <span>•</span>
                      <span>30 min</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {getVisitType(appt.message)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-600"
                    onClick={() => onViewAppointment(appt)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="bg-slate-800/50 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Upcoming Appointments</CardTitle>
          <p className="text-slate-400 text-sm">Your upcoming appointments for the week</p>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
          {upcomingAppointments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No upcoming appointments</p>
          ) : (
            upcomingAppointments.slice(0, 5).map((appt) => (
              <div 
                key={appt.id} 
                className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{appt.full_name}</p>
                  <Badge 
                    variant="outline" 
                    className={`${
                      appt.status === "confirmed" 
                        ? "border-emerald-500 text-emerald-400" 
                        : "border-amber-500 text-amber-400"
                    }`}
                  >
                    {appt.status || "pending"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {new Date(appt.appointment_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {appt.appointment_time}
                </p>
                <Badge 
                  variant="secondary" 
                  className="mt-2 bg-slate-600 text-slate-200"
                >
                  {getVisitType(appt.message)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
