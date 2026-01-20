import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Search, RefreshCw, Download, Plus, AlertCircle, Calendar, Filter, MoreHorizontal, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type BloodStockItem = {
  id: number;
  stock_id: string;
  blood_type: string;
  units: number;
  collection_date: string;
  expiry_date: string;
  display_status: string;
  location: string;
  donor_name: string;
  donor_id: number | null;
};

type BloodGroup = {
  id: number;
  blood_type: string;
  group_name: string;
  rh_factor: string;
};

type SummaryData = {
  totalUnits: number;
  expiringSoon: number;
  criticalTypes: number;
  totalDonors: number;
  stockByGroup: Array<{ blood_type: string; units: number }>;
};

export default function BloodStock() {
  const [items, setItems] = useState<BloodStockItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  // Add Blood Unit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({
    blood_group_id: '',
    units: '',
    collection_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    location: 'Refrigerator 1',
    source: 'donation',
    notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Build query params
      let url = '/api/dashboard/blood-bank/stock?';
      if (bloodTypeFilter !== 'all') url += `bloodType=${encodeURIComponent(bloodTypeFilter)}&`;
      if (activeTab === 'available') url += 'status=available&';
      else if (activeTab === 'reserved') url += 'status=reserved&';
      else if (activeTab === 'expiring') url += 'status=expiring&';
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      
      // Fetch data in parallel
      const [stockRes, summaryRes, groupsRes] = await Promise.all([
        api.apiGet(url),
        api.apiGet('/api/dashboard/blood-bank/summary'),
        api.apiGet('/api/dashboard/blood-bank/blood-groups')
      ]);

      const stockData = await stockRes.json();
      const summaryData = await summaryRes.json();
      const groupsData = await groupsRes.json();

      if (stockRes.ok) {
        setItems(stockData.stock || []);
      }
      if (summaryRes.ok) {
        setSummary(summaryData);
      }
      if (groupsRes.ok) {
        setBloodGroups(groupsData.groups || []);
      }
    } catch (err) {
      console.error('Error loading blood stock:', err);
      toast.error('Failed to load blood stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bloodTypeFilter, activeTab, searchQuery]);

  const handleAddUnit = async () => {
    if (!newUnit.blood_group_id || !newUnit.units) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setAddingUnit(true);
      const res = await api.apiPost('/api/dashboard/blood-bank/stock', {
        blood_group_id: parseInt(newUnit.blood_group_id),
        units: parseFloat(newUnit.units),
        collection_date: newUnit.collection_date,
        expiry_date: newUnit.expiry_date || null,
        location: newUnit.location,
        source: newUnit.source,
        notes: newUnit.notes || null
      });

      if (res.ok) {
        toast.success('Blood unit added successfully');
        setIsAddModalOpen(false);
        setNewUnit({
          blood_group_id: '',
          units: '',
          collection_date: new Date().toISOString().split('T')[0],
          expiry_date: '',
          location: 'Refrigerator 1',
          source: 'donation',
          notes: ''
        });
        loadData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add blood unit');
      }
    } catch (err) {
      console.error('Error adding blood unit:', err);
      toast.error('Failed to add blood unit');
    } finally {
      setAddingUnit(false);
    }
  };

  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['ID', 'Blood Type', 'Units', 'Collection Date', 'Expiry Date', 'Status', 'Location', 'Donor'];
      const csvContent = [
        headers.join(','),
        ...items.map(item => [
          item.stock_id,
          item.blood_type,
          item.units,
          item.collection_date || '',
          item.expiry_date || '',
          item.display_status,
          item.location || '',
          item.donor_name || ''
        ].map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `blood_stock_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Blood stock exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export data');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Available</Badge>;
      case 'Reserved':
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Reserved</Badge>;
      case 'Expiring Soon':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Expiring Soon</Badge>;
      case 'Expired':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Expired</Badge>;
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

  const stockByGroup = summary?.stockByGroup || [];
  const totalUnits = summary?.totalUnits || 0;
  const expiringSoon = summary?.expiringSoon || 0;
  const criticalTypes = summary?.criticalTypes || 0;

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
                  <p className="text-3xl font-bold mt-2">{loading ? '...' : totalUnits}</p>
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
                    {stockByGroup.map((bt) => (
                      <Badge key={bt.blood_type} variant="secondary" className="text-xs">
                        {bt.blood_type}: {bt.units}
                      </Badge>
                    ))}
                    {stockByGroup.length === 0 && !loading && (
                      <span className="text-sm text-muted-foreground">No data</span>
                    )}
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
                  <p className="text-3xl font-bold mt-2">{loading ? '...' : expiringSoon}</p>
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
                  <p className="text-3xl font-bold mt-2">{loading ? '...' : criticalTypes}</p>
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
              {stockByGroup.length > 0 ? stockByGroup.map((bt) => (
                <div key={bt.blood_type} className="flex items-center gap-4">
                  <span className="w-10 font-medium text-sm">{bt.blood_type}</span>
                  <div className="flex-1">
                    <Progress 
                      value={(Number(bt.units) / 20) * 100} 
                      className="h-3"
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-medium">{bt.units} units</span>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">
                  {loading ? 'Loading...' : 'No blood stock data available. Add blood units to get started.'}
                </p>
              )}
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
                {bloodGroups.map(bg => (
                  <SelectItem key={bg.id} value={bg.blood_type}>{bg.blood_type}</SelectItem>
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
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={items.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Blood Units
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Blood Unit</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blood_group">Blood Type *</Label>
                      <Select 
                        value={newUnit.blood_group_id} 
                        onValueChange={(v) => setNewUnit({...newUnit, blood_group_id: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodGroups.map(bg => (
                            <SelectItem key={bg.id} value={bg.id.toString()}>{bg.blood_type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="units">Units (ml) *</Label>
                      <Input
                        id="units"
                        type="number"
                        placeholder="e.g., 450"
                        value={newUnit.units}
                        onChange={(e) => setNewUnit({...newUnit, units: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collection_date">Collection Date</Label>
                      <Input
                        id="collection_date"
                        type="date"
                        value={newUnit.collection_date}
                        onChange={(e) => setNewUnit({...newUnit, collection_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry_date">Expiry Date</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={newUnit.expiry_date}
                        onChange={(e) => setNewUnit({...newUnit, expiry_date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Storage Location</Label>
                      <Select 
                        value={newUnit.location} 
                        onValueChange={(v) => setNewUnit({...newUnit, location: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Refrigerator 1">Refrigerator 1</SelectItem>
                          <SelectItem value="Refrigerator 2">Refrigerator 2</SelectItem>
                          <SelectItem value="Refrigerator 3">Refrigerator 3</SelectItem>
                          <SelectItem value="Freezer 1">Freezer 1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Source</Label>
                      <Select 
                        value={newUnit.source} 
                        onValueChange={(v) => setNewUnit({...newUnit, source: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="donation">Donation</SelectItem>
                          <SelectItem value="purchase">Purchase</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Optional notes..."
                      value={newUnit.notes}
                      onChange={(e) => setNewUnit({...newUnit, notes: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddUnit} disabled={addingUnit}>
                    {addingUnit && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Blood Unit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No blood stock records found.</p>
                  <p className="text-sm mt-1">Add blood units to get started.</p>
                </div>
              ) : (
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
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-primary">{item.stock_id}</TableCell>
                        <TableCell>{getBloodTypeBadge(item.blood_type)}</TableCell>
                        <TableCell>{item.units}</TableCell>
                        <TableCell>{item.collection_date || '-'}</TableCell>
                        <TableCell>{item.expiry_date || '-'}</TableCell>
                        <TableCell>{getStatusBadge(item.display_status)}</TableCell>
                        <TableCell>{item.location || '-'}</TableCell>
                        <TableCell className="text-primary">{item.donor_name || '-'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="p-4 flex items-center justify-between border-t">
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `Showing ${items.length} units`}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled={items.length < 50}>Next</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </ConsoleShell>
  );
}
