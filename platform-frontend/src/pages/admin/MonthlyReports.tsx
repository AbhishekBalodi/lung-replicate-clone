import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, IndianRupee, Users, Calendar, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { apiGet } from "@/lib/api";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function MonthlyReports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [stats, setStats] = useState({ appointments: 450, patients: 280, revenue: 850000, growth: 12.5 });
  const [weeklyData, setWeeklyData] = useState([
    { week: "Week 1", appointments: 95, revenue: 180000 },
    { week: "Week 2", appointments: 120, revenue: 220000 },
    { week: "Week 3", appointments: 115, revenue: 210000 },
    { week: "Week 4", appointments: 120, revenue: 240000 },
  ]);

  useEffect(() => {
    const fetchMonthly = async () => {
      const year = new Date().getFullYear();
      const month = Number(selectedMonth) + 1;
      const res = await apiGet(`/api/dashboard/reports/monthly?year=${year}&month=${month}`);
      if (!res.ok) return;
      const data = await res.json();
      const apptTotal = Number(data?.appointments?.total || 0);
      const revenue = Number(data?.revenue || 0);
      const completed = Number(data?.appointments?.completed || 0);
      setStats((prev) => ({
        appointments: apptTotal,
        patients: Number(data?.newPatients || 0),
        revenue,
        growth: apptTotal > 0 ? (completed / apptTotal) * 100 : prev.growth,
      }));

      const weeks = [
        { key: "Week 1", start: 1, end: 7 },
        { key: "Week 2", start: 8, end: 14 },
        { key: "Week 3", start: 15, end: 21 },
        { key: "Week 4", start: 22, end: 31 },
      ];

      const daily = Array.isArray(data?.dailyStats) ? data.dailyStats : [];
      const computed = weeks.map((w) => {
        const inWeek = daily.filter((d: any) => Number(d.day) >= w.start && Number(d.day) <= w.end);
        const appointments = inWeek.reduce((sum: number, d: any) => sum + Number(d.appointments || 0), 0);
        const ratio = apptTotal > 0 ? appointments / apptTotal : 0;
        return {
          week: w.key,
          appointments,
          revenue: Math.round(revenue * ratio),
        };
      });
      setWeeklyData(computed);
    };
    fetchMonthly();
  }, [selectedMonth]);

  const exportCsv = () => {
    const csv = [
      ["Week", "Appointments", "Revenue"].join(","),
      ...weeklyData.map((w) => [w.week, w.appointments, w.revenue].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-report-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1><p className="text-gray-600">View monthly performance summary</p></div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{months.map((m, i) => <SelectItem key={i} value={i.toString()}>{m}</SelectItem>)}</SelectContent></Select>
            <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-4"><Calendar className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{stats.appointments}</p><p className="text-sm text-gray-600">Total Appointments</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><Users className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{stats.patients}</p><p className="text-sm text-gray-600">Unique Patients</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><IndianRupee className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">₹{(stats.revenue/1000).toFixed(0)}k</p><p className="text-sm text-gray-600">Total Revenue</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><TrendingUp className="h-8 w-8 text-purple-500" /><div><p className="text-2xl font-bold text-green-600">+{stats.growth}%</p><p className="text-sm text-gray-600">Growth</p></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle>Weekly Appointments</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis /><Tooltip /><Bar dataKey="appointments" fill="#3b82f6" /></BarChart></ResponsiveContainer></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Weekly Revenue</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis /><Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} /><Area type="monotone" dataKey="revenue" fill="#10b98140" stroke="#10b981" /></AreaChart></ResponsiveContainer></div></CardContent></Card>
        </div>
      </div>
    </ConsoleShell>
  );
}
