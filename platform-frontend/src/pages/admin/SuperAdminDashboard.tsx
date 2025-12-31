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
import { Switch } from '@/components/ui/switch';
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

  // edit state
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '', specialization: '', qualifications: '', bio: '', consultation_fee: '' });
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editHeroFile, setEditHeroFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
            {loading ? (
              'Loading...'
            ) : doctors.length === 0 ? (
              <div className="text-center py-8">No doctors added yet</div>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Consultation Fee</TableHead>
                    <TableHead className="text-center">Dashboard</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            {doctor.profile_photo_url ? (
                              <img src={doctor.profile_photo_url} className="h-10 w-10 rounded-full object-cover" alt="doctor" />
                            ) : (
                              <UserCog className="h-5 w-5 text-emerald-700" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            {doctor.phone && <p className="text-sm text-muted-foreground">{doctor.phone}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.specialization || '-'}</TableCell>
                      <TableCell>{doctor.consultation_fee ? `₹${doctor.consultation_fee}` : '-'}</TableCell>
                      <TableCell className="text-center">{doctor.is_active ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{doctor.is_active ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => {
                            setSelectedDoctor(doctor);
                            setEditFormData({ name: doctor.name || '', email: doctor.email || '', phone: doctor.phone || '', specialization: doctor.specialization || '', qualifications: doctor.qualifications || '', bio: doctor.bio || '', consultation_fee: doctor.consultation_fee ? String(doctor.consultation_fee) : '' });
                            setEditPhotoFile(null); setEditHeroFile(null);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Dialog open={isEditDialogOpen} onOpenChange={(open)=>{ if(!editLoading) setIsEditDialogOpen(open); }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Doctor</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Label>Name</Label>
                    <Input value={editFormData.name} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} />
                    <Label>Email</Label>
                    <Input value={editFormData.email} onChange={(e)=>setEditFormData({...editFormData, email: e.target.value})} />
                    <Label>Phone</Label>
                    <Input value={editFormData.phone} onChange={(e)=>setEditFormData({...editFormData, phone: e.target.value})} />
                    <Label>Specialization</Label>
                    <Input value={editFormData.specialization} onChange={(e)=>setEditFormData({...editFormData, specialization: e.target.value})} />
                    <Label>Qualifications</Label>
                    <Input value={editFormData.qualifications} onChange={(e)=>setEditFormData({...editFormData, qualifications: e.target.value})} />

                    <div>
                      <Label>Profile photo</Label>
                      <input type="file" accept="image/*" onChange={(e:any)=>setEditPhotoFile(e.target.files?.[0] || null)} />
                    </div>
                    <div>
                      <Label>Hero image</Label>
                      <input type="file" accept="image/*" onChange={(e:any)=>setEditHeroFile(e.target.files?.[0] || null)} />
                    </div>

                    <div className="flex gap-2">
                      <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={async ()=>{
                        if(!selectedDoctor) return;
                        setEditLoading(true);
                        try{
                          const payload = { name: editFormData.name, email: editFormData.email, phone: editFormData.phone, specialization: editFormData.specialization, qualifications: editFormData.qualifications, bio: editFormData.bio, consultationFee: editFormData.consultation_fee ? parseFloat(editFormData.consultation_fee) : null };
                          const res = await fetch(`${getApiBaseUrl()}/api/tenants/${tenant?.id}/doctors/${selectedDoctor.id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(payload) });
                          if(!res.ok) { const js = await res.json().catch(()=>({})); throw new Error(js.error||'Failed to update'); }

                          if(editPhotoFile){ const fd = new FormData(); fd.append('photo', editPhotoFile); const up = await fetch(`${getApiBaseUrl()}/api/tenants/${tenant?.id}/doctors/${selectedDoctor.id}/photo`, { method: 'POST', body: fd }); if(!up.ok){ const js = await up.json().catch(()=>({})); throw new Error(js.error||'Failed to upload photo'); } }
                          if(editHeroFile){ const fd2 = new FormData(); fd2.append('photo', editHeroFile); fd2.append('assetType','hero'); const up2 = await fetch(`${getApiBaseUrl()}/api/tenants/${tenant?.id}/doctors/${selectedDoctor.id}/photo?assetType=hero`, { method: 'POST', body: fd2 }); if(!up2.ok){ const js = await up2.json().catch(()=>({})); throw new Error(js.error||'Hero upload failed'); } }

                          toast({ title: 'Success', description: 'Doctor updated' });
                          setIsEditDialogOpen(false); setSelectedDoctor(null); await fetchDoctors();
                        }catch(err){ const e = err as Error; toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
                        finally{ setEditLoading(false); }
                      }}>
                        {editLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="ghost" onClick={()=>{ if(!editLoading){ setIsEditDialogOpen(false); setSelectedDoctor(null);} }}>Cancel</Button>
                    </div>

                  </div>
                </DialogContent>
              </Dialog>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
