import { useState, useEffect, useCallback } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Ambulance, Phone, Clock, Plus, Search, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/lib/api';

interface AmbulanceCall {
  id: number;
  patient_name: string;
  phone: string;
  pickup_location: string;
  drop_location: string;
  reason: string;
  priority: string;
  status: string;
  ambulance_id: number | null;
  vehicle_number: string | null;
  driver_name: string | null;
  created_at: string;
}

interface Summary {
  totalCalls: number;
  activeCalls: number;
  completedToday: number;
  avgResponseTime: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
    case 'dispatched':
    case 'en_route':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'critical':
      return <Badge className="bg-red-600">Critical</Badge>;
    case 'urgent':
      return <Badge className="bg-orange-500">Urgent</Badge>;
    default:
      return <Badge variant="secondary">Normal</Badge>;
  }
};

export default function AmbulanceCallList() {
  const [calls, setCalls] = useState<AmbulanceCall[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalCalls: 0, activeCalls: 0, completedToday: 0, avgResponseTime: 'N/A' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '', phone: '', pickup_location: '', drop_location: '', reason: '', priority: 'normal', notes: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, callsRes] = await Promise.all([
        apiGet('/api/dashboard/ambulance/summary'),
        apiGet(`/api/dashboard/ambulance/calls?status=${statusFilter}&date=${dateFilter}`)
      ]);
      
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
      
      if (callsRes.ok) {
        const data = await callsRes.json();
        setCalls(data.calls || []);
      }
    } catch (err) {
      console.error('Error fetching ambulance data:', err);
      toast.error('Failed to load ambulance data');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!formData.patient_name.trim() || !formData.phone.trim()) {
      toast.error('Patient name and phone are required');
      return;
    }
    
    try {
      const res = await apiPost('/api/dashboard/ambulance/calls', formData);
      if (res.ok) {
        toast.success('Ambulance call added successfully');
        setIsDialogOpen(false);
        setFormData({ patient_name: '', phone: '', pickup_location: '', drop_location: '', reason: '', priority: 'normal', notes: '' });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add call');
      }
    } catch (err) {
      toast.error('Failed to add ambulance call');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Patient', 'Phone', 'Pickup', 'Drop', 'Reason', 'Priority', 'Status', 'Date'].join(','),
      ...calls.map(c => [
        c.id, c.patient_name, c.phone, c.pickup_location, c.drop_location, c.reason, c.priority, c.status, c.created_at
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ambulance_calls.csv';
    a.click();
    toast.success('Export completed');
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          call.pickup_location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && call.status === 'pending') ||
      (activeTab === 'in-progress' && ['dispatched', 'en_route'].includes(call.status)) ||
      (activeTab === 'completed' && call.status === 'completed');
    return matchesSearch && matchesTab;
  });

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ambulance Call List</h1>
            <p className="text-muted-foreground mt-1">Manage and track all ambulance calls and dispatches</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />New Call</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>New Ambulance Call</DialogTitle>
                  <DialogDescription>Enter details for the ambulance dispatch</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Patient Name *</Label><Input value={formData.patient_name} onChange={e => setFormData({...formData, patient_name: e.target.value})} /></div>
                    <div><Label>Phone *</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                  </div>
                  <div><Label>Pickup Location</Label><Input value={formData.pickup_location} onChange={e => setFormData({...formData, pickup_location: e.target.value})} /></div>
                  <div><Label>Drop Location</Label><Input value={formData.drop_location} onChange={e => setFormData({...formData, drop_location: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Reason</Label><Input value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} /></div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
                  <Button onClick={handleSubmit}>Create Call</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                <p className="text-3xl font-bold text-foreground mt-1">{summary.totalCalls}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Ambulance className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Calls</p>
                <p className="text-3xl font-bold text-foreground mt-1">{summary.activeCalls}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Phone className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-3xl font-bold text-foreground mt-1">{summary.completedToday}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Ambulance className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold text-foreground mt-1">{summary.avgResponseTime}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Calls Table */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Ambulance Calls</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search calls..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Date" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ambulance</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filteredCalls.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">No calls found</TableCell></TableRow>
                ) : (
                  filteredCalls.map(call => (
                    <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">AC-{String(call.id).padStart(3, '0')}</TableCell>
                      <TableCell>
                        <div>{call.patient_name}</div>
                        <div className="text-sm text-muted-foreground">{call.phone}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{call.pickup_location}</TableCell>
                      <TableCell>{call.reason}</TableCell>
                      <TableCell>{getPriorityBadge(call.priority)}</TableCell>
                      <TableCell>{getStatusBadge(call.status)}</TableCell>
                      <TableCell>
                        {call.vehicle_number ? (
                          <div>
                            <div>{call.vehicle_number}</div>
                            <div className="text-sm text-muted-foreground">{call.driver_name}</div>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{new Date(call.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </ConsoleShell>
  );
}
