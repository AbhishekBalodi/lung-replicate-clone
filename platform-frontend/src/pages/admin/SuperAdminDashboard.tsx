import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getDevTenantCode } from '@/components/DevTenantSwitcher';
import ConsoleShell from '@/layouts/ConsoleShell';
import DashboardKPICards from '@/components/dashboard/DashboardKPICards';
import SuperAdminKPICards from '@/components/dashboard/SuperAdminKPICards';
import SuperAdminGraphs from '@/components/dashboard/SuperAdminGraphs';
import RescheduleModal from '@/components/RescheduleModal';
import {
  Plus,
  LogOut,
  Edit,
  Trash2,
  Check,
  User,
  Pill,
  FlaskConical,
  Stethoscope,
  FileText,
  Download,
  Eye,
  EyeOff,
  Building2,
  Users,
  Calendar,
  Clock,
  Mail,
  Phone,
  ArrowUpRight,
  Settings2
} from 'lucide-react';
import TabAccessDialog from '@/components/admin/TabAccessDialog';

interface Doctor {
  id: number;
  platform_doctor_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  qualifications: string | null;
  bio: string | null;
  consultation_fee: number | null;
  is_active: boolean;
  created_at: string;
}

interface Appointment {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  created_at?: string | null;
  status?: string | null;
  doctor_id?: number;
  patient_uid?: string;
}

interface Patient {
  id: number;
  patient_uid?: string;
  full_name: string;
  email: string;
  phone: string;
  doctor_id?: number;
  doctor_name?: string;
  created_at?: string;
  last_visit_date?: string;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  created_at?: string;
}

interface Room {
  id: number;
  room_number: string;
  status: string;
  is_occupied: boolean;
}

interface Invoice {
  id: number;
  status: string;
  total_amount: number;
  created_at?: string;
}

const AnalyticsSection = () => (
  <div className="grid gap-6">
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Patient Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-slate-100 rounded flex items-center justify-center">
            Chart placeholder
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-slate-100 rounded flex items-center justify-center">
            Pie chart placeholder
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-slate-100 rounded flex items-center justify-center">
            Bar chart placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const ReportsSection = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Available Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline">Monthly Revenue Summary</Button>
        <Button variant="outline">Patient Demographics</Button>
        <Button variant="outline">Staff Performance</Button>
      </CardContent>
    </Card>
  </div>
);

const NotificationsSection = () => (
  <div className="grid md:grid-cols-2 gap-4">
    <Card>
      <CardHeader>
        <CardTitle>Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>New appointment request</p>
        <p>Appointment confirmed</p>
        <p>System maintenance completed</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span>Email Notifications</span>
          <Switch defaultChecked />
        </div>
        <div className="flex justify-between">
          <span>SMS Notifications</span>
          <Switch />
        </div>
        <div className="flex justify-between">
          <span>Push Notifications</span>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  </div>
);


const SuperAdminDashboard = () => {
  const { user, tenant, logout, isSuperAdmin, loading } = useCustomAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main dashboard state
  const [activeMainTab, setActiveMainTab] = useState<'overview' | 'doctors' | 'patients'>('overview');
  
  // Tab Access Dialog state
  const [tabAccessDialog, setTabAccessDialog] = useState<{
    isOpen: boolean;
    entityType: 'doctor' | 'patient';
    entityId: number;
    entityName: string;
  }>({ isOpen: false, entityType: 'doctor', entityId: 0, entityName: '' });
  
  // Patient dashboard access toggle
  const [togglingPatientId, setTogglingPatientId] = useState<number | null>(null);

  // Doctors state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [togglingDoctorId, setTogglingDoctorId] = useState<number | null>(null);

  // Edit doctor modal state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingFormData, setEditingFormData] = useState({ name: '', email: '', phone: '', specialization: '', qualifications: '', bio: '', consultation_fee: '' });
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editHeroFile, setEditHeroFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);

  // Patients state (all patients from all doctors)
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  // Add Patient modal state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [patientFormLoading, setPatientFormLoading] = useState(false);
  const [patientFormData, setPatientFormData] = useState({
    full_name: '', email: '', phone: '', doctor_id: '', date_of_birth: '', address: '', age: '', gender: '', state: ''
  });

  // Staff state
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  
  // Rooms state
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  // Backend-driven charts (Super Admin)
const [superAdminCharts, setSuperAdminCharts] = useState<any>(null);
const [chartsLoading, setChartsLoading] = useState(false);
const [chartsError, setChartsError] = useState<string | null>(null);

