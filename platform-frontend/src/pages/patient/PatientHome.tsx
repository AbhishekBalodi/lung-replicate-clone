import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, FileText, Pill, FlaskConical, CreditCard,
  AlertCircle, ChevronRight, Loader2
} from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

interface DashboardStats {
  upcomingAppointments: number;
  lastConsultation: string | null;
  pendingLabReports: number;
  outstandingBills: number;
  activePrescriptions: number;
}

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  specialization: string;
}

const PatientHome = () => {
  const { user } = useCustomAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    lastConsultation: null,
    pendingLabReports: 0,
    outstandingBills: 0,
    activePrescriptions: 0
  });
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [healthAlerts, setHealthAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData();
    }
  }, [user?.email]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient home data from backend
      const res = await api.apiGet(`/api/dashboard/patient/home?email=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      
      if (res.ok && data) {
        const upcomingAppts = data.upcomingAppointments || [];
        const prescriptions = data.recentPrescriptions || [];
        const totalVisits = data.totalVisits || 0;
        
        setStats({
          upcomingAppointments: upcomingAppts.length,
          lastConsultation: totalVisits > 0 ? 'Recent' : null,
          pendingLabReports: 0, // Will be fetched from lab reports API if needed
          outstandingBills: 0, // Will be fetched from billing API if needed
          activePrescriptions: prescriptions.length
        });
        
        if (upcomingAppts.length > 0) {
          setNextAppointment(upcomingAppts[0]);
        }
        
        // Generate health alerts
        const alerts: string[] = [];
        if (upcomingAppts.length > 0) {
          alerts.push(`Upcoming appointment on ${new Date(upcomingAppts[0].appointment_date).toLocaleDateString()}`);
        }
        if (prescriptions.length > 0) {
          alerts.push(`You have ${prescriptions.length} active prescription(s) - remember to take your medications`);
        }
        setHealthAlerts(alerts);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome Back, {user?.name || 'Patient'}!</h1>
        <p className="text-muted-foreground">Here's your health overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/appointments")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.upcomingAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Consultation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats.lastConsultation || 'No visits yet'}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/lab-reports")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Lab Reports</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingLabReports}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/billing")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Bills</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{stats.outstandingBills}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/prescriptions")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.activePrescriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick View Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Appointment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date(nextAppointment.appointment_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{nextAppointment.appointment_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor:</span>
                  <span className="font-medium">Dr. {nextAppointment.doctor_name}</span>
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/patient/appointments")}>
                  View All Appointments
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Button onClick={() => navigate("/patient/appointments/book")}>
                  Book an Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Health Alerts & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthAlerts.length > 0 ? (
                healthAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <span className="text-sm">{alert}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No alerts at this time</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/appointments/book")}>
              <Calendar className="h-6 w-6 text-primary" />
              <span>Book Appointment</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/prescriptions")}>
              <Pill className="h-6 w-6 text-emerald-600" />
              <span>View Prescriptions</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/lab-reports")}>
              <FlaskConical className="h-6 w-6 text-purple-600" />
              <span>Lab Results</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/billing")}>
              <CreditCard className="h-6 w-6 text-amber-600" />
              <span>Pay Bills</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHome;