import { useEffect, useMemo, useState } from 'react';
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
import { Ambulance, Phone, Clock, Plus, Search } from 'lucide-react';

type AmbulanceCall = {
  id: number;
  patient_name: string;
  phone: string | null;
  pickup_location: string | null;
  reason: string | null;
  status: string;
  created_at: string;
  vehicle_number?: string | null;
  driver_name?: string | null;
};

type AmbulanceSummary = {
  totalCalls: number;
  activeCalls: number;
  completedToday: number;
  avgResponseTime: string;
};

const titleCaseStatus = (status: string) =>
  status
    .replace(/_/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const getStatusBadge = (status: string) => {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'completed':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
    case 'dispatched':
    case 'en_route':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{titleCaseStatus(normalized)}</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    default:
      return <Badge variant="outline">{titleCaseStatus(status)}</Badge>;
  }
};

export default function AmbulanceCallList() {
  const [calls, setCalls] = useState<AmbulanceCall[]>([]);
  const [summary, setSummary] = useState<AmbulanceSummary>({
    totalCalls: 0,
    activeCalls: 0,
    completedToday: 0,
    avgResponseTime: 'N/A',
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, callsRes] = await Promise.all([
          apiFetch('/api/dashboard/ambulance/summary'),
          apiFetch(`/api/dashboard/ambulance/calls?status=${statusFilter}&date=${dateFilter}`),
        ]);

        const summaryData = await summaryRes.json();
        const callsData = await callsRes.json();

        if (summaryRes.ok) setSummary(summaryData);
        if (callsRes.ok) setCalls(Array.isArray(callsData?.calls) ? callsData.calls : []);
      } catch (error) {
        toast.error('Failed to load ambulance call data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter, dateFilter]);

  const filteredCalls = useMemo(() => calls.filter((call) => {
    const haystack = `${call.patient_name} ${call.id} ${call.pickup_location || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'all' || call.status.toLowerCase().replace('_', '-') === activeTab.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [calls, searchQuery, activeTab]);

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ambulance Call List</h1>
            <p className="text-muted-foreground mt-1">Manage and track all ambulance calls and dispatches</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2" disabled>
            <Plus className="h-4 w-4" />
            New Ambulance Call
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                <p className="text-3xl font-bold text-foreground mt-1">{summary.totalCalls}</p>
                <p className="text-sm text-muted-foreground mt-1">Completed today: {summary.completedToday}</p>
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
                <p className="text-sm text-muted-foreground mt-1">Pending, dispatched, and en-route calls</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Phone className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Response Time</p>
                <p className="text-3xl font-bold text-foreground mt-1">{summary.avgResponseTime}</p>
                <p className="text-sm text-muted-foreground mt-1">Based on dispatched calls</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Calls Section */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Ambulance Calls</h2>
            <p className="text-muted-foreground text-sm mt-1">View and manage all ambulance calls and dispatches</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calls..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="en_route">En Route</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Today" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
              <TabsTrigger value="en-route">En Route</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Call ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ambulance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading calls...</TableCell>
                  </TableRow>
                ) : filteredCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">No calls found</TableCell>
                  </TableRow>
                ) : filteredCalls.map((call) => (
                  <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">#{call.id}</TableCell>
                    <TableCell>
                      <div>{new Date(call.created_at).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">{new Date(call.created_at).toLocaleTimeString()}</div>
                    </TableCell>
                    <TableCell>
                      <div>{call.patient_name}</div>
                      <div className="text-sm text-muted-foreground">{call.phone || '-'}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{call.pickup_location || '-'}</TableCell>
                    <TableCell>{call.reason || '-'}</TableCell>
                    <TableCell>{getStatusBadge(call.status)}</TableCell>
                    <TableCell>
                      <div>{call.vehicle_number || 'Unassigned'}</div>
                      <div className="text-sm text-muted-foreground">{call.driver_name || '-'}</div>
                    </TableCell>
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
