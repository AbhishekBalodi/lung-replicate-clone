import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, RefreshCw, Download, Calendar, MoreHorizontal, ArrowUpRight, Droplet, Users, Activity } from 'lucide-react';

type IssuedRecord = {
  id: string;
  blood_type: string;
  units: number;
  issued_date: string;
  issued_to: string;
  patient_id: string;
  department: string;
  purpose: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  issued_by: string;
};

const mockIssuedRecords: IssuedRecord[] = [
  { id: 'BI-001', blood_type: 'A+', units: 2, issued_date: '2023-04-15', issued_to: 'John Doe', patient_id: 'P-1234', department: 'Surgery', purpose: 'Surgery', status: 'Completed', issued_by: 'Dr. Smith' },
  { id: 'BI-002', blood_type: 'O-', units: 3, issued_date: '2023-04-16', issued_to: 'Jane Smith', patient_id: 'P-1235', department: 'Emergency', purpose: 'Emergency Transfusion', status: 'Completed', issued_by: 'Dr. Johnson' },
  { id: 'BI-003', blood_type: 'B+', units: 1, issued_date: '2023-04-17', issued_to: 'Mike Brown', patient_id: 'P-1236', department: 'ICU', purpose: 'Critical Care', status: 'Pending', issued_by: 'Dr. Williams' },
  { id: 'BI-004', blood_type: 'AB+', units: 2, issued_date: '2023-04-18', issued_to: 'Sarah Davis', patient_id: 'P-1237', department: 'Oncology', purpose: 'Chemotherapy Support', status: 'Completed', issued_by: 'Dr. Garcia' },
  { id: 'BI-005', blood_type: 'A-', units: 1, issued_date: '2023-04-19', issued_to: 'Robert Wilson', patient_id: 'P-1238', department: 'Surgery', purpose: 'Post-Surgery', status: 'Cancelled', issued_by: 'Dr. Martinez' },
  { id: 'BI-006', blood_type: 'O+', units: 4, issued_date: '2023-04-20', issued_to: 'Emily Chen', patient_id: 'P-1239', department: 'Emergency', purpose: 'Accident Victim', status: 'Completed', issued_by: 'Dr. Lee' },
];

export default function BloodIssued() {
  const [records, setRecords] = useState<IssuedRecord[]>(mockIssuedRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const totalIssued = records.reduce((sum, r) => sum + r.units, 0);
  const completedCount = records.filter(r => r.status === 'Completed').length;
  const pendingCount = records.filter(r => r.status === 'Pending').length;
  const emergencyCount = records.filter(r => r.department === 'Emergency').length;

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.issued_to.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.patient_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = bloodTypeFilter === 'all' || record.blood_type === bloodTypeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'completed' && record.status === 'Completed') ||
                       (activeTab === 'pending' && record.status === 'Pending') ||
                       (activeTab === 'cancelled' && record.status === 'Cancelled');
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Completed</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBloodTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-emerald-100 text-emerald-700',
      'A-': 'bg-amber-100 text-amber-700',
      'B+': 'bg-blue-100 text-blue-700',
      'B-': 'bg-red-100 text-red-700',
      'AB+': 'bg-purple-100 text-purple-700',
      'AB-': 'bg-orange-100 text-orange-700',
      'O+': 'bg-teal-100 text-teal-700',
      'O-': 'bg-slate-100 text-slate-700',
    };
    return <Badge className={colors[type] || 'bg-slate-100'}>{type}</Badge>;
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blood Issued</h1>
            <p className="text-sm text-slate-500">Track and manage blood issuance records</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Droplet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">How Blood Bank Works</p>
              <p className="text-[11px] text-slate-500">Manage blood inventory, donors, collections, and issuance</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm">
          {['Blood Stock', 'Blood Donor', 'Blood Issued', 'Add Blood Unit', 'Issue Blood'].map((item, index) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${index === 2 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Units Issued</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{totalIssued}</p>
                  <p className="mt-1 text-xs text-slate-500">This month</p>
                </div>
                <Droplet className="h-5 w-5 text-rose-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Completed Issues</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{completedCount}</p>
                  <p className="mt-1 text-xs text-emerald-600">Successfully transfused</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Pending Issues</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{pendingCount}</p>
                  <p className="mt-1 text-xs text-amber-600">Awaiting transfusion</p>
                </div>
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Emergency Issues</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{emergencyCount}</p>
                  <p className="mt-1 text-xs text-rose-600">Emergency department</p>
                </div>
                <Users className="h-5 w-5 text-rose-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 h-9"
              />
            </div>
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-9">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" className="h-9">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs and Table */}
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 pt-4">
              <TabsList className="h-10 rounded-full bg-slate-100 p-1 m-0">
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={activeTab} className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue ID</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-primary">{record.id}</TableCell>
                      <TableCell>{getBloodTypeBadge(record.blood_type)}</TableCell>
                      <TableCell>{record.units}</TableCell>
                      <TableCell>{record.issued_date}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.issued_to}</p>
                          <p className="text-xs text-muted-foreground">{record.patient_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{record.purpose}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.issued_by}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 flex items-center justify-between border-t border-slate-200">
                <p className="text-sm text-slate-500">Showing 1-{filteredRecords.length} of {records.length} records</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full border-slate-200" disabled>Previous</Button>
                  <Button variant="outline" size="sm" className="rounded-full border-slate-200">Next</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </ConsoleShell>
  );
}
