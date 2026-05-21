import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, IndianRupee, Building2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function DepartmentRevenueReport() {
  const [deptData, setDeptData] = useState<{ name: string; revenue: number; patients: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartmentRevenue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/dashboard/reports/department-revenue");
      if (res.ok) {
        const data = await res.json();
        const rows = Array.isArray(data?.departments) ? data.departments : [];
        setDeptData(rows.map((row: any) => ({
          name: row.department_name || row.name || "Unknown",
          revenue: Number(row.total_revenue || 0),
          patients: Number(row.total_appointments || 0),
        })));
      } else {
        setDeptData([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentRevenue();
  }, [fetchDepartmentRevenue]);

  const exportCsv = () => {
    const csv = [
      ["Department", "Revenue", "Patients/Appointments"].join(","),
      ...deptData.map((d) => [d.name, d.revenue, d.patients].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "department-revenue.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = deptData.reduce((sum, d) => sum + d.revenue, 0);
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Department-wise Revenue</h1><p className="text-gray-600">Revenue breakdown by department</p></div>
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>

        {loading && <Card><CardContent className="p-4 text-sm text-gray-500">Loading department revenue...</CardContent></Card>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-4"><IndianRupee className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">₹{(totalRevenue/100000).toFixed(1)}L</p><p className="text-sm text-gray-600">Total Revenue</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><Building2 className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{deptData.length}</p><p className="text-sm text-gray-600">Departments</p></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle>Revenue by Department</CardTitle></CardHeader><CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={deptData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(v) => `₹${(v/1000)}k`} /><Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} /><Bar dataKey="revenue" fill="#3b82f6" /></BarChart></ResponsiveContainer></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Distribution</CardTitle></CardHeader><CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deptData} cx="50%" cy="50%" outerRadius={90} dataKey="revenue" label={({ name, percent }) => `${name.substring(0,5)}.. ${(percent*100).toFixed(0)}%`}>{deptData.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Pie><Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} /></PieChart></ResponsiveContainer></div></CardContent></Card>
        </div>

        <Card><CardContent className="p-0"><div className="divide-y">{deptData.map((dept, i) => (<div key={i} className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} /><span className="font-medium">{dept.name}</span></div><div className="flex gap-8"><span className="text-sm">{dept.patients} patients</span><span className="font-bold">₹{dept.revenue.toLocaleString()}</span></div></div>))}</div></CardContent></Card>
      </div>
    </ConsoleShell>
  );
}
