import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Plus, Edit, Trash2, Save } from "lucide-react";
import { useState } from "react";

const mockPricingRules = [
  { id: 1, name: "Consultation Fee", category: "Consultation", basePrice: 500, discount: 0, status: "active" },
  { id: 2, name: "Follow-up Visit", category: "Consultation", basePrice: 300, discount: 10, status: "active" },
  { id: 3, name: "Emergency Consultation", category: "Emergency", basePrice: 1000, discount: 0, status: "active" },
  { id: 4, name: "Lab Test - Basic Panel", category: "Lab", basePrice: 800, discount: 5, status: "active" },
  { id: 5, name: "Lab Test - Full Panel", category: "Lab", basePrice: 1500, discount: 10, status: "active" },
  { id: 6, name: "X-Ray", category: "Diagnostics", basePrice: 600, discount: 0, status: "active" },
  { id: 7, name: "CT Scan", category: "Diagnostics", basePrice: 3500, discount: 5, status: "active" },
  { id: 8, name: "Room Charge - General", category: "Room", basePrice: 2000, discount: 0, status: "active" },
  { id: 9, name: "Room Charge - Private", category: "Room", basePrice: 5000, discount: 0, status: "active" },
];

export default function PricingRules() {
  const [rules, setRules] = useState(mockPricingRules);

  const categories = [...new Set(rules.map(r => r.category))];

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pricing Rules</h1>
            <p className="text-slate-600">Configure pricing for services and procedures</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Pricing Rule
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Rules</p>
                  <p className="text-2xl font-bold">{rules.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Active Rules</p>
                  <p className="text-2xl font-bold">{rules.filter(r => r.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">With Discounts</p>
                  <p className="text-2xl font-bold">{rules.filter(r => r.discount > 0).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Rules by Category */}
        {categories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
              <CardDescription>{rules.filter(r => r.category === category).length} pricing rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Service Name</th>
                      <th className="text-right py-2 px-4">Base Price (₹)</th>
                      <th className="text-right py-2 px-4">Discount (%)</th>
                      <th className="text-right py-2 px-4">Final Price (₹)</th>
                      <th className="text-center py-2 px-4">Status</th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.filter(r => r.category === category).map((rule) => (
                      <tr key={rule.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">{rule.name}</td>
                        <td className="py-3 px-4 text-right">₹{rule.basePrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          {rule.discount > 0 ? (
                            <Badge className="bg-green-100 text-green-800">{rule.discount}%</Badge>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600">
                          ₹{(rule.basePrice * (1 - rule.discount / 100)).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={rule.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {rule.status}
                          </Badge>
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
        ))}
      </div>
    </ConsoleShell>
  );
}
