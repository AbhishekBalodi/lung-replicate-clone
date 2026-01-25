import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConsoleShell from "@/layouts/ConsoleShell";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast } from "sonner";

interface CallStaff {
  id: number;
  name: string;
  email: string;
  phone: string;
  shift: string;
  calls_today: number;
  calls_total: number;
  status: string;
}

const StaffCallList = () => {
  const [staff, setStaff] = useState<CallStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<CallStaff | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    shift: "Day",
  });

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/dashboard/staff/call-center?search=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error("Error fetching call center staff:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }

    try {
      const res = await apiPost("/api/dashboard/staff/call-center", form);
      if (res.ok) {
        const data = await res.json();
        toast.success("Call center staff added successfully");
        setStaff((prev) => [data.staff, ...prev]);
        setIsDialogOpen(false);
        setForm({ name: "", email: "", phone: "", shift: "Day" });
      } else {
        toast.error("Failed to add staff");
      }
    } catch (err) {
      console.error("Error adding staff:", err);
      toast.error("Failed to add staff");
    }
  };

  const handleUpdate = async () => {
    if (!editingStaff) return;

    try {
      const res = await apiPut(`/api/dashboard/staff/call-center/${editingStaff.id}`, form);
      if (res.ok) {
        const data = await res.json();
        toast.success("Staff updated successfully");
        setStaff((prev) => prev.map((s) => (s.id === editingStaff.id ? data.staff : s)));
        setIsEditDialogOpen(false);
        setEditingStaff(null);
      } else {
        toast.error("Failed to update staff");
      }
    } catch (err) {
      console.error("Error updating staff:", err);
      toast.error("Failed to update staff");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const res = await apiDelete(`/api/dashboard/staff/call-center/${id}`);
      if (res.ok) {
        toast.success("Staff deleted");
        setStaff((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error("Failed to delete staff");
      }
    } catch (err) {
      console.error("Error deleting staff:", err);
      toast.error("Failed to delete staff");
    }
  };

  const openEditDialog = (s: CallStaff) => {
    setEditingStaff(s);
    setForm({
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      shift: s.shift || "Day",
    });
    setIsEditDialogOpen(true);
  };

  return (
    <ConsoleShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call Center Staff
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Call Center Staff</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Shift</Label>
                    <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Day">Day</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                        <SelectItem value="Rotating">Rotating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    Add Staff
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Calls Today</TableHead>
                <TableHead>Total Calls</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No call center staff found
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.phone || "-"}</TableCell>
                    <TableCell>{s.shift}</TableCell>
                    <TableCell>{s.calls_today || 0}</TableCell>
                    <TableCell>{s.calls_total || 0}</TableCell>
                    <TableCell>
                      <Badge className={s.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {s.status || "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(s)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Call Center Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Shift</Label>
              <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Day</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                  <SelectItem value="Rotating">Rotating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Update Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConsoleShell>
  );
};

export default StaffCallList;
