import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  department: string;
  status: "available" | "occupied" | "maintenance";
  patient_name?: string;
  doctor_name?: string;
}

interface RoomsSummary {
  total: number;
  available: number;
  occupied: number;
  byDepartment: { department: string; total: number; available: number; occupied: number }[];
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [summary, setSummary] = useState<RoomsSummary>({ total: 0, available: 0, occupied: 0, byDepartment: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDepartment, setActiveDepartment] = useState<string>("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "General",
    department: "",
    status: "available"
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, roomsRes] = await Promise.all([
        apiGet("/api/dashboard/rooms/summary"),
        apiGet("/api/dashboard/rooms/list")
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddRoom = async () => {
    if (!formData.room_number || !formData.department) {
      toast.error("Room number and department are required");
      return;
    }
    try {
      const res = await apiPost("/api/dashboard/rooms", formData);
      if (res.ok) {
        const data = await res.json();
        toast.success("Room added successfully");
        setIsDialogOpen(false);
        setFormData({ room_number: "", room_type: "General", department: "", status: "available" });
        if (data.room) {
          setRooms(prev => [...prev, data.room]);
        } else {
          fetchData();
        }
      } else {
        toast.error("Failed to add room");
      }
    } catch (error) {
      toast.error("Failed to add room");
    }
  };

  const departments = ["All", ...new Set(summary.byDepartment.map(d => d.department))];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = activeDepartment === "All" || room.department === activeDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <ConsoleShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Rooms by Department</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Room Number</Label>
                <Input value={formData.room_number} onChange={(e) => setFormData({ ...formData, room_number: e.target.value })} placeholder="e.g., 101" />
              </div>
              <div>
                <Label>Room Type</Label>
                <Select value={formData.room_type} onValueChange={(v) => setFormData({ ...formData, room_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g., Cardiology" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddRoom} className="w-full">Add Room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
      ) : (
        <>
          {/* Department summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {summary.byDepartment.slice(0, 3).map(dep => (
              <Card key={dep.department} className="p-4">
                <h3 className="font-medium">{dep.department}</h3>
                <p className="text-2xl font-bold mt-2">{dep.total}</p>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-green-600">Available: {dep.available}</span>
                  <span className="text-red-500">Occupied: {dep.occupied}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Department tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {departments.map(dep => (
              <button
                key={dep}
                onClick={() => setActiveDepartment(dep)}
                className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
                  activeDepartment === dep ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {dep}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search rooms..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map(room => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.room_number}</TableCell>
                      <TableCell>{room.room_type}</TableCell>
                      <TableCell>{room.department}</TableCell>
                      <TableCell>
                        <Badge variant={room.status === "occupied" ? "destructive" : room.status === "available" ? "secondary" : "outline"} 
                          className={room.status === "available" ? "bg-green-100 text-green-800" : ""}>
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{room.patient_name || "—"}</TableCell>
                      <TableCell>{room.doctor_name || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </ConsoleShell>
  );
}
