import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Users, Stethoscope, Bed, Edit2, Trash2, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast } from "sonner";

interface Department {
  id: number;
  name: string;
  head_doctor: string;
  total_doctors: number;
  total_beds: number;
  status: "active" | "inactive";
  description: string;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    head_doctor: "",
    total_beds: 0,
    description: "",
    status: "active" as "active" | "inactive"
  });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      // Use mock data for now
      setDepartments([
        { id: 1, name: "Cardiology", head_doctor: "Dr. Sharma", total_doctors: 5, total_beds: 20, status: "active", description: "Heart and cardiovascular care" },
        { id: 2, name: "Pulmonology", head_doctor: "Dr. Mann", total_doctors: 3, total_beds: 15, status: "active", description: "Lung and respiratory care" },
        { id: 3, name: "Neurology", head_doctor: "Dr. Gupta", total_doctors: 4, total_beds: 18, status: "active", description: "Brain and nervous system care" },
        { id: 4, name: "Orthopedics", head_doctor: "Dr. Singh", total_doctors: 6, total_beds: 25, status: "active", description: "Bone and joint care" },
        { id: 5, name: "Pediatrics", head_doctor: "Dr. Mehta", total_doctors: 4, total_beds: 12, status: "active", description: "Child healthcare" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSave = async () => {
    try {
      if (editingDept) {
        const res = await apiPut(`/api/departments/${editingDept.id}`, formData);
        if (res.ok) {
          toast.success("Department updated successfully");
        }
      } else {
        const res = await apiPost("/api/departments", formData);
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
        await apiDelete(`/api/departments/${id}`);
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
      head_doctor: dept.head_doctor,
      total_beds: dept.total_beds,
      description: dept.description,
      status: dept.status
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingDept(null);
    setFormData({ name: "", head_doctor: "", total_beds: 0, description: "", status: "active" });
    setIsDialogOpen(true);
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.head_doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDoctors = departments.reduce((sum, d) => sum + d.total_doctors, 0);
  const totalBeds = departments.reduce((sum, d) => sum + d.total_beds, 0);

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600">Manage hospital departments and their resources</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
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
                  <Label>Head Doctor</Label>
                  <Input 
                    value={formData.head_doctor}
                    onChange={(e) => setFormData({...formData, head_doctor: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Total Beds</Label>
                  <Input 
                    type="number"
                    value={formData.total_beds}
                    onChange={(e) => setFormData({...formData, total_beds: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingDept ? "Update" : "Add"} Department
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-100">
                <Stethoscope className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{departments.length}</p>
                <p className="text-sm text-gray-600">Total Departments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDoctors}</p>
                <p className="text-sm text-gray-600">Total Doctors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Bed className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBeds}</p>
                <p className="text-sm text-gray-600">Total Beds</p>
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
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Head Doctor</TableHead>
                  <TableHead>Doctors</TableHead>
                  <TableHead>Beds</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No departments found</TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-gray-500">{dept.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{dept.head_doctor}</TableCell>
                      <TableCell>{dept.total_doctors}</TableCell>
                      <TableCell>{dept.total_beds}</TableCell>
                      <TableCell>
                        <Badge variant={dept.status === "active" ? "default" : "secondary"}>
                          {dept.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(dept)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
