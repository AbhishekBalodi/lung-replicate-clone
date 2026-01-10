import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, TrendingUp, FlaskConical, TestTube, Activity } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface LabStats {
  total_revenue: number;
  total_tests: number;
  avg_per_test: number;
  growth_percent: number;
}

interface TestRevenue {
  test_name: string;
  count: number;
  revenue: number;
}

export default function LabRevenue() {
  const [period, setPeriod] = useState("this_month");
  const [stats, setStats] = useState<LabStats>({
    total_revenue: 0,
    total_tests: 0,
    avg_per_test: 0,
    growth_percent: 0
  });
  const [testRevenue, setTestRevenue] = useState<TestRevenue[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number; tests: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLabRevenue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/lab-tests/revenue");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || stats);
        setTestRevenue(data.testRevenue || []);
        setMonthlyData(data.monthlyData || []);
      } else {
        // Mock data
        setStats({
          total_revenue: 285000,
          total_tests: 1250,
          avg_per_test: 228,
          growth_percent: 12.5
        });

        setTestRevenue([
          { test_name: "Complete Blood Count", count: 320, revenue: 48000 },
          { test_name: "Liver Function Test", count: 180, revenue: 54000 },
          { test_name: "Thyroid Profile", count: 150, revenue: 45000 },
          { test_name: "Lipid Profile", count: 200, revenue: 40000 },
          { test_name: "COVID-19 RT-PCR", count: 100, revenue: 35000 },
          { test_name: "X-Ray", count: 150, revenue: 30000 },
          { test_name: "CT Scan", count: 50, revenue: 75000 },
        ]);

        setMonthlyData([
          { month: "Jan", revenue: 42000, tests: 180 },
          { month: "Feb", revenue: 45000, tests: 195 },
          { month: "Mar", revenue: 48000, tests: 210 },
          { month: "Apr", revenue: 52000, tests: 225 },
          { month: "May", revenue: 55000, tests: 240 },
          { month: "Jun", revenue: 58000, tests: 250 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching lab revenue:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabRevenue();
  }, [fetchLabRevenue]);

  const pieColors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

  const formatCurrency = (value: number) => `₹${(value / 1000).toFixed(1)}k`;

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab Revenue</h1>
            <p className="text-gray-600">Track laboratory revenue and test statistics</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.total_revenue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-100">
                  <IndianRupee className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold">{stats.total_tests.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <FlaskConical className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg per Test</p>
                  <p className="text-2xl font-bold">₹{stats.avg_per_test}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100">
                  <TestTube className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Growth</p>
                  <p className="text-2xl font-bold text-green-600">+{stats.growth_percent}%</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trend">
          <TabsList>
            <TabsTrigger value="trend">Revenue Trend</TabsTrigger>
            <TabsTrigger value="tests">By Test Type</TabsTrigger>
          </TabsList>

          <TabsContent value="trend" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Lab Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={formatCurrency} />
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        fill="#3b82f640" 
                        name="Revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Test Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={testRevenue}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="revenue"
                          label={({ test_name, percent }) => `${test_name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                        >
                          {testRevenue.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Tests by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={testRevenue.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={formatCurrency} />
                        <YAxis type="category" dataKey="test_name" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        <Bar dataKey="revenue" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Revenue Table */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Test-wise Revenue Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {testRevenue.map((test, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: pieColors[idx % pieColors.length] }} 
                        />
                        <span>{test.test_name}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-gray-600">{test.count} tests</span>
                        <span className="font-medium">₹{test.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
