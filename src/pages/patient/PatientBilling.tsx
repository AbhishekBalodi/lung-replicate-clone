import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Download, Receipt, Calendar, CheckCircle, Clock, AlertCircle, Building2 } from "lucide-react";

const PatientBilling = () => {
  // Note: Billing data would come from an invoices/billing table
  // Currently showing placeholder as no billing tables exist
  const [invoices] = useState<any[]>([]);
  const [payments] = useState<any[]>([]);
  const [insurance] = useState<any>(null);

  const pendingInvoices = invoices.filter(i => i.status !== "paid");
  const paidInvoices = invoices.filter(i => i.status === "paid");
  const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

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
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold">₹{invoice.amount?.toLocaleString()}</span>
                          <Button size="sm">Pay</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-6 space-y-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No payment history</p>
              </CardContent>
            </Card>
          ) : (
            payments.map(payment => (
              <Card key={payment.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">₹{payment.amount?.toLocaleString()}</span>
                        <Badge variant="outline">{payment.method}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Invoice: {payment.invoiceNo}</p>
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
              {insurance ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="font-medium">{insurance.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Policy Number</p>
                    <p className="font-medium">{insurance.policyNo}</p>
                  </div>
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  No insurance details on file. Contact administration to add your insurance information.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientBilling;
