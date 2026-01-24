import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, XCircle, Loader2 } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { toast } from "sonner";
import api from "@/lib/api";

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  specialization: string;
  status: string;
  message: string | null;
}

const PatientAppointments = () => {
  const { user } = useCustomAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchAppointments();
    }
  }, [user?.email]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.apiGet(
        `/api/dashboard/patient/appointments?email=${encodeURIComponent(user?.email || "")}`
      );
      const data = await res.json();

      if (res.ok) {
        setAppointments(data.appointments || []);
      } else {
        throw new Error(data.error || "Failed to load appointments");
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(
    (a) => a.appointment_date >= today && a.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(
    (a) => a.appointment_date < today || a.status === 'done'
  );

  const handleCancelAppointment = async (id: number) => {
    // Note: This would need an API endpoint to cancel appointments
    toast.info('Cancel appointment feature coming soon');
  };

  const getStatusBadge = (status: string, isUpcoming: boolean) => {
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (status === 'done') {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (isUpcoming) {
      return <Badge className="bg-primary">Upcoming</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const AppointmentCard = ({
    appointment,
    isUpcoming = false,
  }: {
    appointment: Appointment;
    isUpcoming?: boolean;
  }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.appointment_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Dr. {appointment.doctor_name} {appointment.specialization ? `(${appointment.specialization})` : ''}</span>
            </div>
            {appointment.message && (
              <p className="text-sm text-muted-foreground">Note: {appointment.message}</p>
            )}
            {getStatusBadge(appointment.status, isUpcoming)}
          </div>
          
          {isUpcoming && appointment.status !== 'cancelled' && (
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleCancelAppointment(appointment.id)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">Manage your appointments</p>
        </div>
        <Button onClick={() => navigate("/patient/appointments/book")}>
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
                <Button className="mt-4" onClick={() => navigate("/patient/appointments/book")}>
                  Book an Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} isUpcoming />
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
  );
};

export default PatientAppointments;
