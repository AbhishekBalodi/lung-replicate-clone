import { useState, useEffect } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type RoomType = {
  id: number;
  name: string;
  price_per_day: number;
  totalRooms: number;
  available: number;
  occupied: number;
  maintenance: number;
};

type Room = {
  id: number;
  room_number: string;
  status: string;
  bed_count: number;
  room_type: string;
  price_per_day: number;
  patient_name: string | null;
  doctor_name: string | null;
};

export default function Rooms() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRooms: 0,
    occupied: 0,
    available: 0,
    maintenance: 0,
    occupancyRate: 0,
    roomTypes: [] as RoomType[]
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary
      const summaryRes = await api.apiGet('/api/dashboard/rooms/summary');
      const summaryData = await summaryRes.json();
      if (summaryRes.ok) {
        setSummary(summaryData);
      }

      // Fetch rooms list
      let url = '/api/dashboard/rooms/list?status=all';
      if (activeType !== 'all') url += `&type=${encodeURIComponent(activeType)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const roomsRes = await api.apiGet(url);
      const roomsData = await roomsRes.json();
      if (roomsRes.ok) {
        setRooms(roomsData.rooms || []);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
      toast.error('Failed to load rooms data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeType, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'occupied':
        return <Badge variant="destructive">Occupied</Badge>;
      case 'vacant':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="text-amber-600">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <ConsoleShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ConsoleShell>
    );
  }

  return (
    <ConsoleShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Rooms by Department</h1>
        <Button>Add New Room</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-medium text-muted-foreground">Total Rooms</h3>
          <p className="text-2xl font-bold mt-2">{summary.totalRooms}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium text-muted-foreground">Available</h3>
          <p className="text-2xl font-bold mt-2 text-green-600">{summary.available}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium text-muted-foreground">Occupied</h3>
          <p className="text-2xl font-bold mt-2 text-red-500">{summary.occupied}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-medium text-muted-foreground">Occupancy Rate</h3>
          <p className="text-2xl font-bold mt-2">{summary.occupancyRate}%</p>
        </Card>
      </div>

      {/* Room type cards */}
      {summary.roomTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {summary.roomTypes.slice(0, 3).map(rt => (
            <Card key={rt.id} className="p-4">
              <h3 className="font-medium">{rt.name}</h3>
              <p className="text-2xl font-bold mt-2">{rt.totalRooms}</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-600">Available: {rt.available}</span>
                <span className="text-red-500">Occupied: {rt.occupied}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveType("all")}
          className={`px-3 py-1.5 rounded-md text-sm ${
            activeType === "all" ? "bg-black text-white" : "bg-muted"
          }`}
        >
          All
        </button>
        {summary.roomTypes.map(rt => (
          <button
            key={rt.id}
            onClick={() => setActiveType(rt.name)}
            className={`px-3 py-1.5 rounded-md text-sm ${
              activeType === rt.name ? "bg-black text-white" : "bg-muted"
            }`}
          >
            {rt.name}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Input 
          placeholder="Search rooms..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Table */}
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Room Number</th>
              <th>Room Type</th>
              <th>Status</th>
              <th>Patient</th>
              <th>Doctor</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No rooms found
                </td>
              </tr>
            ) : (
              rooms.map(room => (
                <tr key={room.id} className="border-b">
                  <td className="p-3">{room.room_number}</td>
                  <td className="text-center">{room.room_type || 'General'}</td>
                  <td className="text-center">{getStatusBadge(room.status)}</td>
                  <td className="text-center">{room.patient_name || '—'}</td>
                  <td className="text-center">{room.doctor_name || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </ConsoleShell>
  );
}