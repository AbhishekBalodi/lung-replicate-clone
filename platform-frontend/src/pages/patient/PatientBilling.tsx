import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, Loader2, Download, CheckCircle2, Clock } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { toast } from "sonner";
import api from "@/lib/api";

interface Invoice {
  id: number;
  invoice_number: string;
  status: string;
  sub_total: number;
  tax: number;
  discount: number;
  total: number;
  issued_date: string | null;
  due_date: string | null;
  created_at: string;
}

interface BillingSummary {
  totalPaid: number;
  totalPending: number;
  invoiceCount: number;
}

const PatientBilling = () => {
  const { user } = useCustomAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<BillingSummary>({
    totalPaid: 0,
    totalPending: 0,
    invoiceCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchBilling();
    }
  }, [user?.email]);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const res = await api.apiGet(`/api/dashboard/patient/billing?email=${encodeURIComponent(user?.email || '')}`);
      const data = await res.json();
      
      if (res.ok) {
        setInvoices(data.invoices || []);
        setSummary(data.summary || { totalPaid: 0, totalPending: 0, invoiceCount: 0 });
      } else {
        throw new Error(data.error || 'Failed to load billing information');
      }
    } catch (error) {
      console.error('Error fetching billing:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Paid</Badge>;
      case 'unpaid':
        return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" /> Unpaid</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');
  const paidInvoices = invoices.filter(i => i.status === 'paid');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground">View and pay your bills</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalPending)}</div>
            <p className="text-xs text-muted-foreground">{unpaidInvoices.length} unpaid invoice(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">{paidInvoices.length} paid invoice(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.invoiceCount}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Invoices */}
      {unpaidInvoices.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Pending Payments</h2>
          <div className="space-y-4">
            {unpaidInvoices.map(invoice => (
              <Card key={invoice.id} className="border-destructive/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                        <CreditCard className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Invoice #{invoice.invoice_number}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : 'N/A'}
                          {invoice.due_date && (
                            <span className="text-destructive">
                              • Due: {new Date(invoice.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{formatCurrency(invoice.total)}</div>
                      {getStatusBadge(invoice.status)}
                      <div className="mt-2">
                        <Button size="sm">Pay Now</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>
        {paidInvoices.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payment history</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paidInvoices.map(invoice => (
              <Card key={invoice.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Invoice #{invoice.invoice_number}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{formatCurrency(invoice.total)}</div>
                      {getStatusBadge(invoice.status)}
                      <Button size="sm" variant="outline" className="mt-2">
                        <Download className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientBilling;