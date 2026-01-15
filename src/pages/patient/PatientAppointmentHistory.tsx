import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Search, User, Clock } from "lucide-react";
import PatientConsoleShell from "@/layouts/PatientConsoleShell";

const PatientAppointmentHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments] = useState([
    { id: "1", date: "2026-01-10", time: "11:00 AM", doctor: "Dr. Smith", department: "Cardiology", status: "completed", diagnosis: "Regular checkup" },
    { id: "2", date: "2026-01-05", time: "09:00 AM", doctor: "Dr. Patel", department: "Orthopedics", status: "completed", diagnosis: "Knee pain evaluation" },
    { id: "3", date: "2025-12-28", time: "02:00 PM", doctor: "Dr. Johnson", department: "General Medicine", status: "completed", diagnosis: "Flu symptoms" },
    { id: "4", date: "2025-12-15", time: "10:30 AM", doctor: "Dr. Lee", department: "Dermatology", status: "cancelled", diagnosis: "-" },
    { id: "5", date: "2025-12-01", time: "03:30 PM", doctor: "Dr. Smith", department: "Cardiology", status: "completed", diagnosis: "ECG follow-up" },
  ]);

  const filteredAppointments = appointments.filter(apt =>
    apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PatientConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Appointment History</h1>
          <p className="text-muted-foreground">View all your past appointments</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by doctor, department, or diagnosis..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredAppointments.map(apt => (
            <Card key={apt.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(apt.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                      <span>{apt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{apt.doctor}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{apt.department}</span>
                    </div>
                    {apt.diagnosis !== "-" && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Diagnosis:</span> {apt.diagnosis}
                      </p>
                    )}
                  </div>
                  <Badge variant={apt.status === "completed" ? "secondary" : "destructive"}>
                    {apt.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">No appointments found matching your search</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientConsoleShell>
  );
};

export default PatientAppointmentHistory;
