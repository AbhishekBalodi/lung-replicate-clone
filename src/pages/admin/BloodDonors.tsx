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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, RefreshCw, Download, Plus, Users, Calendar, Phone, Mail } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiFetch } from '@/lib/api';

type Donor = {
  id: number;
  name: string;
  blood_type: string;
  phone: string;
  email: string;
  last_donation_date: string;
  dob: string;
  gender: string;
  notes: string;
  created_at: string;
};

type BloodGroup = {
  id: number;
  group_name: string;
  rh_factor: string;
  blood_type: string;
};

type ChartData = {
  type: string;
  count: number;
  percentage: number;
  color: string;
};

type FrequencyData = {
  frequency: string;
  count: number;
};

export default function BloodDonors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [bloodTypeData, setBloodTypeData] = useState<ChartData[]>([]);
  const [donationFrequencyData, setDonationFrequencyData] = useState<FrequencyData[]>([]);
  const [summary, setSummary] = useState({ totalDonors: 0, donationsThisMonth: 0, eligibleDonors: 0, frequentDonors: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', dob: '', gender: 'male', blood_group_id: '', last_donation_date: '', notes: '', address: '', emergency_contact: ''
  });

  useEffect(() => {
    fetchData();
  }, [searchQuery, bloodTypeFilter]);

  const fetchData = async () => {
    try {
      const [donorsRes, summaryRes, chartsRes, groupsRes] = await Promise.all([
        apiFetch(`/api/dashboard/blood-bank/donors?search=${searchQuery}&bloodType=${bloodTypeFilter}`).then(r => r.json()),
        apiFetch('/api/dashboard/blood-bank/donors/summary').then(r => r.json()),
        apiFetch('/api/dashboard/blood-bank/donors/charts').then(r => r.json()),
        apiFetch('/api/dashboard/blood-bank/blood-groups').then(r => r.json())
      ]);
      setDonors(donorsRes.donors || []);
      setSummary(summaryRes);
      setBloodTypeData(chartsRes.bloodTypeData || []);
      setDonationFrequencyData(chartsRes.donationFrequencyData || []);
      setBloodGroups(groupsRes.groups || []);
    } catch (error) {
      console.error('Failed to fetch donors data:', error);
      toast.error('Failed to load donors data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Donor name is required');
      return;
    }
    try {
      await apiFetch('/api/dashboard/blood-bank/donors', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success('Donor registered successfully');
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '', dob: '', gender: 'male', blood_group_id: '', last_donation_date: '', notes: '', address: '', emergency_contact: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to register donor');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Blood Type', 'Phone', 'Email', 'Last Donation', 'Gender'];
    const csvData = donors.map(d => [d.id, d.name, d.blood_type, d.phone, d.email, d.last_donation_date, d.gender].join(','));
    const csv = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blood_donors.csv';
    a.click();
    toast.success('Donors exported to CSV');
  };

  const filteredDonors = donors.filter(donor => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'eligible' && (!donor.last_donation_date || new Date(donor.last_donation_date) < new Date(Date.now() - 56 * 24 * 60 * 60 * 1000))) ||
      (activeTab === 'ineligible' && donor.last_donation_date && new Date(donor.last_donation_date) >= new Date(Date.now() - 56 * 24 * 60 * 60 * 1000)) ||
      (activeTab === 'new' && !donor.last_donation_date);
    return matchesTab;
  });

  const getStatusBadge = (lastDonation: string) => {
    if (!lastDonation) return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>;
    const daysSince = Math.floor((Date.now() - new Date(lastDonation).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 56) return <Badge className="bg-green-500 hover:bg-green-600">Eligible</Badge>;
    return <Badge className="bg-red-500 hover:bg-red-600">Ineligible</Badge>;
  };

  const getBloodTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-blue-100 text-blue-700', 'A-': 'bg-blue-50 text-blue-600',
      'B+': 'bg-green-100 text-green-700', 'B-': 'bg-green-50 text-green-600',
      'AB+': 'bg-purple-100 text-purple-700', 'AB-': 'bg-purple-50 text-purple-600',
      'O+': 'bg-red-100 text-red-700', 'O-': 'bg-red-50 text-red-600',
    };
    return <Badge className={colors[type] || 'bg-slate-100'}>{type}</Badge>;
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blood Donors</h1>
            <p className="text-muted-foreground">Manage and track blood donors in your blood bank</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Register New Donor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Donor</DialogTitle>
                <DialogDescription>Enter the donor's information below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blood_group_id">Blood Group</Label>
                    <Select value={formData.blood_group_id} onValueChange={(v) => setFormData({...formData, blood_group_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map(bg => (
                          <SelectItem key={bg.id} value={String(bg.id)}>{bg.blood_type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="last_donation_date">Last Donation Date</Label>
                    <Input id="last_donation_date" type="date" value={formData.last_donation_date} onChange={(e) => setFormData({...formData, last_donation_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input id="emergency_contact" value={formData.emergency_contact} onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Register Donor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Donors</p>
                  <p className="text-3xl font-bold mt-2">{summary.totalDonors}</p>
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
                  <p className="text-3xl font-bold mt-2">{summary.donationsThisMonth}</p>
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
                  <p className="text-3xl font-bold mt-2">{summary.eligibleDonors}</p>
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
                  <p className="text-3xl font-bold mt-2">{summary.frequentDonors}</p>
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
              {bloodTypeData.length > 0 ? (
                <>
                  <div className="flex gap-1 mb-4 flex-wrap">
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
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donation Frequency</CardTitle>
              <p className="text-sm text-muted-foreground">Number of donors by donation frequency</p>
            </CardHeader>
            <CardContent>
              {donationFrequencyData.length > 0 ? (
                <>
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
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search donors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-64" />
            </div>
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Blood Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                {bloodGroups.map(bg => (
                  <SelectItem key={bg.id} value={bg.blood_type}>{bg.blood_type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
            <Button variant="outline" onClick={exportToCSV}><Download className="h-4 w-4 mr-2" />Export</Button>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : filteredDonors.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No donors found. Register your first donor!</TableCell></TableRow>
                  ) : (
                    filteredDonors.map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                                {donor.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{donor.name}</p>
                              <p className="text-xs text-muted-foreground">D-{String(donor.id).padStart(4, '0')}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{donor.blood_type ? getBloodTypeBadge(donor.blood_type) : '-'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {donor.phone && <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3 text-muted-foreground" />{donor.phone}</div>}
                            {donor.email && <div className="flex items-center gap-1 text-sm"><Mail className="h-3 w-3 text-muted-foreground" />{donor.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}</TableCell>
                        <TableCell>{getStatusBadge(donor.last_donation_date)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="p-4 flex items-center justify-between border-t">
                <p className="text-sm text-muted-foreground">Showing {filteredDonors.length} of {donors.length} donors</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </ConsoleShell>
  );
}
