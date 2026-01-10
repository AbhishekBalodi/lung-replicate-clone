import { useState, useEffect, useMemo } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiFetch } from '@/lib/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { format, subMonths, startOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Receipt, CreditCard, Wallet, Download } from 'lucide-react';

interface Invoice {
  id: number;
  invoice_number?: string;
  status: string;
  total?: number;
  total_amount?: number;
  created_at?: string;
  issue_date?: string;
  patient_name?: string;
  patient_email?: string;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function HospitalRevenue() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch('/api/billing/invoices');
        const data = await res.json();
        if (res.ok) setInvoices(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error fetching invoices:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate revenue metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = new Date(thisMonth.getTime() - 1);

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
    const paidRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
    const pendingRevenue = invoices
      .filter((inv) => inv.status === 'pending' || inv.status === 'unpaid')
      .reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);

    // This month revenue
    const thisMonthRevenue = invoices
      .filter((inv) => {
        const date = inv.issue_date || inv.created_at;
        if (!date) return false;
        try {
          return parseISO(date) >= thisMonth;
        } catch {
          return false;
        }
      })
      .reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);

    // Last month revenue
    const lastMonthRevenue = invoices
      .filter((inv) => {
        const date = inv.issue_date || inv.created_at;
        if (!date) return false;
        try {
          const d = parseISO(date);
          return d >= lastMonth && d <= lastMonthEnd;
        } catch {
          return false;
        }
      })
      .reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);

    const change = lastMonthRevenue > 0 
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) 
      : 0;

    return { totalRevenue, paidRevenue, pendingRevenue, thisMonthRevenue, lastMonthRevenue, change };
  }, [invoices]);

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const monthInvoices = invoices.filter((inv) => {
        const date = inv.issue_date || inv.created_at;
        if (!date) return false;
        try {
          const d = parseISO(date);
          return isWithinInterval(d, { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      });

      const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
      const paid = monthInvoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);

      months.push({
        month: format(monthDate, 'MMM'),
        revenue,
        paid,
        pending: revenue - paid,
      });
    }
    return months;
  }, [invoices]);

  // Revenue by source (simulated)
  const sourceData = useMemo(() => {
    return [
      { name: 'Consultations', value: Math.round(metrics.totalRevenue * 0.35), color: COLORS[0] },
      { name: 'Lab Tests', value: Math.round(metrics.totalRevenue * 0.25), color: COLORS[1] },
      { name: 'Procedures', value: Math.round(metrics.totalRevenue * 0.20), color: COLORS[2] },
      { name: 'Pharmacy', value: Math.round(metrics.totalRevenue * 0.15), color: COLORS[3] },
      { name: 'Other', value: Math.round(metrics.totalRevenue * 0.05), color: COLORS[4] },
    ].filter((d) => d.value > 0);
  }, [metrics.totalRevenue]);

  if (loading) return <ConsoleShell><div className="p-6">Loading...</div></ConsoleShell>;

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
            <p className="text-muted-foreground">Track hospital revenue and financial performance</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{metrics.thisMonthRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                {metrics.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${metrics.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metrics.change >= 0 ? '+' : ''}{metrics.change}% vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">₹{metrics.paidRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {invoices.filter((i) => i.status === 'paid').length} paid invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">₹{metrics.pendingRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {invoices.filter((i) => i.status === 'pending' || i.status === 'unpaid').length} pending invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      fill="url(#colorRev)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
              <CardDescription>Breakdown by revenue category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest billing transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.slice(0, 10).map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoice_number || `INV-${inv.id}`}</TableCell>
                    <TableCell>{inv.patient_name || inv.patient_email || 'N/A'}</TableCell>
                    <TableCell>₹{(inv.total || inv.total_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inv.issue_date || inv.created_at
                        ? format(parseISO(inv.issue_date || inv.created_at!), 'dd MMM yyyy')
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
