import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, FileText, Pill, FlaskConical, CreditCard,
  AlertCircle, ChevronRight, Activity
} from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import PatientConsoleShell from "@/layouts/PatientConsoleShell";

const PatientHome = () => {
  const { user } = useCustomAuth();
  const navigate = useNavigate();

  // Mock data - in real app, fetch from API
  const [stats] = useState({
    upcomingAppointments: 2,
    lastConsultation: "2026-01-10",
    pendingLabReports: 1,
    outstandingBills: 1500,
    activePrescriptions: 3
  });

  const [quickView] = useState({
    nextAppointment: {
      date: "2026-01-20",
      time: "10:00 AM",
      doctor: "Dr. Smith"
    },
    healthAlerts: ["Follow-up reminder for blood pressure check"],
    followUpReminders: ["Dental checkup due in 2 weeks"]
  });

  return (
    <PatientConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
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
              <div className="text-2xl font-bold text-blue-600">{stats.upcomingAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Last Consultation</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{new Date(stats.lastConsultation).toLocaleDateString()}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/lab/results")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Lab Reports</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingLabReports}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/billing/invoices")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Bills</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{stats.outstandingBills}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/patient/prescriptions/current")}>
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
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date(quickView.nextAppointment.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{quickView.nextAppointment.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor:</span>
                  <span className="font-medium">{quickView.nextAppointment.doctor}</span>
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/patient/appointments")}>
                  View All Appointments
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
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
                {quickView.healthAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                    <span className="text-sm">{alert}</span>
                  </div>
                ))}
                {quickView.followUpReminders.map((reminder, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-sm">{reminder}</span>
                  </div>
                ))}
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
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/prescriptions/current")}>
                <Pill className="h-6 w-6 text-green-600" />
                <span>View Prescriptions</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/lab/results")}>
                <FlaskConical className="h-6 w-6 text-purple-600" />
                <span>Lab Results</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/patient/billing/pay")}>
                <CreditCard className="h-6 w-6 text-orange-600" />
                <span>Pay Bills</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientConsoleShell>
  );
};

export default PatientHome;
