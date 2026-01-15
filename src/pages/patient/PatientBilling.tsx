import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Download, Receipt, Calendar, CheckCircle, Clock, AlertCircle, Building2 } from "lucide-react";
import PatientConsoleShell from "@/layouts/PatientConsoleShell";

interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
}

interface Payment {
  id: string;
  invoiceNo: string;
  date: string;
  amount: number;
  method: string;
  transactionId: string;
}

const PatientBilling = () => {
  const [invoices] = useState<Invoice[]>([
    { id: "1", invoiceNo: "INV-2026-001", date: "2026-01-10", description: "Cardiology Consultation", amount: 1500, status: "pending" },
    { id: "2", invoiceNo: "INV-2026-002", date: "2026-01-12", description: "Lab Tests - CBC, Blood Glucose", amount: 850, status: "pending" },
    { id: "3", invoiceNo: "INV-2025-089", date: "2025-12-28", description: "General Medicine Consultation", amount: 500, status: "paid" },
    { id: "4", invoiceNo: "INV-2025-085", date: "2025-12-15", description: "Orthopedic Consultation + X-Ray", amount: 2200, status: "paid" },
  ]);

  const [payments] = useState<Payment[]>([
    { id: "1", invoiceNo: "INV-2025-089", date: "2025-12-28", amount: 500, method: "UPI", transactionId: "TXN123456789" },
    { id: "2", invoiceNo: "INV-2025-085", date: "2025-12-16", amount: 2200, method: "Card", transactionId: "TXN987654321" },
  ]);

  const [insurance] = useState({
    provider: "Star Health Insurance",
    policyNo: "SHI-2024-789456",
    validTill: "2026-12-31",
    coverage: 500000,
    utilized: 45000
  });

  const pendingInvoices = invoices.filter(i => i.status !== "paid");
  const paidInvoices = invoices.filter(i => i.status === "paid");
  const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; icon: React.ReactNode }> = {
      "paid": { variant: "secondary", icon: <CheckCircle className="h-3 w-3" /> },
      "pending": { variant: "default", icon: <Clock className="h-3 w-3" /> },
      "overdue": { variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> }
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <PatientConsoleShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Billing & Payments</h1>
            <p className="text-muted-foreground">Manage your invoices and payments</p>
          </div>
          {totalOutstanding > 0 && (
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ₹{totalOutstanding}
            </Button>
          )}
        </div>

        {/* Outstanding Balance Card */}
        {totalOutstanding > 0 && (
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  <p className="text-3xl font-bold text-red-600">₹{totalOutstanding.toLocaleString()}</p>
                </div>
                <Button variant="destructive">Pay Now</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="invoices">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-6 space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-muted-foreground">Pending ({pendingInvoices.length})</h3>
              {pendingInvoices.map(invoice => (
                <Card key={invoice.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invoice.invoiceNo}</span>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-sm">{invoice.description}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold">₹{invoice.amount.toLocaleString()}</span>
                        <Button size="sm">Pay</Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="font-medium text-muted-foreground">Paid ({paidInvoices.length})</h3>
              {paidInvoices.map(invoice => (
                <Card key={invoice.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invoice.invoiceNo}</span>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="text-sm">{invoice.description}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-muted-foreground">₹{invoice.amount.toLocaleString()}</span>
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
          </TabsContent>

          <TabsContent value="payments" className="mt-6 space-y-4">
            {payments.map(payment => (
              <Card key={payment.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                        <Badge variant="outline">{payment.method}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Invoice: {payment.invoiceNo}</p>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Transaction ID: {payment.transactionId}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="font-medium">{insurance.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Policy Number</p>
                    <p className="font-medium">{insurance.policyNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valid Till</p>
                    <p className="font-medium">{new Date(insurance.validTill).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Coverage</p>
                    <p className="font-medium">₹{insurance.coverage.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Utilized</span>
                    <span>₹{insurance.utilized.toLocaleString()} / ₹{insurance.coverage.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${(insurance.utilized / insurance.coverage) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Remaining: ₹{(insurance.coverage - insurance.utilized).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientConsoleShell>
  );
};

export default PatientBilling;
