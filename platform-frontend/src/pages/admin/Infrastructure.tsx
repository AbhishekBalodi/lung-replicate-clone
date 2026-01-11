import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Bed, Car, Wrench, Wifi, Zap, Droplets, ThermometerSun } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";

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

  const fetchInfraData = useCallback(async () => {
    try {
      setLoading(true);
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

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure</h1>
          <p className="text-gray-600">Monitor hospital buildings, equipment and facilities</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_buildings}</p>
                <p className="text-sm text-gray-600">Buildings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-100">
                <Bed className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_beds}</p>
                <p className="text-sm text-gray-600">Total Beds</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Car className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ambulances}</p>
                <p className="text-sm text-gray-600">Ambulances</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{equipment.filter(e => e.status === "operational").length}</p>
                <p className="text-sm text-gray-600">Equipment Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="occupancy">
          <TabsList>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
          </TabsList>

          <TabsContent value="occupancy" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Room Occupancy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{stats.occupied_rooms} / {stats.total_rooms} Rooms</span>
                      <span>{roomOccupancy.toFixed(1)}%</span>
                    </div>
                    <Progress value={roomOccupancy} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Bed Occupancy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{stats.occupied_beds} / {stats.total_beds} Beds</span>
                      <span>{bedOccupancy.toFixed(1)}%</span>
                    </div>
                    <Progress value={bedOccupancy} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">ICU Occupancy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{stats.icu_occupied} / {stats.icu_beds} ICU Beds</span>
                      <span>{icuOccupancy.toFixed(1)}%</span>
                    </div>
                    <Progress value={icuOccupancy} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {equipment.map((eq) => (
                    <div key={eq.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{eq.name}</p>
                        <p className="text-sm text-gray-500">{eq.location}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-500">Next Service</p>
                          <p>{eq.next_service}</p>
                        </div>
                        <Badge className={getStatusColor(eq.status)}>
                          {eq.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilities" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Power Supply
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Main Grid</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Backup Generator</span>
                      <Badge className="bg-green-100 text-green-800">Standby</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">UPS Systems</span>
                      <Badge className="bg-green-100 text-green-800">100%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    Water Supply
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Municipal Supply</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Overhead Tanks</span>
                      <Badge className="bg-green-100 text-green-800">85%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">RO Plant</span>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Wifi className="h-4 w-4 text-purple-500" />
                    Network & IT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Internet (Primary)</span>
                      <Badge className="bg-green-100 text-green-800">100 Mbps</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Backup Line</span>
                      <Badge className="bg-green-100 text-green-800">50 Mbps</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">WiFi Coverage</span>
                      <Badge className="bg-green-100 text-green-800">95%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <ThermometerSun className="h-4 w-4 text-orange-500" />
                    HVAC System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Central AC</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">OT Climate Control</span>
                      <Badge className="bg-green-100 text-green-800">22°C</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Air Filtration</span>
                      <Badge className="bg-green-100 text-green-800">HEPA</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
