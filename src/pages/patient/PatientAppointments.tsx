import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, MapPin, XCircle, Edit } from "lucide-react";
import PatientConsoleShell from "@/layouts/PatientConsoleShell";

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  status: "confirmed" | "completed" | "cancelled" | "no-show";
  type: string;
}

const PatientAppointments = () => {
  const [appointments] = useState<Appointment[]>([
    { id: "1", date: "2026-01-20", time: "10:00 AM", doctor: "Dr. Smith", department: "Cardiology", status: "confirmed", type: "Consultation" },
    { id: "2", date: "2026-01-25", time: "02:30 PM", doctor: "Dr. Johnson", department: "General Medicine", status: "confirmed", type: "Follow-up" },
    { id: "3", date: "2026-01-10", time: "11:00 AM", doctor: "Dr. Smith", department: "Cardiology", status: "completed", type: "Consultation" },
    { id: "4", date: "2026-01-05", time: "09:00 AM", doctor: "Dr. Patel", department: "Orthopedics", status: "completed", type: "Check-up" },
    { id: "5", date: "2026-01-02", time: "03:00 PM", doctor: "Dr. Lee", department: "Dermatology", status: "cancelled", type: "Consultation" },
  ]);

  const upcomingAppointments = appointments.filter(a => a.status === "confirmed");
  const pastAppointments = appointments.filter(a => a.status !== "confirmed");

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      confirmed: { variant: "default", label: "Confirmed" },
      completed: { variant: "secondary", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      "no-show": { variant: "outline", label: "No Show" }
    };
    const config = variants[status] || variants.confirmed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const AppointmentCard = ({ appointment, showActions = false }: { appointment: Appointment; showActions?: boolean }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.doctor} - {appointment.department}</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">{appointment.type}</Badge>
              {getStatusBadge(appointment.status)}
            </div>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Reschedule
              </Button>
              <Button variant="destructive" size="sm">
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PatientConsoleShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground">Manage your appointments</p>
          </div>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Book New Appointment
          </Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                  <Button className="mt-4">Book an Appointment</Button>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} showActions />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">No past appointments</p>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PatientConsoleShell>
  );
};

export default PatientAppointments;
