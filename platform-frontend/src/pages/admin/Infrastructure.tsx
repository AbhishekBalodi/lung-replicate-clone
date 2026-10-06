import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Bed, Car, Wrench, Wifi, Zap, Droplets, ThermometerSun } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface InfraStats {
  total_buildings: number;
  total_floors: number;
  total_rooms: number;
  occupied_rooms: number;
  total_beds: number;
  occupied_beds: number;
  icu_beds: number;
  icu_occupied: number;
  parking_spaces: number;
  ambulances: number;
}

interface Equipment {
  id: number;
  name: string;
  category: string;
  status: "operational" | "maintenance" | "out_of_order";
  last_service: string;
  next_service: string;
  location: string;
}

export default function Infrastructure() {
  const [stats, setStats] = useState<InfraStats>({
    total_buildings: 2,
    total_floors: 8,
    total_rooms: 150,
    occupied_rooms: 98,
    total_beds: 200,
    occupied_beds: 156,
    icu_beds: 20,
    icu_occupied: 15,
    parking_spaces: 100,
    ambulances: 5
  });
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [newFacility, setNewFacility] = useState({ name: "", category: "general", location: "", capacity: "" });
  const [newEquipment, setNewEquipment] = useState({ name: "", category: "general", model: "", location: "" });

  const fetchInfraData = useCallback(async () => {
    try {
      setLoading(true);
      const infraRes = await apiGet("/api/dashboard/hospital/infrastructure");
      if (infraRes.ok) {
        const infra = await infraRes.json();
        if (infra?.roomStats) {
          setStats(prev => ({
            ...prev,
            total_rooms: Number(infra.roomStats.total_rooms || prev.total_rooms),
            occupied_rooms: Number(infra.roomStats.occupied_rooms || prev.occupied_rooms),
            total_beds: Number(infra.roomStats.total_beds || prev.total_beds),
          }));
        }
        if (Array.isArray(infra?.equipment) && infra.equipment.length) {
          setEquipment(infra.equipment.map((e: any) => ({
            id: e.id,
            name: e.name,
            category: e.category || "General",
            status: e.status === "retired" ? "out_of_order" : (e.status || "operational"),
            last_service: e.purchase_date || "-",
            next_service: e.warranty_until || "-",
            location: e.location || "-",
          })));
        }
      }

      // Fetch rooms to calculate occupancy
      const roomsRes = await apiGet("/api/rooms");
      if (roomsRes.ok) {
        const rooms = await roomsRes.json();
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter((r: { status: string }) => r.status === "occupied").length;
        const totalBeds = rooms.reduce((sum: number, r: { total_beds?: number }) => sum + (r.total_beds || 1), 0);
        const occupiedBeds = rooms.reduce((sum: number, r: { occupied_beds?: number }) => sum + (r.occupied_beds || 0), 0);
        
        setStats(prev => ({
          ...prev,
          total_rooms: totalRooms,
          occupied_rooms: occupiedRooms,
          total_beds: totalBeds || prev.total_beds,
          occupied_beds: occupiedBeds || prev.occupied_beds
        }));
      }

      // Fetch ambulances
      const ambRes = await apiGet("/api/ambulances");
      if (ambRes.ok) {
        const ambulances = await ambRes.json();
        setStats(prev => ({ ...prev, ambulances: ambulances.length }));
      }

      // Mock equipment data
      setEquipment([
        { id: 1, name: "MRI Scanner", category: "Imaging", status: "operational", last_service: "2025-12-01", next_service: "2026-03-01", location: "Building A, Floor 2" },
        { id: 2, name: "CT Scanner", category: "Imaging", status: "operational", last_service: "2025-11-15", next_service: "2026-02-15", location: "Building A, Floor 2" },
        { id: 3, name: "X-Ray Machine", category: "Imaging", status: "maintenance", last_service: "2025-12-20", next_service: "2026-01-20", location: "Building A, Floor 1" },
        { id: 4, name: "Ventilator Unit 1", category: "ICU", status: "operational", last_service: "2025-12-10", next_service: "2026-01-10", location: "ICU" },
        { id: 5, name: "Dialysis Machine", category: "Nephrology", status: "operational", last_service: "2025-11-25", next_service: "2026-02-25", location: "Building B, Floor 3" },
        { id: 6, name: "ECG Machine", category: "Cardiology", status: "operational", last_service: "2025-12-05", next_service: "2026-03-05", location: "OPD" },
      ]);
    } catch (error) {
      console.error("Error fetching infrastructure data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addFacility = async () => {
    if (!newFacility.name.trim()) {
      toast.error("Facility name is required");
      return;
    }
    const res = await apiPost("/api/dashboard/hospital/facilities", {
      name: newFacility.name.trim(),
      category: newFacility.category,
      location: newFacility.location || null,
      capacity: newFacility.capacity ? Number(newFacility.capacity) : null,
    });
    if (!res.ok) {
      toast.error("Failed to add facility");
      return;
    }
    toast.success("Facility added");
    setFacilityOpen(false);
    setNewFacility({ name: "", category: "general", location: "", capacity: "" });
    fetchInfraData();
  };

  const addEquipment = async () => {
    if (!newEquipment.name.trim()) {
      toast.error("Equipment name is required");
      return;
    }
    const res = await apiPost("/api/dashboard/hospital/equipment", {
      name: newEquipment.name.trim(),
      category: newEquipment.category,
      model: newEquipment.model || null,
      location: newEquipment.location || null,
    });
    if (!res.ok) {
      toast.error("Failed to add equipment");
      return;
    }
    toast.success("Equipment added");
    setEquipmentOpen(false);
    setNewEquipment({ name: "", category: "general", model: "", location: "" });
    fetchInfraData();
  };

  useEffect(() => {
    fetchInfraData();
  }, [fetchInfraData]);

  const roomOccupancy = stats.total_rooms > 0 ? (stats.occupied_rooms / stats.total_rooms) * 100 : 0;
  const bedOccupancy = stats.total_beds > 0 ? (stats.occupied_beds / stats.total_beds) * 100 : 0;
  const icuOccupancy = stats.icu_beds > 0 ? (stats.icu_occupied / stats.icu_beds) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-100 text-green-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "out_of_order": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const trendData = [62, 68, 71, 74, 72, 69];
  const floorData = [
    { name: "Floor 1", pct: 86, color: "bg-amber-500" },
    { name: "Floor 2", pct: 82, color: "bg-amber-500" },
    { name: "Floor 3", pct: 74, color: "bg-amber-500" },
    { name: "Floor 4", pct: 93, color: "bg-rose-500" },
    { name: "Floor 5", pct: 63, color: "bg-emerald-500" },
    { name: "Emergency", pct: 82, color: "bg-amber-500" },
  ];

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <Tabs defaultValue="occupancy">
              <TabsList className="rounded-full bg-slate-100 p-1">
                <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="utilities">Utilities</TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-500">Room Occupancy</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${roomOccupancy}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{stats.occupied_rooms} / {stats.total_rooms} Rooms</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Bed Occupancy</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-amber-500" style={{ width: `${bedOccupancy}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{stats.occupied_beds} / {stats.total_beds} Beds</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">ICU Occupancy</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-orange-500" style={{ width: `${icuOccupancy}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{stats.icu_occupied} / {stats.icu_beds} ICU</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="mb-3 text-xs font-semibold text-slate-700">Weekly Occupancy Trend (%)</p>
                <div className="flex h-44 items-end gap-4">
                  {trendData.map((value, index) => (
                    <div key={index} className="flex-1">
                      <div className="relative h-44 w-full overflow-hidden rounded bg-slate-50">
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-400/60 to-sky-300/60"
                          style={{ height: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold text-slate-700">Floor-wise Occupancy</p>
                <div className="space-y-2">
                  {floorData.map((floor) => (
                    <div key={floor.name} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-slate-500">{floor.name}</span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${floor.color}`} style={{ width: `${floor.pct}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs text-slate-500">{floor.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
