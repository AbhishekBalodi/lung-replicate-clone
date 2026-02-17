import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Pill, FlaskConical, CreditCard, AlertCircle, ChevronRight, Activity, RefreshCw } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

interface DashboardStats {
  upcomingAppointments: number;
  lastConsultation: string | null;
  pendingLabReports: number;
  outstandingBills: number;
  activePrescriptions: number;
  patientUid: string | null;
}

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  status: string;
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
    activePrescriptions: 0,
    patientUid: null
  });
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [healthAlerts, setHealthAlerts] = useState<string[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(
        `/api/dashboard/patient/home?email=${encodeURIComponent(user?.email || "")}`
      );
      
      if (res.ok) {
        const data = await res.json();

        // Backend may return either a numeric count or an array of upcoming appointments.
        const upcomingList = Array.isArray(data.upcomingAppointments)
          ? data.upcomingAppointments
          : [];
        const upcomingCount =
          typeof data.upcomingAppointments === "number"
            ? data.upcomingAppointments
            : upcomingList.length;

        const resolvedNextAppointment =
          data.nextAppointment || (upcomingList.length ? upcomingList[0] : null);

        setStats({
          upcomingAppointments: upcomingCount || 0,
          lastConsultation: data.lastConsultation || null,
          pendingLabReports: data.pendingLabReports || 0,
          outstandingBills: data.outstandingBills || 0,
          activePrescriptions: data.activePrescriptions || 0,
          patientUid: data.patient?.patient_uid || null
        });
        
        setNextAppointment(resolvedNextAppointment);
        
        // Generate health alerts based on data
        const alerts: string[] = [];
        if (resolvedNextAppointment) {
          alerts.push(
            `Upcoming appointment on ${new Date(resolvedNextAppointment.appointment_date).toLocaleDateString()}`
          );
        }
        if (data.activePrescriptions > 0) {
          alerts.push(`You have ${data.activePrescriptions} active prescription(s) - remember to take your medications`);
        }
        if (data.pendingLabReports > 0) {
          alerts.push(`${data.pendingLabReports} lab report(s) pending`);
        }
        setHealthAlerts(alerts);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back{user?.name ? `, ${user.name}` : ''}!</h1>
          <p className="text-muted-foreground">Here's your health overview</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchDashboardData}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Patient UID Banner */}
      {stats.patientUid && (
        <Card className="border-2 border-emerald-200 bg-emerald-50/50">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 mb-1">Your Patient Unique Identification Number</p>
              <p className="text-3xl font-bold font-mono text-emerald-900 tracking-wider">{stats.patientUid}</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1">Patient UID</Badge>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/appointments")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcomingAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Consultation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats.lastConsultation ? new Date(stats.lastConsultation).toLocaleDateString() : 'No visits yet'}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/lab-reports")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Lab Reports</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingLabReports}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/billing")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Bills</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{stats.outstandingBills}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/prescriptions")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activePrescriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick View Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Appointment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
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
                  <span className="font-medium">{nextAppointment.doctor_name}</span>
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/patient/appointments")}>
                  View All Appointments
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Button onClick={() => navigate("/patient/appointments/book")}>Book an Appointment</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Health Alerts & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthAlerts.length > 0 ? (
                healthAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
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
              <Calendar className="h-6 w-6 text-blue-600" />
              <span>Book Appointment</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/prescriptions")}>
              <Pill className="h-6 w-6 text-green-600" />
              <span>View Prescriptions</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/lab-reports")}>
              <FlaskConical className="h-6 w-6 text-purple-600" />
              <span>Lab Results</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/billing")}>
              <CreditCard className="h-6 w-6 text-orange-600" />
              <span>Pay Bills</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHome;
