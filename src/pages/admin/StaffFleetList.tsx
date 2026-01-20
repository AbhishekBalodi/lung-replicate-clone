import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Ambulance, Edit, Search } from "lucide-react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";

interface FleetItem {
  id: number;
  driver_name: string;
  vehicle_number: string;
  vehicle_type: string;
  status: "available" | "on_call" | "maintenance";
  phone?: string;
  license_number?: string;
}

const StaffFleetList = () => {
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    driver_name: "",
    vehicle_number: "",
    vehicle_type: "Ambulance",
    status: "available",
    phone: "",
    license_number: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/dashboard/ambulance/fleet");
      if (res.ok) {
        const data = await res.json();
        setFleet(data.fleet || []);
      }
    } catch (error) {
      console.error("Error fetching fleet:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddFleet = async () => {
    if (!formData.driver_name || !formData.vehicle_number) {
      toast.error("Driver name and vehicle number are required");
      return;
    }
    try {
      const res = await apiPost("/api/dashboard/ambulance/fleet", formData);
      if (res.ok) {
        const data = await res.json();
        toast.success("Fleet added successfully");
        setIsDialogOpen(false);
        setFormData({ driver_name: "", vehicle_number: "", vehicle_type: "Ambulance", status: "available", phone: "", license_number: "" });
        if (data.vehicle) {
          setFleet(prev => [...prev, data.vehicle]);
        } else {
          fetchData();
        }
      } else {
        toast.error("Failed to add fleet");
      }
    } catch (error) {
      toast.error("Failed to add fleet");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await apiPut(`/api/dashboard/ambulance/fleet/${id}`, { status });
      if (res.ok) {
        toast.success("Status updated");
        setFleet(prev => prev.map(f => f.id === id ? { ...f, status: status as any } : f));
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredFleet = fleet.filter(f =>
    f.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "on_call": return "bg-blue-100 text-blue-800";
      case "maintenance": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ConsoleShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ambulance className="h-5 w-5" />
            Fleet & Ambulance Staff
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Fleet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Fleet/Ambulance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Driver Name</Label>
                  <Input value={formData.driver_name} onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })} placeholder="Driver name" />
                </div>
                <div>
                  <Label>Vehicle Number</Label>
                  <Input value={formData.vehicle_number} onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })} placeholder="e.g., DL 01 AB 1234" />
                </div>
                <div>
                  <Label>Vehicle Type</Label>
                  <Select value={formData.vehicle_type} onValueChange={(v) => setFormData({ ...formData, vehicle_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ambulance">Ambulance</SelectItem>
                      <SelectItem value="ICU Ambulance">ICU Ambulance</SelectItem>
                      <SelectItem value="Patient Transport">Patient Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" />
                </div>
                <div>
                  <Label>License Number</Label>
                  <Input value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} placeholder="License number" />
                </div>
                <Button onClick={handleAddFleet} className="w-full">Add Fleet</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search fleet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle No</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredFleet.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No fleet found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFleet.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.driver_name}</TableCell>
                      <TableCell>{f.vehicle_number}</TableCell>
                      <TableCell>{f.vehicle_type}</TableCell>
                      <TableCell>{f.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(f.status)}>
                          {f.status.replace("_", " ").charAt(0).toUpperCase() + f.status.replace("_", " ").slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select value={f.status} onValueChange={(v) => handleUpdateStatus(f.id, v)}>
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="on_call">On Call</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </ConsoleShell>
  );
};

export default StaffFleetList;
