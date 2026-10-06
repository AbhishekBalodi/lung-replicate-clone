import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Users, Stethoscope, Bed, Edit2, Trash2, Search, Star, TrendingUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast } from "sonner";

interface Department {
  id: number;
  name: string;
  code: string | null;
  doctor_count: number;
  is_active: number | boolean;
  description: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    is_active: true,
  });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const query = searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : "";
      const res = await apiGet(`/api/dashboard/hospital/departments${query}`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data?.departments) ? data.departments : []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSave = async () => {
    try {
      if (editingDept) {
        const res = await apiPut(`/api/dashboard/hospital/departments/${editingDept.id}`, formData);
        if (res.ok) {
          toast.success("Department updated successfully");
        }
      } else {
        const res = await apiPost("/api/dashboard/hospital/departments", formData);
        if (res.ok) {
          toast.success("Department added successfully");
        }
      }
      setIsDialogOpen(false);
      setEditingDept(null);
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to save department");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        await apiDelete(`/api/dashboard/hospital/departments/${id}`);
        toast.success("Department deleted");
        fetchDepartments();
      } catch (error) {
        toast.error("Failed to delete department");
      }
    }
  };

  const openEditDialog = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code || "",
      description: dept.description || "",
      location: dept.location || "",
      phone: dept.phone || "",
      email: dept.email || "",
      is_active: Boolean(dept.is_active),
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingDept(null);
    setFormData({ name: "", code: "", description: "", location: "", phone: "", email: "", is_active: true });
    setIsDialogOpen(true);
  };

  const filteredDepartments = departments;
  const totalDoctors = departments.reduce((sum, d) => sum + Number(d.doctor_count || 0), 0);
  const activeDepartments = departments.filter((d) => Boolean(d.is_active)).length;

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Hospital Management</p>
                <p className="text-sm text-slate-500">Department details and operational overview</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm hover:opacity-95">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Department Name</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Department Code</Label>
                    <Input 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm hover:opacity-95">
                    {editingDept ? "Update" : "Add"} Department
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
            <p className="text-slate-500">Manage hospital departments and their resources</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                <Stethoscope className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{departments.length}</p>
                <p className="text-sm text-slate-500">Total Departments</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{totalDoctors}</p>
                <p className="text-sm text-slate-500">Total Doctors</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-violet-50 text-violet-600">
                <Bed className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{activeDepartments}</p>
                <p className="text-sm text-slate-500">Active Departments</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full border-slate-200 bg-white shadow-sm"
          />
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              <Input placeholder="Department Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="Head of Department" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <Input placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              <Input placeholder="Contact" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Button onClick={openAddDialog} className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white">Create Department</Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Badge variant="secondary">All Departments</Badge>
              <Badge variant="outline">High Occupancy</Badge>
              <Badge variant="outline">Top Rated</Badge>
              <Badge variant="outline">8 Departments</Badge>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500">Loading...</div>
            ) : filteredDepartments.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No departments found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredDepartments.map((dept) => {
                  const doctorCount = Number(dept.doctor_count || 0);
                  const occupancy = Math.min(95, 20 + doctorCount * 8);
                  return (
                    <Card key={dept.id} className="border-slate-200 shadow-sm overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{dept.name}</p>
                            <p className="text-xs text-slate-500">{dept.location || 'Block A, Floor 2'}</p>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] text-amber-500">
                            <Star className="h-3 w-3" />
                            4.4
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Bed Occupancy</span>
                            <span>{occupancy}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: `${occupancy}%` }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg border border-slate-200 p-2">
                            <p className="text-xs font-semibold text-slate-900">{Math.max(8, doctorCount * 2)}</p>
                            <p className="text-[10px] text-slate-500">Beds</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-2">
                            <p className="text-xs font-semibold text-slate-900">{doctorCount}</p>
                            <p className="text-[10px] text-slate-500">Doctors</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-2">
                            <p className="text-xs font-semibold text-slate-900">{Math.max(6, Math.floor(doctorCount * 1.7))}</p>
                            <p className="text-[10px] text-slate-500">Cases</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 text-emerald-600"><TrendingUp className="h-3 w-3" /> +{Math.max(8, doctorCount * 3)}% this month</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => openEditDialog(dept)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleDelete(dept.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
