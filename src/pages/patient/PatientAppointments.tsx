import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, XCircle, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  full_name: string;
}

const PatientAppointments = () => {
  const { user } = useCustomAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(a => a.appointment_date >= today);
  const pastAppointments = appointments.filter(a => a.appointment_date < today);

  const handleCancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully."
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      });
    }
  };

  const AppointmentCard = ({ appointment, showActions = false }: { appointment: Appointment; showActions?: boolean }) => (
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
              <span>{appointment.selected_doctor}</span>
            </div>
            {appointment.message && (
              <p className="text-sm text-muted-foreground">Note: {appointment.message}</p>
            )}
            <Badge variant={showActions ? "default" : "secondary"}>
              {showActions ? "Upcoming" : "Completed"}
            </Badge>
          </div>
          
          {showActions && (
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
        <p className="text-muted-foreground">Loading appointments...</p>
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
  );
};

export default PatientAppointments;
