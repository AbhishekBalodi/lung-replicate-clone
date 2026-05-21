import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Ambulance, Truck, Wrench, Plus, Search } from 'lucide-react';

type FleetAmbulance = {
  id: number;
  vehicle_number: string;
  model: string | null;
  status: string;
  driver_name: string | null;
  driver_contact: string | null;
  current_location: string | null;
  notes: string | null;
  created_at?: string;
};

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Available</Badge>;
    case 'on_call':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">On Call</Badge>;
    case 'maintenance':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Maintenance</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AmbulanceFleetList() {
  const navigate = useNavigate();
  const [fleet, setFleet] = useState<FleetAmbulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/dashboard/ambulance/fleet');
        const data = await res.json();
        if (res.ok) setFleet(Array.isArray(data?.fleet) ? data.fleet : []);
      } catch (error) {
        toast.error('Failed to load ambulance fleet');
      } finally {
        setLoading(false);
      }
    };

    fetchFleet();
  }, []);

  const filteredAmbulances = useMemo(() => fleet.filter((amb) => {
    const haystack = `${amb.model || ''} ${amb.vehicle_number} ${amb.id} ${amb.driver_name || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'all' || amb.status.toLowerCase().replace('_', '-') === activeTab.toLowerCase();
    const matchesFilterStatus = statusFilter === 'all' || amb.status.toLowerCase().replace('_', '-') === statusFilter;
    return matchesSearch && matchesStatus;
  }).filter((amb) => matchesTypeFilter(amb, typeFilter) && (statusFilter === 'all' || amb.status.toLowerCase().replace('_', '-') === statusFilter)), [fleet, searchQuery, activeTab, statusFilter, typeFilter]);

  const totalAmbulances = fleet.length;
  const availableAmbulances = fleet.filter((a) => a.status.toLowerCase() === 'available').length;
  const onCallAmbulances = fleet.filter((a) => a.status.toLowerCase() === 'on_call').length;
  const maintenanceAmbulances = fleet.filter((a) => a.status.toLowerCase() === 'maintenance').length;

  function matchesTypeFilter(amb: FleetAmbulance, filter: string) {
    if (filter === 'all') return true;
    const text = `${amb.model || ''} ${amb.notes || ''}`.toLowerCase();
    if (filter === 'basic') return text.includes('basic');
    if (filter === 'advanced') return text.includes('advanced');
    if (filter === 'transport') return text.includes('transport');
    return true;
  }

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ambulance List</h1>
            <p className="text-muted-foreground mt-1">Manage and track all ambulances in the fleet</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2" disabled>
            <Plus className="h-4 w-4" />
            Add New Ambulance
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ambulances</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalAmbulances}</p>
                <p className="text-sm text-emerald-600 mt-1">+1 from last month</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Ambulance className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Ambulances</p>
                <p className="text-3xl font-bold text-foreground mt-1">{availableAmbulances}</p>
                <p className="text-sm text-muted-foreground mt-1">{onCallAmbulances} on call, {maintenanceAmbulances} in maintenance</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Truck className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance Due</p>
                <p className="text-3xl font-bold text-foreground mt-1">{maintenanceAmbulances}</p>
                <p className="text-sm text-muted-foreground mt-1">Vehicles currently under maintenance</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Wrench className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Fleet Section */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Ambulance Fleet</h2>
            <p className="text-muted-foreground text-sm mt-1">View and manage all ambulances in your fleet</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ambulances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on-call">On Call</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="basic">Basic Life Support</SelectItem>
                <SelectItem value="advanced">Advanced Life Support</SelectItem>
                <SelectItem value="transport">Patient Transport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="on-call">On Call</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading fleet...</TableCell>
                  </TableRow>
                ) : filteredAmbulances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No ambulances found</TableCell>
                  </TableRow>
                ) : filteredAmbulances.map((ambulance) => (
                  <TableRow 
                    key={ambulance.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/ambulances/details/${ambulance.id}`)}
                  >
                    <TableCell className="font-medium">#{ambulance.id}</TableCell>
                    <TableCell>{ambulance.vehicle_number}</TableCell>
                    <TableCell>
                      <div>{ambulance.model || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{ambulance.driver_contact || '-'}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(ambulance.status)}</TableCell>
                    <TableCell>{ambulance.driver_name || '-'}</TableCell>
                    <TableCell>{ambulance.current_location || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </ConsoleShell>
  );
}
