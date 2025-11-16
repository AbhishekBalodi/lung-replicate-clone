import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, LogOut, Pill, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  created_at: string;
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

const PatientDashboard = () => {
  const { user, logout, loading: authLoading } = useCustomAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'patient')) {
      navigate('/login');
      return;
    }

    if (user && user.email) {
      fetchPatientData();
    }
  }, [user, authLoading, navigate]);

  const fetchPatientData = async () => {
    if (!user?.email || !user?.phone) return;

    try {
      // Fetch appointments
      const appointmentsRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointment?email=${encodeURIComponent(user.email)}`
      );
      
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);
      }

      // Fetch patient details including prescriptions, lab tests, and procedures
      if (user.id) {
        const patientRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/patients/${user.id}`
        );
        
        if (patientRes.ok) {
          const patientData = await patientRes.json();
          setPrescriptions(patientData.medicines || []);
          setLabTests(patientData.lab_tests || []);
          setProcedures(patientData.procedures || []);
        }
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Error",
        description: "Failed to load your data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (appointment: Appointment) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    // Clinic Info
    doc.setFontSize(10);
    doc.text('Dr. Paramjeet Singh Mann - Pulmonologist', 105, 30, { align: 'center' });
    doc.text('12, Park Street, Kolkata', 105, 36, { align: 'center' });
    doc.text('Phone: +91 98105 89799', 105, 42, { align: 'center' });
    
    // Invoice Details
    doc.setFontSize(11);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Appointment ID: ${appointment.id}`, 20, 68);
    
    // Patient Info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Patient Information:', 20, 85);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Name: ${appointment.full_name}`, 20, 93);
    doc.text(`Email: ${appointment.email}`, 20, 101);
    doc.text(`Phone: ${appointment.phone}`, 20, 109);
    
    // Appointment Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Appointment Details:', 20, 125);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Date: ${new Date(appointment.appointment_date).toLocaleDateString()}`, 20, 133);
    doc.text(`Time: ${appointment.appointment_time}`, 20, 141);
    doc.text(`Doctor: ${appointment.selected_doctor}`, 20, 149);
    
    // Services Table
    autoTable(doc, {
      startY: 165,
      head: [['Service', 'Amount (₹)']],
      body: [
        ['Consultation Fee', '500.00'],
        ['Total', '500.00']
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.setFontSize(9);
    doc.text('Thank you for your visit!', 105, finalY + 20, { align: 'center' });
    
    doc.save(`invoice_${appointment.id}.pdf`);
    
    toast({
      title: "Invoice Downloaded",
      description: "Your invoice has been downloaded successfully"
    });
  };

  const downloadPrescription = (appointment: Appointment) => {
    // Filter prescriptions for this specific appointment based on date
    const appointmentDate = new Date(appointment.appointment_date).toDateString();
    const appointmentPrescriptions = prescriptions.filter(p => {
      const prescribedDate = new Date(p.prescribed_date).toDateString();
      return prescribedDate === appointmentDate;
    });

    if (appointmentPrescriptions.length === 0) {
      toast({
        title: "No Prescriptions",
        description: "No prescriptions found for this appointment",
        variant: "destructive"
      });
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('PRESCRIPTION', 105, 20, { align: 'center' });
    
    // Clinic Info
    doc.setFontSize(10);
    doc.text('Dr. Paramjeet Singh Mann - Pulmonologist', 105, 30, { align: 'center' });
    doc.text('12, Park Street, Kolkata', 105, 36, { align: 'center' });
    doc.text('Phone: +91 98105 89799', 105, 42, { align: 'center' });
    
    // Date
    doc.setFontSize(11);
    doc.text(`Date: ${new Date(appointment.appointment_date).toLocaleDateString()}`, 20, 60);
    doc.text(`Appointment ID: ${appointment.id}`, 20, 68);
    
    // Patient Info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Patient Information:', 20, 85);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Name: ${appointment.full_name}`, 20, 93);
    doc.text(`Email: ${appointment.email}`, 20, 101);
    doc.text(`Phone: ${appointment.phone}`, 20, 109);
    
    // Prescriptions Table
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Prescribed Medications:', 20, 125);
    
    const prescriptionData = appointmentPrescriptions.map((p) => [
      p.medicine_name,
      p.dosage || '-',
      p.frequency || '-',
      p.duration || '-',
      p.instructions || '-'
    ]);
    
    autoTable(doc, {
      startY: 130,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: prescriptionData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.setFontSize(9);
    doc.text('Please follow the prescribed medication schedule.', 105, finalY + 15, { align: 'center' });
    doc.text('Contact us if you have any questions or concerns.', 105, finalY + 22, { align: 'center' });
    
    doc.save(`prescription_${appointment.id}.pdf`);
    
    toast({
      title: "Prescription Downloaded",
      description: "Your prescription has been downloaded successfully"
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Patient Portal</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prescriptions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(a => a.status === 'done').length}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Appointments</CardTitle>
            <CardDescription>View your appointment history and details</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No appointments found</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="pt-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Date & Time</p>
                          <p className="font-medium">
                            {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Doctor</p>
                          <p className="font-medium">{appointment.selected_doctor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            appointment.status === 'done' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="col-span-2 flex gap-2 justify-end">
                          {appointment.status === 'done' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => downloadInvoice(appointment)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Invoice
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => downloadPrescription(appointment)}
                                disabled={prescriptions.filter(p => 
                                  new Date(p.prescribed_date).toDateString() === 
                                  new Date(appointment.appointment_date).toDateString()
                                ).length === 0}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Prescription
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {appointment.message && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-sm">{appointment.message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Medical History */}
        {(prescriptions.length > 0 || labTests.length > 0 || procedures.length > 0) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Complete Medical History</CardTitle>
              <CardDescription>All prescribed medications, lab tests, and procedures across all visits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Prescribed Medicines */}
              {prescriptions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Prescribed Medicines
                  </h3>
                  <div className="space-y-3">
                    {prescriptions
                      .sort((a, b) => new Date(b.prescribed_date).getTime() - new Date(a.prescribed_date).getTime())
                      .map((prescription) => (
                      <div key={prescription.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{prescription.medicine_name}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(prescription.prescribed_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Dosage:</span>{' '}
                                {prescription.dosage || 'N/A'}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Frequency:</span>{' '}
                                {prescription.frequency || 'N/A'}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duration:</span>{' '}
                                {prescription.duration || 'N/A'}
                              </div>
                            </div>
                            {prescription.instructions && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <span className="font-medium">Instructions:</span> {prescription.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Tests */}
              {labTests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Lab Tests
                  </h3>
                  <div className="space-y-3">
                    {labTests
                      .sort((a, b) => new Date(b.prescribed_date).getTime() - new Date(a.prescribed_date).getTime())
                      .map((test) => (
                      <div key={test.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{test.test_name}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(test.prescribed_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Category:</span>{' '}
                                {test.category || 'N/A'}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Sample Type:</span>{' '}
                                {test.sample_type || 'N/A'}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Turnaround Time:</span>{' '}
                                {test.turnaround_time || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedures */}
              {procedures.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Procedures
                  </h3>
                  <div className="space-y-3">
                    {procedures
                      .sort((a, b) => new Date(b.prescribed_date).getTime() - new Date(a.prescribed_date).getTime())
                      .map((procedure) => (
                      <div key={procedure.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{procedure.procedure_name}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(procedure.prescribed_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Category:</span>{' '}
                                {procedure.category || 'N/A'}
                              </div>
                              {procedure.description && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Description:</span>{' '}
                                  {procedure.description}
                                </div>
                              )}
                              {procedure.preparation_instructions && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Preparation:</span>{' '}
                                  {procedure.preparation_instructions}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
