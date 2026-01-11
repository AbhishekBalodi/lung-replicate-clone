import { useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ambulance, Phone, Clock, Plus, Search } from 'lucide-react';

// Mock data for ambulance calls
const mockCalls = [
  { id: 'AC001', date: '2023-04-22', time: '08:30 AM', patient: 'John Doe', phone: '+1 (555) 123-4567', location: '123 Main St, Anytown', reason: 'Chest Pain', status: 'Completed', ambulanceId: 'AMB-001', driver: 'Michael Johnson' },
  { id: 'AC002', date: '2023-04-22', time: '09:45 AM', patient: 'Jane Smith', phone: '+1 (555) 987-6543', location: '456 Oak Ave, Somewhere', reason: 'Traffic Accident', status: 'In Progress', ambulanceId: 'AMB-002', driver: 'Robert Davis' },
  { id: 'AC003', date: '2023-04-22', time: '11:15 AM', patient: 'Emily Johnson', phone: '+1 (555) 456-7890', location: '789 Pine Rd, Elsewhere', reason: 'Difficulty Breathing', status: 'Pending', ambulanceId: 'AMB-003', driver: 'Sarah Wilson' },
  { id: 'AC004', date: '2023-04-21', time: '02:30 PM', patient: 'David Brown', phone: '+1 (555) 234-5678', location: '321 Elm St, Nowhere', reason: 'Fall Injury', status: 'Completed', ambulanceId: 'AMB-001', driver: 'Michael Johnson' },
  { id: 'AC005', date: '2023-04-21', time: '05:00 PM', patient: 'Lisa Garcia', phone: '+1 (555) 876-5432', location: '654 Maple Dr, Anytown', reason: 'Stroke Symptoms', status: 'Completed', ambulanceId: 'AMB-005', driver: 'Thomas Anderson' },
  { id: 'AC006', date: '2023-04-21', time: '07:45 PM', patient: 'Robert Martinez', phone: '+1 (555) 345-6789', location: '987 Cedar Ln, Somewhere', reason: 'Severe Allergic Reaction', status: 'Completed', ambulanceId: 'AMB-002', driver: 'Sarah Wilson' },
  { id: 'AC007', date: '2023-04-20', time: '10:15 AM', patient: 'Maria Rodriguez', phone: '+1 (555) 567-8901', location: '159 Birch St, Elsewhere', reason: 'Pregnancy Complications', status: 'Completed', ambulanceId: 'AMB-004', driver: 'Robert Davis' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Completed':
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
    case 'In Progress':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
    case 'Pending':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AmbulanceCallList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [activeTab, setActiveTab] = useState('all');

  const filteredCalls = mockCalls.filter(call => {
    const matchesSearch = call.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          call.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          call.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'all' || call.status.toLowerCase().replace(' ', '-') === activeTab.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalCalls = mockCalls.length;
  const activeCalls = mockCalls.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;
  const pendingCalls = mockCalls.filter(c => c.status === 'Pending').length;
  const inProgressCalls = mockCalls.filter(c => c.status === 'In Progress').length;

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ambulance Call List</h1>
            <p className="text-muted-foreground mt-1">Manage and track all ambulance calls and dispatches</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
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
                <p className="text-3xl font-bold text-foreground mt-1">{totalCalls * 18}</p>
                <p className="text-sm text-emerald-600 mt-1">+5.2% from last month</p>
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
                <p className="text-3xl font-bold text-foreground mt-1">{activeCalls}</p>
                <p className="text-sm text-muted-foreground mt-1">{pendingCalls} pending, {inProgressCalls} in progress</p>
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
                <p className="text-3xl font-bold text-foreground mt-1">8.5 min</p>
                <p className="text-sm text-emerald-600 mt-1">-1.2 min from last month</p>
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
                <SelectItem value="in-progress">In Progress</SelectItem>
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
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
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
                {filteredCalls.map((call) => (
                  <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{call.id}</TableCell>
                    <TableCell>
                      <div>{call.date}</div>
                      <div className="text-sm text-muted-foreground">{call.time}</div>
                    </TableCell>
                    <TableCell>
                      <div>{call.patient}</div>
                      <div className="text-sm text-muted-foreground">{call.phone}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{call.location}</TableCell>
                    <TableCell>{call.reason}</TableCell>
                    <TableCell>{getStatusBadge(call.status)}</TableCell>
                    <TableCell>
                      <div>{call.ambulanceId}</div>
                      <div className="text-sm text-muted-foreground">{call.driver}</div>
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
