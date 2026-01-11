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
import api from '@/lib/api';
import { Search, RefreshCw, Download, Plus, AlertCircle, Calendar, Filter, MoreHorizontal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type BloodStockItem = {
  id: string;
  blood_type: string;
  units: number;
  collection_date: string;
  expiry_date: string;
  status: 'Available' | 'Reserved' | 'Expiring Soon';
  location: string;
  donor: string;
};

const mockBloodStock: BloodStockItem[] = [
  { id: 'BS-001', blood_type: 'A+', units: 12, collection_date: '2023-04-15', expiry_date: '2023-05-15', status: 'Available', location: 'Refrigerator 1', donor: 'John Smith' },
  { id: 'BS-002', blood_type: 'O-', units: 5, collection_date: '2023-04-16', expiry_date: '2023-05-16', status: 'Reserved', location: 'Refrigerator 2', donor: 'Emily Johnson' },
  { id: 'BS-003', blood_type: 'B+', units: 8, collection_date: '2023-04-10', expiry_date: '2023-05-10', status: 'Expiring Soon', location: 'Refrigerator 1', donor: 'Michael Brown' },
  { id: 'BS-004', blood_type: 'AB+', units: 3, collection_date: '2023-04-12', expiry_date: '2023-05-12', status: 'Available', location: 'Refrigerator 3', donor: 'Sarah Davis' },
  { id: 'BS-005', blood_type: 'A-', units: 4, collection_date: '2023-04-14', expiry_date: '2023-05-14', status: 'Available', location: 'Refrigerator 2', donor: 'Robert Wilson' },
  { id: 'BS-006', blood_type: 'O+', units: 15, collection_date: '2023-04-18', expiry_date: '2023-05-18', status: 'Available', location: 'Refrigerator 1', donor: 'Jennifer Lee' },
  { id: 'BS-007', blood_type: 'B-', units: 2, collection_date: '2023-04-08', expiry_date: '2023-05-08', status: 'Expiring Soon', location: 'Refrigerator 3', donor: 'David Martinez' },
  { id: 'BS-008', blood_type: 'AB-', units: 1, collection_date: '2023-04-11', expiry_date: '2023-05-11', status: 'Reserved', location: 'Refrigerator 2', donor: 'Lisa Anderson' },
];

const bloodTypeDistribution = [
  { type: 'A+', units: 12, color: 'bg-green-500' },
  { type: 'A-', units: 4, color: 'bg-amber-500' },
  { type: 'B+', units: 8, color: 'bg-blue-500' },
  { type: 'B-', units: 2, color: 'bg-red-500' },
  { type: 'AB+', units: 3, color: 'bg-amber-400' },
  { type: 'AB-', units: 1, color: 'bg-orange-500' },
  { type: 'O+', units: 15, color: 'bg-emerald-500' },
  { type: 'O-', units: 5, color: 'bg-slate-500' },
];

export default function BloodStock() {
  const [items, setItems] = useState<BloodStockItem[]>(mockBloodStock);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const totalUnits = bloodTypeDistribution.reduce((sum, bt) => sum + bt.units, 0);
  const expiringUnits = items.filter(i => i.status === 'Expiring Soon').reduce((sum, i) => sum + i.units, 0);
  const criticalTypes = bloodTypeDistribution.filter(bt => bt.units <= 2).length;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.donor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = bloodTypeFilter === 'all' || item.blood_type === bloodTypeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'available' && item.status === 'Available') ||
                       (activeTab === 'reserved' && item.status === 'Reserved') ||
                       (activeTab === 'expiring' && item.status === 'Expiring Soon');
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Available</Badge>;
      case 'Reserved':
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Reserved</Badge>;
      case 'Expiring Soon':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Expiring Soon</Badge>;
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blood Stock</h1>
          <p className="text-muted-foreground">Manage and monitor blood inventory in the blood bank</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Blood Units</p>
                  <p className="text-3xl font-bold mt-2">{totalUnits}</p>
                  <p className="text-xs text-muted-foreground mt-1">Units available across all blood types</p>
                </div>
                <Plus className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blood Type Distribution</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {bloodTypeDistribution.map((bt) => (
                      <Badge key={bt.type} variant="secondary" className="text-xs">
                        {bt.type}: {bt.units}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Plus className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                  <p className="text-3xl font-bold mt-2">{expiringUnits}</p>
                  <p className="text-xs text-muted-foreground mt-1">Units expiring within the next 7 days</p>
                </div>
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Levels</p>
                  <p className="text-3xl font-bold mt-2">{criticalTypes}</p>
                  <p className="text-xs text-muted-foreground mt-1">Blood types with critically low inventory</p>
                </div>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blood Type Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Type Availability</CardTitle>
            <p className="text-sm text-muted-foreground">Current inventory levels for each blood type</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bloodTypeDistribution.map((bt) => (
                <div key={bt.type} className="flex items-center gap-4">
                  <span className="w-10 font-medium text-sm">{bt.type}</span>
                  <div className="flex-1">
                    <Progress 
                      value={(bt.units / 20) * 100} 
                      className="h-3"
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-medium">{bt.units} units</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blood units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {bloodTypeDistribution.map(bt => (
                  <SelectItem key={bt.type} value={bt.type}>{bt.type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Blood Units
            </Button>
          </div>
        </div>

        {/* Tabs and Table */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="m-4">
              <TabsTrigger value="all">All Units</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="reserved">Reserved</TabsTrigger>
              <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Collection Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-primary">{item.id}</TableCell>
                      <TableCell>{getBloodTypeBadge(item.blood_type)}</TableCell>
                      <TableCell>{item.units}</TableCell>
                      <TableCell>{item.collection_date}</TableCell>
                      <TableCell>{item.expiry_date}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-primary">{item.donor}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 flex items-center justify-between border-t">
                <p className="text-sm text-muted-foreground">Showing 1-{filteredItems.length} of {items.length} units</p>
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
