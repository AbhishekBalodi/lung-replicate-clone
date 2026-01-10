import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, IndianRupee, Users, Calendar, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

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

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1><p className="text-gray-600">View monthly performance summary</p></div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{months.map((m, i) => <SelectItem key={i} value={i.toString()}>{m}</SelectItem>)}</SelectContent></Select>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
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
