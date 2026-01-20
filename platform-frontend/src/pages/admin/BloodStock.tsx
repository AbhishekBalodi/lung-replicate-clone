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
import { Search, RefreshCw, Download, Plus, AlertCircle, Loader2, MoreHorizontal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type BloodStockItem = {
  id: number;
  blood_type: string;
  units: number;
  collection_date: string;
  expiry_date: string;
  status: string;
  batch_number: string;
  source: string;
};

type StockByGroup = {
  blood_type: string;
  units: number;
};

export default function BloodStock() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalUnits: 0,
    expiringSoon: 0,
    criticalTypes: 0,
    totalDonors: 0,
    stockByGroup: [] as StockByGroup[]
  });
  const [items, setItems] = useState<BloodStockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary
      const summaryRes = await api.apiGet('/api/dashboard/blood-bank/summary');
      const summaryData = await summaryRes.json();
      if (summaryRes.ok) {
        setSummary(summaryData);
      }

      // Fetch stock list
      let url = '/api/dashboard/blood-bank/stock?';
      if (bloodTypeFilter !== 'all') url += `bloodType=${encodeURIComponent(bloodTypeFilter)}&`;
      if (activeTab === 'expiring') url += 'status=expiring';
      
      const stockRes = await api.apiGet(url);
      const stockData = await stockRes.json();
      if (stockRes.ok) {
        setItems(stockData.stock || []);
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
  }, [bloodTypeFilter, activeTab]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.blood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.batch_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'available' && item.status === 'Available') ||
                       (activeTab === 'expiring' && item.status === 'Expiring Soon');
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Available</Badge>;
      case 'Expired':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Expired</Badge>;
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

  if (loading) {
    return (
      <ConsoleShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ConsoleShell>
    );
  }

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
                  <p className="text-3xl font-bold mt-2">{summary.totalUnits}</p>
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
                    {summary.stockByGroup.map((bt) => (
                      <Badge key={bt.blood_type} variant="secondary" className="text-xs">
                        {bt.blood_type}: {bt.units}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                  <p className="text-3xl font-bold mt-2">{summary.expiringSoon}</p>
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
                  <p className="text-3xl font-bold mt-2">{summary.criticalTypes}</p>
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
              {summary.stockByGroup.map((bt) => (
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
                {summary.stockByGroup.map(bt => (
                  <SelectItem key={bt.blood_type} value={bt.blood_type}>{bt.blood_type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
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
                    <TableHead>Batch #</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No blood stock records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-primary">BS-{item.id.toString().padStart(3, '0')}</TableCell>
                        <TableCell>{getBloodTypeBadge(item.blood_type)}</TableCell>
                        <TableCell>{item.units}</TableCell>
                        <TableCell>{item.collection_date ? new Date(item.collection_date).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{item.batch_number || '—'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="p-4 flex items-center justify-between border-t">
                <p className="text-sm text-muted-foreground">Showing {filteredItems.length} units</p>
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