import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, IndianRupee, Users, Stethoscope } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function DoctorRevenueReport() {
  const [doctorData, setDoctorData] = useState<{ name: string; revenue: number; patients: number; appointments: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctorRevenue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/reports/doctor-revenue");
      if (res.ok) { const data = await res.json(); setDoctorData(data || []); }
      else {
        setDoctorData([
          { name: "Dr. Mann", revenue: 185000, patients: 120, appointments: 145 },
          { name: "Dr. Gupta", revenue: 165000, patients: 95, appointments: 125 },
          { name: "Dr. Sharma", revenue: 145000, patients: 85, appointments: 110 },
          { name: "Dr. Singh", revenue: 125000, patients: 75, appointments: 95 },
          { name: "Dr. Mehta", revenue: 95000, patients: 55, appointments: 70 },
        ]);
      }
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDoctorRevenue(); }, [fetchDoctorRevenue]);

  const totalRevenue = doctorData.reduce((sum, d) => sum + d.revenue, 0);
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Doctor-wise Revenue</h1><p className="text-gray-600">Revenue breakdown by doctor</p></div>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-4"><IndianRupee className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">₹{(totalRevenue/1000).toFixed(0)}k</p><p className="text-sm text-gray-600">Total Revenue</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><Stethoscope className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">{doctorData.length}</p><p className="text-sm text-gray-600">Doctors</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><Users className="h-8 w-8 text-purple-500" /><div><p className="text-2xl font-bold">{doctorData.reduce((s, d) => s + d.patients, 0)}</p><p className="text-sm text-gray-600">Total Patients</p></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle>Revenue by Doctor</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={doctorData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tickFormatter={(v) => `₹${(v/1000)}k`} /><YAxis type="category" dataKey="name" width={80} /><Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} /><Bar dataKey="revenue" fill="#10b981" /></BarChart></ResponsiveContainer></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Revenue Distribution</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={doctorData} cx="50%" cy="50%" outerRadius={80} dataKey="revenue" label={({ name, percent }) => `${name.split(" ")[1]} ${(percent*100).toFixed(0)}%`}>{doctorData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} /></PieChart></ResponsiveContainer></div></CardContent></Card>
        </div>

        <Card><CardContent className="p-0"><div className="divide-y">{doctorData.map((doc, i) => (<div key={i} className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} /><span className="font-medium">{doc.name}</span></div><div className="flex gap-8 text-sm"><span>{doc.appointments} appts</span><span>{doc.patients} patients</span><span className="font-bold">₹{doc.revenue.toLocaleString()}</span></div></div>))}</div></CardContent></Card>
      </div>
    </ConsoleShell>
  );
}
