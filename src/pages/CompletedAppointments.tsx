import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FileText, Download, Search } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { apiFetch } from "@/lib/api";

type Appointment = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  status: string;
  created_at: string;
};

type Medicine = {
  id: number;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  prescribed_date: string | null;
};

// NOTE: Use apiFetch so tenant + doctor context headers are always attached.

export default function CompletedAppointments() {
  const { user, loading: authLoading } = useCustomAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      fetchCompletedAppointments();
    }
  }, [user]);

  const fetchCompletedAppointments = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/appointment?status=done`, { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load appointments");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Failed to load completed appointments: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientPrescriptions = async (patientName: string): Promise<Medicine[]> => {
    try {
      // First get patient ID
      const patientsRes = await apiFetch(
        `/api/patients?q=${encodeURIComponent(patientName)}`,
        { method: "GET" }
      );
      const patients = await patientsRes.json();
      
      if (!patients || patients.length === 0) {
        return [];
      }

      const patientId = patients[0].id;
      
      // Then get prescriptions
      const prescRes = await apiFetch(
        `/api/prescriptions?patient_id=${patientId}`,
        { method: "GET" }
      );
      const medicines = await prescRes.json();
      
      return Array.isArray(medicines) ? medicines : [];
    } catch (err: any) {
      console.error("Error fetching prescriptions:", err);
      return [];
    }
  };

  const generateInvoicePDF = (appointment: Appointment) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text("MEDICAL INVOICE", 105, 20, { align: "center" });
    
    // Clinic Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Delhi Chest Physician", 20, 35);
    doc.text("Phone: +91-XXXXXXXXXX", 20, 40);
    doc.text("Email: info@delhichestphysician.com", 20, 45);
    
    // Invoice details
    doc.setFontSize(12);
    doc.text(`Invoice Date: ${format(new Date(), "dd/MM/yyyy")}`, 20, 60);
    doc.text(`Invoice #: INV-${appointment.id}`, 20, 67);
    
    // Patient details
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Patient Information:", 20, 80);
    doc.setFont(undefined, "normal");
    doc.setFontSize(11);
    doc.text(`Name: ${appointment.full_name}`, 20, 88);
    doc.text(`Email: ${appointment.email}`, 20, 95);
    doc.text(`Phone: ${appointment.phone}`, 20, 102);
    doc.text(`Appointment Date: ${format(new Date(appointment.appointment_date), "dd/MM/yyyy")}`, 20, 109);
    doc.text(`Appointment Time: ${appointment.appointment_time}`, 20, 116);
    doc.text(`Doctor: ${appointment.selected_doctor}`, 20, 123);
    
    // Services table
    autoTable(doc, {
      startY: 135,
      head: [["Service Description", "Amount (₹)"]],
      body: [
        ["Consultation Fee", "500.00"],
        ["Medical Records", "100.00"],
        ["Total", "600.00"]
      ],
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129] },
      foot: [["Total Amount", "₹600.00"]],
      footStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: "bold" }
    });
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for choosing our services!", 105, pageHeight - 20, { align: "center" });
    doc.text("For any queries, please contact us at the above details.", 105, pageHeight - 15, { align: "center" });
    
    doc.save(`invoice-${appointment.full_name.replace(/\s+/g, "-")}-${appointment.id}.pdf`);
    toast.success("Invoice PDF downloaded successfully");
  };

  const generatePrescriptionPDF = async (appointment: Appointment) => {
    toast.info("Generating prescription PDF...");
    
    const medicines = await fetchPatientPrescriptions(appointment.full_name);
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text("PRESCRIPTION", 105, 20, { align: "center" });
    
    // Clinic Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Delhi Chest Physician", 20, 35);
    doc.text("Phone: +91-XXXXXXXXXX | Email: info@delhichestphysician.com", 20, 40);
    
    doc.line(20, 45, 190, 45);
    
    // Patient details
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Patient Information:", 20, 55);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${appointment.full_name}`, 20, 62);
    doc.text(`Phone: ${appointment.phone}`, 20, 68);
    doc.text(`Email: ${appointment.email}`, 20, 74);
    doc.text(`Date: ${format(new Date(appointment.appointment_date), "dd/MM/yyyy")}`, 130, 62);
    doc.text(`Doctor: ${appointment.selected_doctor}`, 130, 68);
    
    doc.line(20, 78, 190, 78);
    
    // Prescriptions
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Prescribed Medications:", 20, 88);
    
    if (medicines.length === 0) {
      doc.setFont(undefined, "normal");
      doc.setFontSize(11);
      doc.text("No prescriptions recorded for this patient.", 20, 98);
    } else {
      const tableData = medicines.map((med) => [
        med.medicine_name,
        med.dosage || "N/A",
        med.frequency || "N/A",
        med.duration || "N/A",
        med.instructions || "N/A"
      ]);
      
      autoTable(doc, {
        startY: 95,
        head: [["Medicine", "Dosage", "Frequency", "Duration", "Instructions"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 50 }
        }
      });
    }
    
    // Doctor signature area
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text("Doctor's Signature: _____________________", 120, pageHeight - 30);
    doc.text(`Dr. ${appointment.selected_doctor}`, 120, pageHeight - 22);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("This is a computer-generated prescription.", 105, pageHeight - 10, { align: "center" });
    
    doc.save(`prescription-${appointment.full_name.replace(/\s+/g, "-")}-${appointment.id}.pdf`);
    toast.success("Prescription PDF downloaded successfully");
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.phone.includes(searchTerm)
  );

  return (
    <ConsoleShell>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Completed Appointments</h1>
          <p className="text-emerald-700">View and download documents for completed appointments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Completed Appointments ({filteredAppointments.length})</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-emerald-600">Loading...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No appointments found matching your search." : "No completed appointments yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Appointment Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">{apt.full_name}</TableCell>
                        <TableCell>{apt.email}</TableCell>
                        <TableCell>{apt.phone}</TableCell>
                        <TableCell>{format(new Date(apt.appointment_date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{apt.appointment_time}</TableCell>
                        <TableCell>{apt.selected_doctor}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateInvoicePDF(apt)}
                              className="gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              Invoice
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generatePrescriptionPDF(apt)}
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Prescription
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
