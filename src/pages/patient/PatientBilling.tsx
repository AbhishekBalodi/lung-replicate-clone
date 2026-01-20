import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Download, Receipt, Calendar, CheckCircle, Clock, AlertCircle, Building2, RefreshCw } from "lucide-react";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

interface Invoice {
  id: number;
  invoice_number: string;
  status: string;
  sub_total: number;
  tax: number;
  discount: number;
  total: number;
  issued_date: string;
  due_date: string;
  created_at: string;
}

interface BillingSummary {
  totalPaid: number;
  totalPending: number;
  invoiceCount: number;
}

const PatientBilling = () => {
  const { user } = useCustomAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<BillingSummary>({ totalPaid: 0, totalPending: 0, invoiceCount: 0 });

  const fetchBilling = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/dashboard/patient/billing?email=${encodeURIComponent(user?.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setSummary(data.summary || { totalPaid: 0, totalPending: 0, invoiceCount: 0 });
      }
    } catch (error) {
      console.error('Error fetching billing:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchBilling();
    }
  }, [user?.email, fetchBilling]);

  const pendingInvoices = invoices.filter(i => i.status !== 'paid');
  const paidInvoices = invoices.filter(i => i.status === 'paid');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; icon: React.ReactNode }> = {
      "paid": { variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> },
      "pending": { variant: "default", icon: <Clock className="h-3 w-3" /> },
      "unpaid": { variant: "default", icon: <Clock className="h-3 w-3" /> },
      "overdue": { variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> }
    };
    const config = variants[status?.toLowerCase()] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading billing information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage your invoices and payments</p>
        </div>
        <div className="flex gap-2">
          {summary.totalPending > 0 && (
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ₹{summary.totalPending.toLocaleString()}
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={fetchBilling}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Outstanding Balance Card */}
      {summary.totalPending > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Outstanding</p>
                <p className="text-3xl font-bold text-red-600">₹{summary.totalPending.toLocaleString()}</p>
              </div>
              <Button variant="destructive">Pay Now</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{summary.totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">₹{summary.totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{summary.invoiceCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6 space-y-4">
          {invoices.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No invoices found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your invoices will appear here after consultations
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {pendingInvoices.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-muted-foreground">Pending ({pendingInvoices.length})</h3>
                  {pendingInvoices.map(invoice => (
                    <Card key={invoice.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{invoice.invoice_number}</span>
                              {getStatusBadge(invoice.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">₹{Number(invoice.total).toLocaleString()}</span>
                            <Button size="sm">Pay</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {paidInvoices.length > 0 && (
                <div className="space-y-2 mt-6">
                  <h3 className="font-medium text-muted-foreground">Paid ({paidInvoices.length})</h3>
                  {paidInvoices.map(invoice => (
                    <Card key={invoice.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{invoice.invoice_number}</span>
                              {getStatusBadge(invoice.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Paid on: {new Date(invoice.issued_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">₹{Number(invoice.total).toLocaleString()}</span>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-6 space-y-4">
          {paidInvoices.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No payment history</p>
              </CardContent>
            </Card>
          ) : (
            paidInvoices.map(invoice => (
              <Card key={invoice.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">₹{Number(invoice.total).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Invoice: {invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">Date: {new Date(invoice.issued_date).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insurance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Insurance Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center py-6 text-muted-foreground">
                No insurance details on file. Contact administration to add your insurance information.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientBilling;
