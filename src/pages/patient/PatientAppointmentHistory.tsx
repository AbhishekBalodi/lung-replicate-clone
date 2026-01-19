import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Search, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HistoricalAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
}

const PatientAppointmentHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState<HistoricalAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentHistory();
  }, []);

  const fetchAppointmentHistory = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .lt('appointment_date', today)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.selected_doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (apt.message && apt.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading appointment history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appointment History</h1>
        <p className="text-muted-foreground">View all your past appointments</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by doctor or notes..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No appointments found matching your search' : 'No past appointments'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map(apt => (
            <Card key={apt.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                      <span>{apt.appointment_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{apt.selected_doctor}</span>
                    </div>
                    {apt.message && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {apt.message}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientAppointmentHistory;
