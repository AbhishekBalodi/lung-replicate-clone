import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

type InvoiceStatus = 'ALL' | 'UNPAID' | 'PAID' | 'PARTIAL';

export default function InvoicesList() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('ALL');

  const loadInvoices = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (status !== 'ALL') params.append('status', status);

      const res = await fetch(
        `${api.getApiBaseUrl()}/api/billing/invoices?${params.toString()}`
      );
      const js = await res.json();

      if (!res.ok) throw new Error(js?.error || 'Failed to load invoices');

      setInvoices(js || []);
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [status]);

  const statusBadge = (value: string) => {
    switch (value) {
      case 'PAID':
        return <Badge className="bg-green-600">Paid</Badge>;
      case 'UNPAID':
        return <Badge variant="destructive">Unpaid</Badge>;
      case 'PARTIAL':
        return <Badge className="bg-yellow-500">Partially Paid</Badge>;
      default:
        return <Badge variant="secondary">{value}</Badge>;
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">
              Manage billing and invoices for your patients.
            </p>
          </div>

          <Button onClick={() => navigate('/admin/billing/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'UNPAID', 'PAID', 'PARTIAL'] as InvoiceStatus[]).map(tab => (
            <Button
              key={tab}
              variant={status === tab ? 'default' : 'outline'}
              onClick={() => setStatus(tab)}
            >
              {tab === 'ALL'
                ? 'All Invoices'
                : tab === 'UNPAID'
                ? 'Unpaid'
                : tab === 'PAID'
                ? 'Paid'
                : 'Partially Paid'}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadInvoices()}
          />
          <Button variant="outline" onClick={loadInvoices}>
            Search
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice List
            </CardTitle>
            <CardDescription>
              Showing invoices based on selected filter.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : invoices.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No invoices found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2">Invoice #</th>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b last:border-0">
                        <td className="py-2 font-medium">
                          {inv.invoice_number}
                        </td>
                        <td>
                          {inv.patient_name || inv.patient_email || '-'}
                        </td>
                        <td>
                          {inv.invoice_date
                            ? new Date(inv.invoice_date).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>₹{inv.total}</td>
                        <td>{statusBadge(inv.status)}</td>
                        <td className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/admin/billing/invoice/${inv.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </ConsoleShell>
  );
}
