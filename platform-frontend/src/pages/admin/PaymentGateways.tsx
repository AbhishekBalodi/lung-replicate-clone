import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Settings, Check, X, Wallet, Smartphone, Building } from "lucide-react";
import { useState } from "react";

const mockGateways = [
  { id: 1, name: "Razorpay", logo: "🔷", isActive: true, mode: "live", transactionFee: "2%", supportedMethods: ["UPI", "Cards", "NetBanking", "Wallets"] },
  { id: 2, name: "PayU", logo: "🟢", isActive: false, mode: "sandbox", transactionFee: "1.8%", supportedMethods: ["UPI", "Cards", "NetBanking"] },
  { id: 3, name: "Stripe", logo: "🟣", isActive: false, mode: "sandbox", transactionFee: "2.9%", supportedMethods: ["Cards", "Wallets"] },
  { id: 4, name: "PhonePe PG", logo: "🟡", isActive: true, mode: "live", transactionFee: "0%", supportedMethods: ["UPI"] },
];

const paymentMethods = [
  { name: "Cash", icon: Wallet, enabled: true },
  { name: "UPI", icon: Smartphone, enabled: true },
  { name: "Credit/Debit Card", icon: CreditCard, enabled: true },
  { name: "Net Banking", icon: Building, enabled: true },
  { name: "Insurance", icon: CreditCard, enabled: true },
];

export default function PaymentGateways() {
  const [gateways, setGateways] = useState(mockGateways);

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payment Gateways</h1>
            <p className="text-slate-600">Configure payment processing and gateways</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Gateway
          </Button>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accepted Payment Methods</CardTitle>
            <CardDescription>Enable or disable payment methods at your facility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {paymentMethods.map((method) => (
                <div key={method.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <method.icon className="h-5 w-5 text-slate-600" />
                    <span className="font-medium">{method.name}</span>
                  </div>
                  <Switch defaultChecked={method.enabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Gateways */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Payment Gateways
            </CardTitle>
            <CardDescription>Configure online payment gateways</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gateways.map((gateway) => (
                <div key={gateway.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{gateway.logo}</span>
                      <div>
                        <h3 className="font-bold">{gateway.name}</h3>
                        <p className="text-sm text-slate-600">Transaction Fee: {gateway.transactionFee}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={gateway.isActive}
                      onCheckedChange={(checked) => {
                        setGateways(gateways.map(g => g.id === gateway.id ? {...g, isActive: checked} : g));
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={gateway.mode === "live" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {gateway.mode === "live" ? "Live" : "Sandbox"}
                      </Badge>
                      {gateway.isActive && <Badge className="bg-blue-100 text-blue-800">Active</Badge>}
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" /> Configure
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {gateway.supportedMethods.map((method) => (
                      <Badge key={method} variant="outline" className="text-xs">{method}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gateway Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gateway Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Auto-capture Payments</span>
                  <Switch defaultChecked />
                </div>
                <p className="text-sm text-slate-600">Automatically capture authorized payments</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Send Payment Receipts</span>
                  <Switch defaultChecked />
                </div>
                <p className="text-sm text-slate-600">Email receipts to patients after payment</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Refund Processing</span>
                  <Switch defaultChecked />
                </div>
                <p className="text-sm text-slate-600">Allow online refund processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