// Backend-driven KPI data
const [kpiData, setKpiData] = useState<any>(null);

  
  // Invoices state
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    qualifications: '',
    bio: '',
    consultation_fee: ''
  });


  useEffect(() => {
    // Wait until loading is complete before checking auth
    if (!loading && (!user || !isSuperAdmin)) {
      navigate('/login');
    }
  }, [user, isSuperAdmin, navigate, loading]);

  // Note: Loading check moved after all hooks to follow React rules of hooks

  // Fetch all doctors
  const fetchDoctors = useCallback(async () => {
    try {
      setDoctorsLoading(true);
      const response = await apiFetch('/api/doctors');
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setDoctors(data.doctors || []);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  // fetch super admin charts
  const fetchSuperAdminCharts = useCallback(async () => {
  try {
    setChartsLoading(true);
    setChartsError(null);

    const res = await apiFetch('/api/dashboard/superadmin/charts', {
      method: 'GET'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || 'Failed to load charts');
    }

    setSuperAdminCharts(data);
  } catch (err: any) {
    setChartsError(err.message || 'Charts API error');
  } finally {
    setChartsLoading(false);
  }
}, []);

  // Fetch backend KPI data
  const fetchKpiData = useCallback(async () => {
    try {
      const res = await apiFetch('/api/dashboard/superadmin', { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        setKpiData(data);
      }
    } catch (err) {
      console.error('Error fetching KPI data:', err);
    }
  }, []);


  // Fetch all appointments (from all doctors in the hospital)
  const fetchAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      const res = await apiFetch('/api/appointment', { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  // Fetch all patients (from all doctors)
  const fetchAllPatients = useCallback(async () => {
    try {
      setPatientsLoading(true);
      const res = await apiFetch('/api/patients', { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        setAllPatients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  // Fetch all staff members
  const fetchAllStaff = useCallback(async () => {
    try {
      const res = await apiFetch('/api/staff', { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        setAllStaff(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      // Fallback: count doctors as staff if staff API not available
      setAllStaff([]);
    }
  }, []);

  // Fetch all rooms
  const fetchAllRooms = useCallback(async () => {
    try {
      const res = await apiFetch('/api/rooms', { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        setAllRooms(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setAllRooms([]);
    }
  }, []);

  // Fetch all invoices
  const fetchAllInvoices = useCallback(async () => {
    try {
      const res = await apiFetch('/api/billing/invoices', { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        setAllInvoices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setAllInvoices([]);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to finish loading before fetching data
    // This ensures dev_tenant_code is hydrated from customTenant in localStorage
    if (loading) return;
    fetchDoctors();
    fetchAppointments();
    fetchAllPatients();
    fetchAllStaff();
    fetchAllRooms();
    fetchAllInvoices();
    fetchKpiData();
  }, [loading, fetchDoctors, fetchAppointments, fetchAllPatients, fetchAllStaff, fetchAllRooms, fetchAllInvoices, fetchKpiData]);

  useEffect(() => {
    if (loading) return;
    fetchSuperAdminCharts();
  }, [loading, fetchSuperAdminCharts]);


  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      specialization: '',
      qualifications: '',
      bio: '',
      consultation_fee: ''
    });
    setShowPassword(false);
  };

  const handleSaveEditDoctor = async () => {
    if (!editingDoctor) return;
    setEditLoading(true);
    try {
      const payload = {
        name: editingFormData.name,
        email: editingFormData.email,
        phone: editingFormData.phone || null,
        specialization: editingFormData.specialization || null,
        qualifications: editingFormData.qualifications || null,
        bio: editingFormData.bio || null,
        consultation_fee: editingFormData.consultation_fee ? parseFloat(editingFormData.consultation_fee) : null
      };

      const res = await apiFetch(`/api/doctors/${editingDoctor.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const js = await res.json().catch(() => ({}));
        throw new Error(js.error || 'Failed to update');
      }

      // If photo file selected, upload
      if (editPhotoFile) {
        const fd = new FormData(); fd.append('photo', editPhotoFile);
        const uploadPath = tenant?.id ? `/api/tenants/${tenant.id}/doctors/${editingDoctor.id}/photo` : `/api/doctors/${editingDoctor.id}/photo`;
        const uploadRes = await apiFetch(uploadPath, { method: 'POST', body: fd, headers: {} });
        if (!uploadRes.ok) {
          const js = await uploadRes.json().catch(() => ({}));
          throw new Error(js.error || 'Failed to upload photo');
        }
      }

      // If hero file selected, upload as assetType=hero
      if (editHeroFile) {
        const fd2 = new FormData(); fd2.append('photo', editHeroFile); fd2.append('assetType', 'hero');
        const uploadPath2 = tenant?.id ? `/api/tenants/${tenant.id}/doctors/${editingDoctor.id}/photo?assetType=hero` : `/api/doctors/${editingDoctor.id}/photo?assetType=hero`;
        const uploadRes2 = await apiFetch(uploadPath2, { method: 'POST', body: fd2, headers: {} });
        if (!uploadRes2.ok) {
          const js = await uploadRes2.json().catch(() => ({}));
          throw new Error(js.error || 'Failed to upload hero image');
        }
      }

      toast({ title: 'Success', description: 'Doctor updated' });
      setIsEditDialogOpen(false); setEditingDoctor(null); await fetchDoctors();
    } catch (err) {
      const e = err as Error; toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Name, email, and password are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setFormLoading(true);

      const response = await apiFetch('/api/doctors', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
          specialization: formData.specialization || null,
          qualifications: formData.qualifications || null,
          bio: formData.bio || null,
          consultation_fee: formData.consultation_fee
            ? parseFloat(formData.consultation_fee)
            : null
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Success',
          description: 'Doctor added successfully'
        });
        setIsAddDialogOpen(false);
        resetForm();
        await fetchDoctors();
      } else {
        toast({
          title: 'Error',
          description: data.error || data.message || 'Failed to add doctor',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add doctor',
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Add patient handler
  const handleAddPatient = async () => {
    if (!patientFormData.full_name || !patientFormData.email || !patientFormData.phone) {
      toast({ title: 'Validation Error', description: 'Name, email, and phone are required', variant: 'destructive' });
      return;
    }
    try {
      setPatientFormLoading(true);
      const response = await apiFetch('/api/patients', {
        method: 'POST',
        body: JSON.stringify({
          full_name: patientFormData.full_name,
          email: patientFormData.email,
          phone: patientFormData.phone,
          doctor_id: patientFormData.doctor_id ? Number(patientFormData.doctor_id) : null,
          date_of_birth: patientFormData.date_of_birth || null,
          address: patientFormData.address || null,
          age: patientFormData.age ? parseInt(patientFormData.age) : null,
          gender: patientFormData.gender || null,
          state: patientFormData.state || null,
        })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        toast({ title: 'Success', description: 'Patient added successfully' });
        setIsAddPatientOpen(false);
        setPatientFormData({ full_name: '', email: '', phone: '', doctor_id: '', date_of_birth: '', address: '', age: '', gender: '', state: '' });
        await fetchAllPatients();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to add patient', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to add patient', variant: 'destructive' });
    } finally {
      setPatientFormLoading(false);
    }
  };

  // Toggle doctor access
  const toggleDoctorAccess = async (doctor: Doctor) => {
    try {
      setTogglingDoctorId(doctor.id);

      const response = await apiFetch(`/api/doctors/${doctor.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          is_active: !doctor.is_active
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Doctor ${doctor.is_active ? 'deactivated' : 'activated'} successfully`
        });
        await fetchDoctors();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update doctor access',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update doctor access',
        variant: 'destructive'
      });
    } finally {
      setTogglingDoctorId(null);
    }
  };

  // Patient details functions
  const fetchPatientRecord = async (email: string, phone: string) => {
    try {
      const q = email ? email : phone;
      const res = await apiFetch(`/api/patients?q=${encodeURIComponent(q)}`, { method: 'GET' });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      return data[0];
    } catch {
      return null;
    }
  };

  const fetchPatientFullData = async (patientId: number) => {
    try {
      const res = await apiFetch(`/api/patients/${patientId}`, { method: 'GET' });
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  };

  const toggleExpand = async (appt: Appointment) => {
    if (expandedRow === appt.id) {
      setExpandedRow(null);
      return;
    }

    setExpandedRow(appt.id);
    setPatientDetails(null);
    setLoadingPatient(true);

    const record = await fetchPatientRecord(appt.email, appt.phone);

    if (!record) {
      setLoadingPatient(false);
      return;
    }

    const fullData = await fetchPatientFullData(record.id);
    const histRes = await apiFetch(`/api/appointment?email=${encodeURIComponent(appt.email)}`, { method: 'GET' });
    const history = await histRes.json();

    setPatientDetails({
      ...record,
      appointments: history || [],
      medicines: fullData?.medicines || [],
      lab_tests: fullData?.lab_tests || [],
      procedures: fullData?.procedures || []
    });

    setLoadingPatient(false);
  };

  const markDone = async (id: number) => {
    setActionBusyId(id);
    try {
      const res = await apiFetch(`/api/appointment/${id}/done`, { method: 'PATCH' });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'done' } : a));
        toast({ title: 'Completed', description: 'Appointment marked as done.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to mark as done', variant: 'destructive' });
    }
    setActionBusyId(null);
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      const res = await apiFetch(`/api/appointment/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setAppointments(prev => prev.filter(a => a.id !== deleteId));
        toast({ title: 'Success', description: 'Appointment cancelled successfully' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel appointment', variant: 'destructive' });
    }
    setDeleteId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate KPI values
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const urgentAppointments = todayAppointments.filter(a => a.status !== 'done').length;
  const activePatients = allPatients.length;
  const newPatients = allPatients.filter(p => {
    if (!p.created_at) return false;
    const createdDate = new Date(p.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate >= weekAgo;
  }).length;

  // Calculate Super Admin specific KPIs
  
  // Total Staff: Count doctors + any other staff from staff API
  const totalStaff = doctors.length + allStaff.length;
  
  // New staff this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newStaffThisMonth = useMemo(() => {
    const newDoctorsThisMonth = doctors.filter(d => {
      if (!d.created_at) return false;
      const createdDate = new Date(d.created_at);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    const newOtherStaffThisMonth = allStaff.filter(s => {
      if (!s.created_at) return false;
      const createdDate = new Date(s.created_at);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    return newDoctorsThisMonth + newOtherStaffThisMonth;
  }, [doctors, allStaff, currentMonth, currentYear]);

  // Room Occupancy Rate calculation
  const totalRooms = allRooms.length || 50; // Default to 50 if no rooms data
  const occupiedRooms = allRooms.filter(r => r.is_occupied || r.status === 'occupied').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const occupancyChange = 5; // Placeholder - would need historical data for real calculation

  // Pending Payments calculation
  const pendingInvoices = allInvoices.filter(inv => inv.status === 'pending' || inv.status === 'unpaid');
  const pendingPayments = pendingInvoices.length;
  const pendingPaymentsAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  // Cancelled Appointments calculation
  const cancelledAppointments = useMemo(() => {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    return appointments.filter(a => {
      if (a.status !== 'cancelled') return false;
      const apptDate = new Date(a.appointment_date);
      return apptDate >= startOfMonth;
    }).length;
  }, [appointments, currentMonth, currentYear]);
  const cancelledChange = -2; // Placeholder - would need historical data for real calculation

  // Group patients by doctor
  const patientsByDoctor = useMemo(() => {
    const grouped: Record<string, Patient[]> = {};
    allPatients.forEach(patient => {
      const doctorName = patient.doctor_name || 'Unassigned';
      if (!grouped[doctorName]) grouped[doctorName] = [];
      grouped[doctorName].push(patient);
    });
    return grouped;
  }, [allPatients]);

  // Show loading state while hydrating auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) return null;

  return (
    <ConsoleShell todayCount={appointments.length}>
      {/* Welcome Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {tenant?.name || 'Hospital Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              Super Admin • Managing {doctors.length} doctors
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs: Overview & Doctors Management */}
      {/* Tab Access Dialog */}
      <TabAccessDialog
        isOpen={tabAccessDialog.isOpen}
        onClose={() => setTabAccessDialog({ ...tabAccessDialog, isOpen: false })}
        entityType={tabAccessDialog.entityType}
        entityId={tabAccessDialog.entityId}
        entityName={tabAccessDialog.entityName}
      />

      {/* Main Tabs: Overview, Doctors, Patients Management */}
      <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as 'overview' | 'doctors' | 'patients')} className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-lg mb-6">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm px-6"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Dashboard Overview
          </TabsTrigger>
          <TabsTrigger
            value="doctors"
            className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm px-6"
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Manage Doctors
          </TabsTrigger>
          <TabsTrigger
            value="patients"
            className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm px-6"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Patients
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          {/* KPI Cards */}
          <DashboardKPICards
            todayAppointments={kpiData?.appointments?.today ?? todayAppointments.length}
            urgentAppointments={urgentAppointments}
            pendingReports={kpiData?.labTests?.pending ?? 0}
            reportsReady={0}
            activePatients={kpiData?.patients?.total ?? activePatients}
            newPatients={kpiData?.patients?.newLast7Days ?? newPatients}
            pendingTasks={kpiData?.tasks?.pending ?? 0}
            highPriorityTasks={kpiData?.tasks?.highPriority ?? 0}
            completedAppointments={kpiData?.appointments?.completedThisMonth ?? appointments.filter(a => a.status === 'done').length}
            cancelledAppointments={kpiData?.appointments?.cancelledThisMonth ?? 0}
            unreadLabReports={kpiData?.labTests?.unread ?? 0}
            emergencyAlerts={kpiData?.emergencyAlerts ?? 0}
            pendingAppointments={kpiData?.appointments?.pending ?? 0}
          />

          {/* Super Admin KPI Cards - Staff, Occupancy, Payments, Cancelled */}
          <div className="mt-6">
            <SuperAdminKPICards
              totalStaff={kpiData?.staff?.total ?? totalStaff}
              newStaffThisMonth={kpiData?.staff?.newThisMonth ?? newStaffThisMonth}
              occupancyRate={occupancyRate}
              occupancyChange={occupancyChange}
              pendingPayments={kpiData?.billing?.unpaidInvoices ?? pendingPayments}
              pendingPaymentsAmount={kpiData?.billing?.pendingPaymentsAmount ?? pendingPaymentsAmount}
              cancelledAppointments={kpiData?.appointments?.cancelledThisMonth ?? cancelledAppointments}
              cancelledChange={cancelledChange}
              totalRooms={kpiData?.rooms?.total ?? totalRooms}
              occupiedRooms={kpiData?.rooms?.occupied ?? occupiedRooms}
              totalPatients={kpiData?.patients?.total ?? allPatients.length}
              todayPatients={kpiData?.patients?.today ?? 0}
              totalAppointments={kpiData?.appointments?.total ?? appointments.length}
              todayAppointments={kpiData?.appointments?.today ?? todayAppointments.length}
              weeklyRevenue={kpiData?.billing?.revenueThisWeek ?? 0}
              monthlyRevenue={kpiData?.billing?.revenueThisMonth ?? 0}
              yearlyRevenue={kpiData?.billing?.revenueThisYear ?? 0}
            />
          </div>

          {/* ===============================
   DYNAMIC KPI CARDS (CALCULATED FROM DATA)
================================ */}

          

          {/* ===============================
   PERFORMANCE METRICS GRAPHS
================================ */}
          <div className="mt-6">
            {chartsLoading ? (
  <div className="flex items-center justify-center h-[350px]">
    <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
  </div>
) : chartsError ? (
  <div className="text-red-500 text-sm">
    Failed to load charts data
  </div>
) : (
  <SuperAdminGraphs
    appointments={appointments}
    patients={allPatients}
    invoices={allInvoices}
    doctors={doctors}
    backendCharts={superAdminCharts}
  />
)}


          </div>


          {/* Quick Stats Cards for Hospital */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
            <Card className="border-l-4 border-l-blue-500 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{doctors.length}</p>
                  <p className="text-sm text-muted-foreground">Total Doctors</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-purple-500 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allPatients.length}</p>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-orange-500 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-500/10">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{doctors.filter(d => d.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Active Doctors</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-green-500 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-500/10">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'done').length}</p>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ============================
   ADVANCED DASHBOARD SECTIONS
============================ */}

          <Card className="mt-10">
            <CardHeader>
              <CardTitle>Detailed Insights</CardTitle>
              <CardDescription>
                Analytics, reports and notifications
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="analytics">
                <TabsList>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics">
                  <AnalyticsSection />
                </TabsContent>

                <TabsContent value="reports">
                  <ReportsSection />
                </TabsContent>

                <TabsContent value="notifications">
                  <NotificationsSection />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>



          {/* All Patients Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                All Hospital Patients
              </CardTitle>
              <CardDescription>
                Patients across all doctors in your hospital
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
                </div>
              ) : allPatients.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No patients found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>UID</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Last Visit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allPatients.slice(0, 10).map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {patient.patient_uid || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{patient.full_name}</TableCell>
                          <TableCell>{patient.email || '-'}</TableCell>
                          <TableCell>{patient.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                              {patient.doctor_name || 'Unassigned'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {patient.last_visit_date
                              ? new Date(patient.last_visit_date).toLocaleDateString()
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {allPatients.length > 10 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" size="sm">
                        View All {allPatients.length} Patients
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments Section */}
          <Card className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">All Appointments</CardTitle>
              <CardDescription>View and manage appointments across all doctors</CardDescription>
            </CardHeader>

            <CardContent className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Header row */}
                  <div className="grid grid-cols-6 gap-3 font-medium text-slate-500 px-5 py-3 border-t border-slate-100">
                    <div>When</div>
                    <div>Patient</div>
                    <div>Doctor</div>
                    <div>Contact</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {/* Rows */}
                  <div className="max-h-[60vh] overflow-y-auto divide-y">
                    {appointmentsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No appointments found
                      </div>
                    ) : (
                      appointments.map((a) => (
                        <div key={a.id}>
                          <div className="grid grid-cols-6 gap-3 items-center px-5 py-4">
                            {/* When */}
                            <div>
                              <div className="font-medium">
                                {new Date(a.appointment_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs rounded-md bg-slate-100 inline-block px-2 py-0.5 mt-1">
                                {a.appointment_time}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">{a.full_name}</div>
                              {a.patient_uid && (
                                <span className="text-xs font-mono text-emerald-600">{a.patient_uid}</span>
                              )}
                            </div>
                            <div>
                              <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                                {a.selected_doctor}
                              </Badge>
                            </div>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{a.email}</span>
                              </div>
                            </div>
                            <div>
                              {a.status === 'done' ? (
                                <Badge className="bg-green-100 text-green-800">Completed</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleExpand(a)}
                              >
                                {expandedRow === a.id ? 'Hide' : 'Details'}
                              </Button>
                              {a.status !== 'done' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                                  disabled={actionBusyId === a.id}
                                  onClick={() => markDone(a.id)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Done
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedRow === a.id && (
                            <div className="col-span-6 bg-slate-50 border border-emerald-200 rounded-lg p-4 mx-5 mb-4">
                              {loadingPatient ? (
                                <div className="flex items-center gap-2 text-emerald-700">
                                  <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-emerald-700 rounded-full"></span>
                                  Loading patient details…
                                </div>
                              ) : patientDetails ? (
                                <div className="space-y-4">
                                  <Card className="border border-emerald-300">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                                        <User className="h-5 w-5 text-emerald-700" />
                                        Patient Information
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-1">
                                      <p><strong>Name:</strong> {patientDetails.full_name}</p>
                                      <p><strong>Email:</strong> {patientDetails.email}</p>
                                      <p><strong>Phone:</strong> {patientDetails.phone}</p>
                                    </CardContent>
                                  </Card>

                                  {/* Medicines */}
                                  {patientDetails.medicines?.length > 0 && (
                                    <Card className="border border-blue-200">
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-blue-800 text-sm flex items-center gap-2">
                                          <Pill className="h-4 w-4" />
                                          Prescribed Medicines ({patientDetails.medicines.length})
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                          {patientDetails.medicines.map((m: any, i: number) => (
                                            <Badge key={i} variant="outline">{m.medicine_name}</Badge>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Lab Tests */}
                                  {patientDetails.lab_tests?.length > 0 && (
                                    <Card className="border border-amber-200">
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-amber-800 text-sm flex items-center gap-2">
                                          <FlaskConical className="h-4 w-4" />
                                          Lab Tests ({patientDetails.lab_tests.length})
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                          {patientDetails.lab_tests.map((t: any, i: number) => (
                                            <Badge key={i} variant="outline">{t.test_name}</Badge>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              ) : (
                                <p className="text-muted-foreground">No patient record found</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* DOCTORS MANAGEMENT TAB */}
        <TabsContent value="doctors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-emerald-600" />
                  Manage Doctors
                </CardTitle>
                <CardDescription>
                  Add doctors and control their access to the admin dashboard
                </CardDescription>
              </div>

              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(open) => {
                  if (!formLoading) setIsAddDialogOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Doctor
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Doctor</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. John Smith"
                      />
                    </div>

                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="doctor@hospital.com"
                      />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <Label>Password *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label>Specialization</Label>
                      <Input
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="Pulmonology"
                      />
                    </div>

                    <div>
                      <Label>Consultation Fee</Label>
                      <Input
                        type="number"
                        value={formData.consultation_fee}
                        onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                        placeholder="500"
                      />
                    </div>

                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleAddDoctor}
                      disabled={formLoading}
                    >
                      {formLoading ? 'Adding...' : 'Add Doctor'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              {doctorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-12">
                  <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No doctors added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Click "Add Doctor" to get started</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Consultation Fee</TableHead>
                        <TableHead className="text-center">Dashboard Access</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tab Settings</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                {(doctor as any).profile_photo_url ? (
                                  <img src={(doctor as any).profile_photo_url} className="h-10 w-10 rounded-full object-cover" alt="doctor" />
                                ) : (
                                  <User className="h-5 w-5 text-emerald-700" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{doctor.name}</p>
                                {doctor.phone && (
                                  <p className="text-sm text-muted-foreground">{doctor.phone}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{doctor.email}</TableCell>
                          <TableCell>{doctor.specialization || '-'}</TableCell>
                          <TableCell>
                            {doctor.consultation_fee
                              ? `₹${doctor.consultation_fee}`
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={doctor.is_active}
                              onCheckedChange={() => toggleDoctorAccess(doctor)}
                              disabled={togglingDoctorId === doctor.id}
                            />
                          </TableCell>
                          <TableCell>
                            {doctor.is_active ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTabAccessDialog({
                                isOpen: true,
                                entityType: 'doctor',
                                entityId: doctor.id,
                                entityName: doctor.name
                              })}
                            >
                              <Settings2 className="h-4 w-4 mr-1" />
                              Configure Tabs
                            </Button>
                          </TableCell>

                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => {
                                setEditingDoctor(doctor);
                                setEditingFormData({
                                  name: doctor.name || '',
                                  email: doctor.email || '',
                                  phone: doctor.phone || '',
                                  specialization: doctor.specialization || '',
                                  qualifications: doctor.qualifications || '',
                                  bio: doctor.bio || '',
                                  consultation_fee: doctor.consultation_fee ? String(doctor.consultation_fee) : ''
                                });
                                setEditPhotoFile(null);
                                setIsEditDialogOpen(true);
                              }}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Edit Doctor Dialog */}
                  <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!editLoading) setIsEditDialogOpen(open); }}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Doctor</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Name *</Label>
                          <Input value={editingFormData.name} onChange={(e) => setEditingFormData({ ...editingFormData, name: e.target.value })} />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input value={editingFormData.email} onChange={(e) => setEditingFormData({ ...editingFormData, email: e.target.value })} />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input value={editingFormData.phone} onChange={(e) => setEditingFormData({ ...editingFormData, phone: e.target.value })} />
                        </div>
                        <div>
                          <Label>Specialization</Label>
                          <Input value={editingFormData.specialization} onChange={(e) => setEditingFormData({ ...editingFormData, specialization: e.target.value })} />
                        </div>
                        <div>
                          <Label>Qualifications</Label>
                          <Input value={editingFormData.qualifications} onChange={(e) => setEditingFormData({ ...editingFormData, qualifications: e.target.value })} />
                        </div>
                        <div>
                          <Label>Bio</Label>
                          <Input value={editingFormData.bio} onChange={(e) => setEditingFormData({ ...editingFormData, bio: e.target.value })} />
                        </div>
                        <div>
                          <Label>Consultation Fee</Label>
                          <Input type="number" value={editingFormData.consultation_fee} onChange={(e) => setEditingFormData({ ...editingFormData, consultation_fee: e.target.value })} />
                        </div>

                        <div>
                          <Label>Profile photo</Label>
                          <input type="file" accept="image/*" onChange={(e: any) => { setEditPhotoFile(e.target.files?.[0] || null); }} />
                        </div>

                        <div>
                          <Label>Hero image (optional)</Label>
                          <input type="file" accept="image/*" onChange={(e: any) => { setEditHeroFile(e.target.files?.[0] || null); }} />
                        </div>

                        <div className="flex gap-2">
                          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveEditDoctor} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
                          <Button variant="ghost" onClick={() => { if (!editLoading) { setIsEditDialogOpen(false); setEditingDoctor(null); } }}>Cancel</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardContent>
          </Card>

          {/* Patients by Doctor */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Patients by Doctor
              </CardTitle>
              <CardDescription>
                See patient distribution across your doctors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(patientsByDoctor).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No patient data available</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(patientsByDoctor).map(([doctorName, patients]) => (
                    <Card key={doctorName} className="border-l-4 border-l-purple-400">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <Stethoscope className="h-5 w-5 text-purple-700" />
                            </div>
                            <div>
                              <p className="font-medium">{doctorName}</p>
                              <p className="text-sm text-muted-foreground">
                                {patients.length} patient{patients.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PATIENTS MANAGEMENT TAB */}
        <TabsContent value="patients">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Manage Patients
                </CardTitle>
                <CardDescription>
                  Control patient access to their dashboard and configure tab permissions
                </CardDescription>
              </div>

              <Dialog open={isAddPatientOpen} onOpenChange={(open) => { if (!patientFormLoading) setIsAddPatientOpen(open); }}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => { setPatientFormData({ full_name: '', email: '', phone: '', doctor_id: '', date_of_birth: '', address: '', age: '', gender: '', state: '' }); setIsAddPatientOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Patient</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input value={patientFormData.full_name} onChange={(e) => setPatientFormData({ ...patientFormData, full_name: e.target.value })} placeholder="Patient name" />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={patientFormData.email} onChange={(e) => setPatientFormData({ ...patientFormData, email: e.target.value })} placeholder="patient@example.com" />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Input value={patientFormData.phone} onChange={(e) => setPatientFormData({ ...patientFormData, phone: e.target.value })} placeholder="10-digit phone number" />
                    </div>
                    <div>
                      <Label>Assign Doctor</Label>
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={patientFormData.doctor_id}
                        onChange={(e) => setPatientFormData({ ...patientFormData, doctor_id: e.target.value })}
                      >
                        <option value="">-- Unassigned --</option>
                        {doctors.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} {d.specialization ? `(${d.specialization})` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input type="date" value={patientFormData.date_of_birth} onChange={(e) => setPatientFormData({ ...patientFormData, date_of_birth: e.target.value })} />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={patientFormData.address} onChange={(e) => setPatientFormData({ ...patientFormData, address: e.target.value })} placeholder="Patient address" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Age</Label>
                        <Input
                          type="number"
                          value={patientFormData.age}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                            setPatientFormData({ ...patientFormData, age: val });
                          }}
                          placeholder="e.g. 25"
                          min="1"
                          max="99"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          value={patientFormData.gender}
                          onChange={(e) => setPatientFormData({ ...patientFormData, gender: e.target.value })}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input value={patientFormData.state} onChange={(e) => setPatientFormData({ ...patientFormData, state: e.target.value })} placeholder="Enter state" />
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleAddPatient} disabled={patientFormLoading}>
                      {patientFormLoading ? 'Adding...' : 'Add Patient'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              {patientsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full" />
                </div>
              ) : allPatients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No patients registered yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assigned Doctor</TableHead>
                      <TableHead className="text-center">Dashboard Access</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tab Settings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-purple-700" />
                            </div>
                            <p className="font-medium">{patient.full_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>{patient.email || '-'}</TableCell>
                        <TableCell>{patient.phone || '-'}</TableCell>
                        <TableCell>{patient.doctor_name || 'Unassigned'}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={(patient as any).is_active !== false}
                            onCheckedChange={async () => {
                              setTogglingPatientId(patient.id);
                              try {
                                await apiFetch(`/api/access-control/patient/${patient.id}/access`, {
                                  method: 'PUT',
                                  body: JSON.stringify({ is_active: (patient as any).is_active === false })
                                });
                                fetchAllPatients();
                                toast({ title: 'Success', description: 'Patient access updated' });
                              } catch {
                                toast({ title: 'Error', description: 'Failed to update access', variant: 'destructive' });
                              }
                              setTogglingPatientId(null);
                            }}
                            disabled={togglingPatientId === patient.id}
                          />
                        </TableCell>
                        <TableCell>
                          {(patient as any).is_active !== false ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setTabAccessDialog({
                              isOpen: true,
                              entityType: 'patient',
                              entityId: patient.id,
                              entityName: patient.full_name
                            })}
                          >
                            <Settings2 className="h-4 w-4 mr-1" />
                            Configure Tabs
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            fetchAppointments();
            setRescheduleAppointment(null);
          }}
        />
      )}
    </ConsoleShell>
  );
};

export default SuperAdminDashboard;
