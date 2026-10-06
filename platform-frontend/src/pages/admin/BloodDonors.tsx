import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, RefreshCw, Download, Plus, Users, Calendar, Phone, Mail, Droplet } from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type Donor = {
  id: string;
  name: string;
  blood_type: string;
  phone: string;
  email: string;
  last_donation: string;
  status: 'Eligible' | 'Ineligible' | 'New';
  total_donations: number;
  next_eligible: string;
  tier?: 'Silver Donor' | 'Gold Donor' | 'Platinum Donor';
  avatar?: string;
};

const donorsSeed: Donor[] = [
  { id: 'D-1001', name: 'John Smith', blood_type: 'O+', phone: '+1 (555) 123-4567', email: 'john.smith@example.com', last_donation: '3/15/2023', status: 'Eligible', total_donations: 8, next_eligible: '7/15/2023', tier: 'Silver Donor' },
  { id: 'D-1002', name: 'Sarah Johnson', blood_type: 'A-', phone: '+1 (555) 987-6543', email: 'sarah.j@example.com', last_donation: '5/22/2023', status: 'Ineligible', total_donations: 3, next_eligible: '9/22/2023' },
  { id: 'D-1003', name: 'Michael Chen', blood_type: 'B+', phone: '+1 (555) 456-7890', email: 'mchen@example.com', last_donation: '1/10/2023', status: 'Eligible', total_donations: 12, next_eligible: '5/10/2023', tier: 'Gold Donor' },
  { id: 'D-1004', name: 'Emily Davis', blood_type: 'AB+', phone: '+1 (555) 321-0987', email: 'emily.d@example.com', last_donation: '4/05/2023', status: 'New', total_donations: 1, next_eligible: '8/05/2023' },
  { id: 'D-1005', name: 'David Wilson', blood_type: 'O-', phone: '+1 (555) 876-5432', email: 'dwilson@example.com', last_donation: '4/5/2023', status: 'Eligible', total_donations: 25, next_eligible: '8/5/2023', tier: 'Platinum Donor' },
  { id: 'D-1006', name: 'Jennifer Lee', blood_type: 'A+', phone: '+1 (555) 234-5678', email: 'jlee@example.com', last_donation: '2/20/2023', status: 'Eligible', total_donations: 6, next_eligible: '6/20/2023', tier: 'Silver Donor' },
];

const bloodTypeData = [
  { type: 'O+', percentage: 38, count: 94, color: '#ef4444' },
  { type: 'A+', percentage: 18, count: 45, color: '#3b82f6' },
  { type: 'B+', percentage: 12, count: 30, color: '#22c55e' },
  { type: 'AB+', percentage: 6, count: 15, color: '#a855f7' },
  { type: 'O-', percentage: 9, count: 22, color: '#f97316' },
  { type: 'A-', percentage: 7, count: 17, color: '#0ea5e9' },
  { type: 'B-', percentage: 6, count: 15, color: '#22c55e' },
  { type: 'AB-', percentage: 4, count: 10, color: '#8b5cf6' },
];

const donorStatusData = [
  { name: 'Eligible', value: 183, color: '#22c55e' },
  { name: 'Ineligible', value: 52, color: '#ef4444' },
  { name: 'New', value: 12, color: '#6366f1' },
];

const donationFrequencyData = [
  { frequency: 'First Time', count: 98 },
  { frequency: '2-4 Times', count: 107 },
  { frequency: '5-9 Times', count: 24 },
  { frequency: '10-24 Times', count: 12 },
  { frequency: '25+ Times', count: 6 },
];

