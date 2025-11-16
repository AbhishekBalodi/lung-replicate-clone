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

const PatientDashboard = () => {
  const { user, logout, loading: authLoading } = useCustomAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
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

      // Fetch prescriptions if patient ID exists
      if (user.id) {
        const prescriptionsRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/prescriptions?patient_id=${user.id}`
        );
        
        if (prescriptionsRes.ok) {
          const prescriptionsData = await prescriptionsRes.json();
          setPrescriptions(prescriptionsData);
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

  const downloadPrescription = () => {
    if (prescriptions.length === 0) {
      toast({
        title: "No Prescriptions",
        description: "You don't have any prescriptions yet",
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
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    
    // Patient Info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Patient Information:', 20, 75);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(`Name: ${user?.name}`, 20, 83);
    doc.text(`Email: ${user?.email}`, 20, 91);
    doc.text(`Phone: ${user?.phone}`, 20, 99);
    
    // Prescriptions Table
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Prescribed Medications:', 20, 115);
    
    const prescriptionData = prescriptions.map((p) => [
      p.medicine_name,
      p.dosage || '-',
      p.frequency || '-',
      p.duration || '-',
      p.instructions || '-'
    ]);
    
    autoTable(doc, {
      startY: 120,
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
    
    doc.save(`prescription_${user?.name?.replace(/\s+/g, '_')}.pdf`);
    
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

        {/* Download Buttons */}
        <div className="flex gap-4 mb-8">
          <Button onClick={downloadPrescription} disabled={prescriptions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download Prescription
          </Button>
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
                        <div className="flex items-end justify-end">
                          {appointment.status === 'done' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => downloadInvoice(appointment)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Invoice
                            </Button>
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

        {/* Prescriptions List */}
        {prescriptions.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Prescriptions</CardTitle>
              <CardDescription>Medications prescribed by your doctor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{prescription.medicine_name}</h4>
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
                          <div>
                            <span className="text-muted-foreground">Prescribed:</span>{' '}
                            {new Date(prescription.prescribed_date).toLocaleDateString()}
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
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
