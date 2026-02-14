import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, LogOut, Pill, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { apiFetch } from "@/lib/api";

interface PatientDashboardProps {
  adminPatientId?: number;   // <=== IMPORTANT
}

interface Appointment {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string;
  status: string;
}

interface Prescription {
  id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribed_date: string;
}

interface LabTest {
  id: number;
  test_name: string;
  category: string;
  sample_type: string;
  turnaround_time: string;
  prescribed_date: string;
}

interface Procedure {
  id: number;
  procedure_name: string;
  category: string;
  description: string;
  preparation_instructions: string;
  prescribed_date: string;
}

const PatientDashboard = ({ adminPatientId }: PatientDashboardProps) => {
  const { user, logout, loading: authLoading } = useCustomAuth();

  // Use adminPatientId if provided (admin viewing patient), otherwise use logged-in patient's ID
  const effectiveId = adminPatientId ?? user?.id;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<{ full_name: string; email: string; phone: string } | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (effectiveId) {
      fetchPatientData(effectiveId);
    } else {
      setLoading(false);
    }
  }, [effectiveId, user, authLoading]);

  const fetchPatientData = async (patientId: number) => {
    try {
      // Load complete patient data including appointments
      const patientRes = await apiFetch(`/api/patients/${patientId}`);

      if (patientRes.ok) {
        const data = await patientRes.json();
        setPatientInfo({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone
        });
        setAppointments(data.appointments || []);
        setPrescriptions(data.medicines || []);
        setLabTests(data.lab_tests || []);
        setProcedures(data.procedures || []);
      } else {
        toast({
          title: "Error",
          description: "Patient not found",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      toast({
        title: "Error",
        description: "Unable to load patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* HEADER — hidden in admin mode */}
      {!adminPatientId && (
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Patient Portal</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </header>
      )}

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">
        {/* STATS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prescriptions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter((a) => a.status === "done").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* APPOINTMENTS */}
        <Card>
          <CardHeader>
            <CardTitle>Your Appointments</CardTitle>
          </CardHeader>

          <CardContent>
            {appointments.map((a) => (
              <Card key={a.id} className="mb-4">
                <CardContent>
                  <div className="font-medium">
                    {new Date(a.appointment_date).toLocaleDateString()} – {a.appointment_time}
                  </div>

                  <div className="text-sm text-muted-foreground mt-2">
                    Doctor: {a.selected_doctor}
                  </div>

                  <div className="mt-3 text-sm">
                    Status:{" "}
                    <span className="font-semibold">{a.status}</span>
                  </div>

                  {a.message && (
                    <p className="mt-3 text-sm">Notes: {a.message}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* MEDICAL HISTORY */}
        {(prescriptions.length > 0 ||
          labTests.length > 0 ||
          procedures.length > 0) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Complete Medical History</CardTitle>
            </CardHeader>

            <CardContent>
              {/* Prescriptions */}
              {prescriptions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Prescribed Medicines</h3>
                  {prescriptions.map((p) => (
                    <div key={p.id} className="border rounded p-3 mb-2">
                      <div className="font-semibold">{p.medicine_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {p.dosage} – {p.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lab Tests */}
              {labTests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Lab Tests</h3>
                  {labTests.map((t) => (
                    <div key={t.id} className="border rounded p-3 mb-2">
                      <div className="font-semibold">{t.test_name}</div>
                      <div className="text-sm text-muted-foreground">{t.category}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Procedures */}
              {procedures.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Procedures</h3>
                  {procedures.map((p) => (
                    <div key={p.id} className="border rounded p-3 mb-2">
                      <div className="font-semibold">{p.procedure_name}</div>
                      <div className="text-sm text-muted-foreground">{p.category}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