export default function BloodDonors() {
  const [donors] = useState<Donor[]>(donorsSeed);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const totalDonors = 247;
  const donationsThisMonth = 38;
  const eligibleDonors = 183;
  const frequentDonors = 42;

  useEffect(() => {
    document.title = 'Blood Donors';
  }, []);

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) || donor.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = bloodTypeFilter === 'all' || donor.blood_type === bloodTypeFilter;
    const matchesStatus = statusFilter === 'all' || donor.status === statusFilter;
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'eligible' && donor.status === 'Eligible') ||
      (activeTab === 'ineligible' && donor.status === 'Ineligible') ||
      (activeTab === 'new' && donor.status === 'New');

    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Eligible':
        return <Badge className="bg-green-500 hover:bg-green-600">Eligible</Badge>;
      case 'Ineligible':
        return <Badge className="bg-red-500 hover:bg-red-600">Ineligible</Badge>;
      case 'New':
        return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTierBadge = (tier?: string) => {
    if (!tier) return null;
    switch (tier) {
      case 'Silver Donor':
        return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">Silver Donor</Badge>;
      case 'Gold Donor':
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">Gold Donor</Badge>;
      case 'Platinum Donor':
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">Platinum Donor</Badge>;
      default:
        return null;
    }
  };

  const getBloodTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-blue-100 text-blue-700',
      'A-': 'bg-blue-50 text-blue-600',
      'B+': 'bg-green-100 text-green-700',
      'B-': 'bg-green-50 text-green-600',
      'AB+': 'bg-purple-100 text-purple-700',
      'AB-': 'bg-purple-50 text-purple-600',
      'O+': 'bg-red-100 text-red-700',
      'O-': 'bg-red-50 text-red-600',
    };
    return <Badge className={colors[type] || 'bg-slate-100'}>{type}</Badge>;
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Droplet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">How Blood Bank Works</p>
                <p className="text-sm text-slate-500">Manage blood inventory, donors, and issuance from one place.</p>
              </div>
            </div>
            <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm hover:opacity-95">
              <Plus className="h-4 w-4 mr-2" />
              Register New Donor
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blood Donors</h1>
            <p className="text-sm text-slate-500">Manage and track blood donors in your blood bank</p>
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

        <div className="flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm">
          {['Blood Stock', 'Blood Donor', 'Blood Issued', 'Add Blood Unit', 'Issue Blood'].map((item, index) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${index === 1 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Donors</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{totalDonors}</p>
                  <p className="mt-1 text-xs text-emerald-600">+12 from last month</p>
                </div>
                <Users className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Donations This Month</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{donationsThisMonth}</p>
                  <p className="mt-1 text-xs text-emerald-600">+5 compared to last month</p>
                </div>
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Eligible Donors</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{eligibleDonors}</p>
                  <p className="mt-1 text-xs text-slate-500">Ready for donation</p>
                </div>
                <Badge className="bg-emerald-500 text-xs text-white hover:bg-emerald-500">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Frequent Donors</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{frequentDonors}</p>
                  <p className="mt-1 text-xs text-slate-500">5+ donations</p>
                </div>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs">VIP</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-700">Blood Type Coverage</CardTitle>
              <p className="text-sm text-slate-500">Distribution of registered donors by blood type</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={bloodTypeData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="type" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="percentage" stroke="#6366f1" fill="#6366f1" fillOpacity={0.16} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-700">Donor Status</CardTitle>
              <p className="text-sm text-slate-500">Eligibility breakdown of all donors</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={donorStatusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={4}>
                      {donorStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                {donorStatusData.map((entry) => (
                  <span key={entry.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-700">Donation Frequency</CardTitle>
              <p className="text-sm text-slate-500">Number of donors by donation frequency</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={donationFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="frequency" tick={{ fill: '#64748B', fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {bloodTypeData.map((bt) => (
            <Card key={bt.type} className="border-slate-200 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="text-[11px] font-semibold text-slate-500">{bt.type}</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{bt.count}</div>
                <div className="text-[11px] text-slate-400">{bt.percentage}%</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Blood Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                {bloodTypeData.map((bt) => (
                  <SelectItem key={bt.type} value={bt.type}>{bt.type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Eligible">Eligible</SelectItem>
                <SelectItem value="Ineligible">Ineligible</SelectItem>
                <SelectItem value="New">New</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="m-4 rounded-full bg-slate-100 p-1">
              <TabsTrigger value="all">All Donors</TabsTrigger>
              <TabsTrigger value="eligible">Eligible</TabsTrigger>
              <TabsTrigger value="ineligible">Ineligible</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Donation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Donations</TableHead>
                    <TableHead>Next Eligible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={donor.avatar} />
                            <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                              {donor.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{donor.name}</p>
                            <p className="text-xs text-muted-foreground">{donor.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getBloodTypeBadge(donor.blood_type)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {donor.phone}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {donor.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{donor.last_donation}</TableCell>
                      <TableCell>{getStatusBadge(donor.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{donor.total_donations}</span>
                          {getTierBadge(donor.tier)}
                        </div>
                      </TableCell>
                      <TableCell>{donor.next_eligible}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 flex items-center justify-between border-t">
                <p className="text-sm text-muted-foreground">Showing 1 to {filteredDonors.length} of {totalDonors} donors</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </ConsoleShell>
  );
}