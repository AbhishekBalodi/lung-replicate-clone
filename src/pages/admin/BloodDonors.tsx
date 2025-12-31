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
import { toast } from 'sonner';
import { Search, RefreshCw, Download, Plus, Users, Calendar, Phone, Mail } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

const mockDonors: Donor[] = [
  { id: 'D-1001', name: 'John Smith', blood_type: 'O+', phone: '+1 (555) 123-4567', email: 'john.smith@example.com', last_donation: '3/15/2023', status: 'Eligible', total_donations: 8, next_eligible: '7/15/2023', tier: 'Silver Donor' },
  { id: 'D-1002', name: 'Sarah Johnson', blood_type: 'A-', phone: '+1 (555) 987-6543', email: 'sarah.j@example.com', last_donation: '5/22/2023', status: 'Ineligible', total_donations: 3, next_eligible: '9/22/2023' },
  { id: 'D-1003', name: 'Michael Chen', blood_type: 'B+', phone: '+1 (555) 456-7890', email: 'mchen@example.com', last_donation: '1/10/2023', status: 'Eligible', total_donations: 12, next_eligible: '5/10/2023', tier: 'Gold Donor' },
  { id: 'D-1004', name: 'Emily Davis', blood_type: 'AB+', phone: '+1 (555) 321-0987', email: 'emily.d@example.com', last_donation: '4/05/2023', status: 'New', total_donations: 1, next_eligible: '8/05/2023' },
  { id: 'D-1005', name: 'David Wilson', blood_type: 'O-', phone: '+1 (555) 876-5432', email: 'dwilson@example.com', last_donation: '4/5/2023', status: 'Eligible', total_donations: 25, next_eligible: '8/5/2023', tier: 'Platinum Donor' },
  { id: 'D-1006', name: 'Jennifer Lee', blood_type: 'A+', phone: '+1 (555) 234-5678', email: 'jlee@example.com', last_donation: '2/20/2023', status: 'Eligible', total_donations: 6, next_eligible: '6/20/2023', tier: 'Silver Donor' },
];

const bloodTypeData = [
  { type: 'O+', percentage: 38, count: 94, color: '#EF4444' },
  { type: 'A+', percentage: 18, count: 45, color: '#3B82F6' },
  { type: 'B+', percentage: 12, count: 30, color: '#22C55E' },
  { type: 'AB+', percentage: 6, count: 15, color: '#A855F7' },
  { type: 'O-', percentage: 9, count: 22, color: '#EF4444' },
  { type: 'A-', percentage: 7, count: 17, color: '#3B82F6' },
  { type: 'B-', percentage: 6, count: 15, color: '#22C55E' },
  { type: 'AB-', percentage: 4, count: 10, color: '#8B5CF6' },
];

const donationFrequencyData = [
  { frequency: 'First Time', count: 98 },
  { frequency: '2-4 Times', count: 107 },
  { frequency: '5-9 Times', count: 24 },
  { frequency: '10-24 Times', count: 12 },
  { frequency: '25+ Times', count: 6 },
];

export default function BloodDonors() {
  const [donors, setDonors] = useState<Donor[]>(mockDonors);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const totalDonors = 247;
  const donationsThisMonth = 38;
  const eligibleDonors = 183;
  const frequentDonors = 42;

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          donor.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = bloodTypeFilter === 'all' || donor.blood_type === bloodTypeFilter;
    const matchesStatus = statusFilter === 'all' || donor.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
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
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blood Donors</h1>
            <p className="text-muted-foreground">Manage and track blood donors in your blood bank</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register New Donor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Donors</p>
                  <p className="text-3xl font-bold mt-2">{totalDonors}</p>
                  <p className="text-xs text-green-600 mt-1">+12 from last month</p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Donations This Month</p>
                  <p className="text-3xl font-bold mt-2">{donationsThisMonth}</p>
                  <p className="text-xs text-green-600 mt-1">+5 compared to last month</p>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eligible Donors</p>
                  <p className="text-3xl font-bold mt-2">{eligibleDonors}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ready for donation</p>
                </div>
                <Badge className="bg-green-500 hover:bg-green-600 text-xs">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Frequent Donors</p>
                  <p className="text-3xl font-bold mt-2">{frequentDonors}</p>
                  <p className="text-xs text-muted-foreground mt-1">5+ donations</p>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">VIP</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Donors by Blood Type</CardTitle>
              <p className="text-sm text-muted-foreground">Distribution of registered donors by blood type</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 mb-4">
                {bloodTypeData.map((bt) => (
                  <span key={bt.type} className="text-xs text-muted-foreground">{bt.percentage}%</span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bloodTypeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {bloodTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donation Frequency</CardTitle>
              <p className="text-sm text-muted-foreground">Number of donors by donation frequency</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                {donationFrequencyData.map((df) => (
                  <span key={df.frequency} className="text-xs text-muted-foreground">{df.count}</span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={donationFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="frequency" fontSize={10} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
                {bloodTypeData.map(bt => (
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

        {/* Tabs and Table */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="m-4">
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
                              {donor.name.split(' ').map(n => n[0]).join('')}
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
