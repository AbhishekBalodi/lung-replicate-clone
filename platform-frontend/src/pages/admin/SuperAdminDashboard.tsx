import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getDevTenantCode } from '@/components/DevTenantSwitcher';
import {
  Plus,
  UserCog,
  Users,
  LogOut,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Stethoscope,
  Building2,
  RefreshCw
} from 'lucide-react';

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

const SuperAdminDashboard = () => {
  const { user, tenant, logout, isSuperAdmin } = useCustomAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

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

  const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL || '';

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const tenantCode = getDevTenantCode();
    if (tenantCode) headers['X-Tenant-Code'] = tenantCode;
    return headers;
  };

  useEffect(() => {
    if (!user || !isSuperAdmin) navigate('/login');
  }, [user, isSuperAdmin, navigate]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/doctors`, {
        headers: getHeaders()
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setDoctors(data.doctors || []);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch doctors',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch doctors',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

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

  // ✅ FIX 1 + FIX 2 APPLIED HERE
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

      const response = await fetch(`${getApiBaseUrl()}/api/doctors`, {
        method: 'POST',
        headers: getHeaders(),
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-xl font-bold">{tenant?.name || 'Hospital'}</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex justify-between flex-row">
            <CardTitle>Manage Doctors</CardTitle>

            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                if (!formLoading) setIsAddDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Doctor
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Doctor</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <Label>Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

                  <Label>Email *</Label>
                  <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                  <Label>Password *</Label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />

                  <Button onClick={handleAddDoctor} disabled={formLoading}>
                    {formLoading ? 'Adding...' : 'Add Doctor'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent>
            {loading ? 'Loading...' : `${doctors.length} doctors`}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
