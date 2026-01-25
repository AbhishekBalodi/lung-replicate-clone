import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

/* ---------------- TYPES ---------------- */

type Ambulance = {
  id: number;
  vehicle_number: string;
  model?: string;
  driver_name?: string;
  driver_contact?: string;
  status: 'available' | 'on-trip' | 'maintenance' | 'offline';
  current_location?: string;
  notes?: string;
};

/* ---------------- STATUS BADGE ---------------- */

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'available':
      return <Badge className="bg-emerald-50 text-emerald-700">Available</Badge>;
    case 'on-trip':
      return <Badge className="bg-blue-50 text-blue-700">On Trip</Badge>;
    case 'maintenance':
      return <Badge className="bg-amber-50 text-amber-700">Maintenance</Badge>;
    case 'offline':
      return <Badge className="bg-gray-100 text-gray-700">Offline</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

/* ---------------- COMPONENT ---------------- */

export default function AmbulanceFleetList() {
  const navigate = useNavigate();

  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [form, setForm] = useState({
    vehicle_number: '',
    model: '',
    driver_name: '',
    driver_contact: '',
    status: 'available',
    current_location: '',
    notes: '',
  });

  /* ---------------- LOAD FROM DB ---------------- */

  const load = async () => {
    try {
      const res = await api.apiGet('/api/ambulances');
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');
      setAmbulances(js.items || []);
    } catch (err: any) {
      toast.error('Failed to load ambulances');
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------------- ADD ---------------- */

  const handleAdd = async () => {
    if (!form.vehicle_number.trim()) {
      toast.error('Vehicle number required');
      return;
    }

    try {
      const res = await api.apiPost('/api/ambulances', form);
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');

      toast.success('Ambulance added');
      setOpen(false);
      setForm({
        vehicle_number: '',
        model: '',
        driver_name: '',
        driver_contact: '',
        status: 'available',
        current_location: '',
        notes: '',
      });
      load(); // 🔥 reload from DB
    } catch (err: any) {
      toast.error('Failed to add ambulance');
    }
  };

  /* ---------------- FILTER ---------------- */

  const filteredAmbulances = ambulances.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      a.vehicle_number.toLowerCase().includes(q) ||
      a.model?.toLowerCase().includes(q) ||
      a.driver_name?.toLowerCase().includes(q);

    const matchesStatus = activeTab === 'all' || a.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  /* ---------------- UI ---------------- */

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Ambulance List</h1>
            <p className="text-muted-foreground">
              Manage and track all ambulances
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Ambulance
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="on-trip">On Trip</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAmbulances.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/ambulances/details/${a.id}`)
                  }
                >
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.vehicle_number}</TableCell>
                  <TableCell>{a.model}</TableCell>
                  <TableCell>{getStatusBadge(a.status)}</TableCell>
                  <TableCell>{a.driver_name}</TableCell>
                  <TableCell>{a.current_location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-xl space-y-4">
            <h2 className="text-xl font-semibold">Add Ambulance</h2>

            <Input placeholder="Vehicle Number *" value={form.vehicle_number}
              onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
            <Input placeholder="Model" value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <Input placeholder="Driver Name" value={form.driver_name}
              onChange={(e) => setForm({ ...form, driver_name: e.target.value })} />
            <Input placeholder="Driver Contact" value={form.driver_contact}
              onChange={(e) => setForm({ ...form, driver_contact: e.target.value })} />
            <Input placeholder="Current Location" value={form.current_location}
              onChange={(e) => setForm({ ...form, current_location: e.target.value })} />
            <Input placeholder="Notes" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on-trip">On Trip</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Save</Button>
            </div>
          </Card>
        </div>
      )}
    </ConsoleShell>
  );
}
