import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { useAppointments } from "@/contexts/AppointmentContext";
import ConsoleShell from "../layouts/ConsoleShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Check, FileText, Eye, EyeOff, Download, Filter, CalendarIcon } from "lucide-react";
import RescheduleModal from "@/components/RescheduleModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  status?: string | null;
  created_at?: string | null;
  department?: string | null;
}

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useCustomAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Use shared appointment context
  const { 
    appointments, 
    loading, 
    fetchAppointments, 
    markAppointmentDone, 
    cancelAppointment 
  } = useAppointments();

  const [actionBusyId, setActionBusyId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  
  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const searchQuery = searchParams.get("q")?.toLowerCase() || "";
  
  // Extract unique doctors and departments for filters
  const uniqueDoctors = useMemo(() => {
    const doctors = new Set(appointments.map(a => a.selected_doctor));
    return Array.from(doctors).filter(Boolean);
  }, [appointments]);
  
  const uniqueDepartments = useMemo(() => {
    // Mock departments - in real implementation, this would come from the backend
    const defaultDepts = ["Cardiology", "Pulmonology", "General Medicine", "Orthopedics", "Pediatrics", "Neurology"];
    const appointmentDepts = appointments.map(a => a.department).filter(Boolean) as string[];
    const allDepts = new Set([...defaultDepts, ...appointmentDepts]);
    return Array.from(allDepts);
  }, [appointments]);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, fetchAppointments]);

  const markDone = async (id: number) => {
    setActionBusyId(id);
    const success = await markAppointmentDone(id);
    if (success) {
      toast({ title: "Completed", description: "Appointment marked as done." });
    } else {
      toast({ title: "Error", description: "Failed to mark as done", variant: "destructive" });
    }
    setActionBusyId(null);
  };

  const cancel = async (id: number) => {
    setActionBusyId(id);
    const success = await cancelAppointment(id);
    if (success) {
      toast({ title: "Cancelled", description: "Appointment cancelled." });
    } else {
      toast({ title: "Error", description: "Failed to cancel appointment", variant: "destructive" });
    }
    setActionBusyId(null);
  };

  // Filter appointments based on search query and filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // Search query filter
      if (searchQuery) {
        const matchesSearch = 
          a.full_name.toLowerCase().includes(searchQuery) ||
          a.email.toLowerCase().includes(searchQuery) ||
          a.phone.toLowerCase().includes(searchQuery) ||
          a.selected_doctor.toLowerCase().includes(searchQuery);
        if (!matchesSearch) return false;
      }
      
      // Doctor filter
      if (selectedDoctor !== "all" && a.selected_doctor !== selectedDoctor) {
        return false;
      }
      
      // Department filter (for "department" tab)
      if (activeTab === "department" && selectedDepartment !== "all") {
        // Map doctor to department (mock - in real app this would come from backend)
        const doctorDepartmentMap: Record<string, string> = {
          "Dr. Mann": "Pulmonology",
          "Dr. Smith": "Cardiology",
          "Dr. Raj": "General Medicine",
        };
        const apptDept = a.department || doctorDepartmentMap[a.selected_doctor] || "General Medicine";
        if (apptDept !== selectedDepartment) return false;
      }
      
      // Date filter
      if (selectedDate) {
        const apptDate = new Date(a.appointment_date).toDateString();
        if (apptDate !== selectedDate.toDateString()) return false;
      }
      
      // Status filter
      if (selectedStatus !== "all") {
        const apptStatus = a.status || "pending";
        if (apptStatus !== selectedStatus) return false;
      }
      
      return true;
    });
  }, [appointments, searchQuery, selectedDoctor, selectedDepartment, selectedDate, selectedStatus, activeTab]);

  // Check if appointment is done
  const isDone = (a: Appointment) => a.status === "done";
  
  // Get status badge
  const getStatusBadge = (status: string | null | undefined) => {
    const s = status || "pending";
    const variants: Record<string, { className: string; label: string }> = {
      done: { className: "bg-green-100 text-green-800", label: "Done" },
      pending: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      cancelled: { className: "bg-red-100 text-red-800", label: "Cancelled" },
      confirmed: { className: "bg-blue-100 text-blue-800", label: "Confirmed" },
    };
    const variant = variants[s] || variants.pending;
    return <Badge className={cn("text-xs", variant.className)}>{variant.label}</Badge>;
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedDoctor("all");
    setSelectedDepartment("all");
    setSelectedDate(undefined);
    setSelectedStatus("all");
  };

  // PDF generators
  const generateInvoicePDF = (appointment: Appointment) => {
    window.open(`/api/invoice/${appointment.id}`, "_blank");
  };

  const generatePrescriptionPDF = (appointment: Appointment) => {
    window.open(`/api/prescription/${appointment.id}`, "_blank");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p>Loading…</p>
      </div>
    );
  }

  const renderActions = (a: Appointment) => {
    if (isDone(a)) {
      // Done appointments: Invoice, Prescription, Details/Hide
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => generateInvoicePDF(a)}
          >
            <FileText className="h-4 w-4 mr-1" /> Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => generatePrescriptionPDF(a)}
          >
            <Download className="h-4 w-4 mr-1" /> Prescription
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
          >
            {expandedId === a.id ? (
              <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
            ) : (
              <><Eye className="h-4 w-4 mr-1" /> Details</>
            )}
          </Button>
        </>
      );
    }

    // Pending/scheduled appointments: Details, Reschedule, Cancel, Done
    return (
      <>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
        >
          {expandedId === a.id ? (
            <><EyeOff className="h-4 w-4 mr-1" /> Hide</>
          ) : (
            <><Eye className="h-4 w-4 mr-1" /> Details</>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={actionBusyId === a.id}
          onClick={() => setRescheduleAppointment(a)}
        >
          <Edit className="h-4 w-4 mr-1" /> Reschedule
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="shrink-0"
          disabled={actionBusyId === a.id}
          onClick={() => cancel(a.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
          disabled={actionBusyId === a.id}
          onClick={() => markDone(a.id)}
        >
          <Check className="h-4 w-4 mr-1" /> Done
        </Button>
      </>
    );
  };

  return (
    <ConsoleShell todayCount={filteredAppointments.length}>
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Appointments</CardTitle>
          <CardDescription>
            {searchQuery ? `Search results for "${searchQuery}"` : "Your full list of appointments"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-5 pt-3 border-b border-slate-100">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">All Appointments</TabsTrigger>
                <TabsTrigger value="department">By Department</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Filters Section */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">Filters:</span>
                
                {/* Doctor Filter */}
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="w-[160px] bg-white">
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {uniqueDoctors.map((doc) => (
                      <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Department Filter (visible in department tab) */}
                {activeTab === "department" && (
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[180px] bg-white">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {uniqueDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Date Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[160px] justify-start text-left font-normal bg-white",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Clear Filters */}
                {(selectedDoctor !== "all" || selectedDepartment !== "all" || selectedDate || selectedStatus !== "all") && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
            
            <TabsContent value="all" className="m-0">
              {renderAppointmentsTable()}
            </TabsContent>
            
            <TabsContent value="department" className="m-0">
              {renderAppointmentsTable()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <RescheduleModal
          isOpen={!!rescheduleAppointment}
          onClose={() => setRescheduleAppointment(null)}
          appointmentId={rescheduleAppointment.id}
          patientName={rescheduleAppointment.full_name}
          currentDate={rescheduleAppointment.appointment_date}
          currentTime={rescheduleAppointment.appointment_time}
          onSuccess={() => {
            setRescheduleAppointment(null);
            fetchAppointments();
          }}
        />
      )}
    </ConsoleShell>
  );
  
  function renderAppointmentsTable() {
    return (
      <>
        {/* Desktop table view */}
        <div className="hidden lg:block w-full overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="grid grid-cols-7 gap-3 font-medium text-slate-500 px-5 py-3 border-b border-slate-100">
              <div>When</div>
              <div>Patient</div>
              <div>Doctor</div>
              <div>Department</div>
              <div>Status</div>
              <div>Notes</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="divide-y">
              {filteredAppointments.map((a) => {
                // Mock department mapping
                const doctorDepartmentMap: Record<string, string> = {
                  "Dr. Mann": "Pulmonology",
                  "Dr. Smith": "Cardiology",
                  "Dr. Raj": "General Medicine",
                };
                const department = a.department || doctorDepartmentMap[a.selected_doctor] || "General Medicine";
                
                return (
                  <div key={a.id} className="grid grid-cols-7 gap-3 items-center px-5 py-4">
                    <div>
                      <div className="font-medium">
                        {new Date(a.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs rounded-md bg-slate-100 inline-block px-2 py-0.5 mt-1">
                        {a.appointment_time}
                      </div>
                    </div>
                    <div className="font-medium">{a.full_name}</div>
                    <div>{a.selected_doctor}</div>
                    <div>
                      <span className="text-xs rounded-md bg-purple-100 text-purple-800 px-2 py-0.5">
                        {department}
                      </span>
                    </div>
                    <div>{getStatusBadge(a.status)}</div>
                    <div className="text-sm text-slate-500 truncate">{a.message ?? "-"}</div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      {renderActions(a)}
                    </div>
                  </div>
                );
              })}

              {!filteredAppointments.length && (
                <div className="text-center py-12 text-slate-500">
                  {searchQuery ? `No appointments found for "${searchQuery}"` : "No appointments"}
                  <div className="mt-4">
                    <Button onClick={() => navigate("/book-appointment")}>
                      Book Appointment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="lg:hidden divide-y">
          {filteredAppointments.map((a) => {
            const doctorDepartmentMap: Record<string, string> = {
              "Dr. Mann": "Pulmonology",
              "Dr. Smith": "Cardiology",
              "Dr. Raj": "General Medicine",
            };
            const department = a.department || doctorDepartmentMap[a.selected_doctor] || "General Medicine";
            
            return (
              <div key={a.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-base">
                      {new Date(a.appointment_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{a.appointment_time}</div>
                    <div className="mt-1">{getStatusBadge(a.status)}</div>
                  </div>
                  <span className="text-xs rounded-md bg-purple-100 text-purple-800 px-2 py-1">
                    {department}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div><span className="text-slate-500">Patient:</span> <span className="font-medium">{a.full_name}</span></div>
                  <div><span className="text-slate-500">Doctor:</span> {a.selected_doctor}</div>
                  {a.message && (
                    <div><span className="text-slate-500">Notes:</span> {a.message}</div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {renderActions(a)}
                </div>
              </div>
            );
          })}

          {!filteredAppointments.length && (
            <div className="text-center py-12 text-slate-500">
              {searchQuery ? `No appointments found for "${searchQuery}"` : "No appointments"}
              <div className="mt-4">
                <Button onClick={() => navigate("/book-appointment")}>
                  Book Appointment
                </Button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}