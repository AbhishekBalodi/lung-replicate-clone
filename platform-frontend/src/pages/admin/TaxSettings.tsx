import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Percent, Plus, Edit, Trash2, Save } from "lucide-react";
import { useState } from "react";

const mockTaxRules = [
  { id: 1, name: "GST", rate: 18, applicableTo: "All Services", isActive: true },
  { id: 2, name: "SGST", rate: 9, applicableTo: "All Services", isActive: true },
  { id: 3, name: "CGST", rate: 9, applicableTo: "All Services", isActive: true },
  { id: 4, name: "Service Tax", rate: 5, applicableTo: "Consultations", isActive: false },
  { id: 5, name: "Medical Cess", rate: 1, applicableTo: "Lab Tests", isActive: true },
];

export default function TaxSettings() {
  const [taxes, setTaxes] = useState(mockTaxRules);
  const [showTaxOnInvoice, setShowTaxOnInvoice] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [roundOff, setRoundOff] = useState(true);

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tax Settings</h1>
            <p className="text-slate-600">Configure tax rates and billing settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Tax Rule
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tax Rules */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5" /> Tax Rules
              </CardTitle>
              <CardDescription>Configure tax rates for different services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Tax Name</th>
                      <th className="text-right py-2 px-4">Rate (%)</th>
                      <th className="text-left py-2 px-4">Applicable To</th>
                      <th className="text-center py-2 px-4">Status</th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxes.map((tax) => (
                      <tr key={tax.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">{tax.name}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="outline">{tax.rate}%</Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{tax.applicableTo}</td>
                        <td className="py-3 px-4 text-center">
                          <Switch 
                            checked={tax.isActive}
                            onCheckedChange={(checked) => {
                              setTaxes(taxes.map(t => t.id === tax.id ? {...t, isActive: checked} : t));
                            }}
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tax Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Settings</CardTitle>
              <CardDescription>Configure how taxes appear on invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Show Tax on Invoice</p>
                  <p className="text-sm text-slate-600">Display tax details on patient invoices</p>
                </div>
                <Switch checked={showTaxOnInvoice} onCheckedChange={setShowTaxOnInvoice} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Show Tax Breakdown</p>
                  <p className="text-sm text-slate-600">Show individual tax components</p>
                </div>
                <Switch checked={showBreakdown} onCheckedChange={setShowBreakdown} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Round Off Amount</p>
                  <p className="text-sm text-slate-600">Round invoice totals to nearest rupee</p>
                </div>
                <Switch checked={roundOff} onCheckedChange={setRoundOff} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Tax Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Total Active Taxes</p>
                <p className="text-2xl font-bold">{taxes.filter(t => t.isActive).length}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Combined Tax Rate</p>
                <p className="text-2xl font-bold">{taxes.filter(t => t.isActive).reduce((sum, t) => sum + t.rate, 0)}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">GST Rate</p>
                <p className="text-2xl font-bold">{taxes.find(t => t.name === "GST")?.rate || 0}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Inactive Taxes</p>
                <p className="text-2xl font-bold">{taxes.filter(t => !t.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
