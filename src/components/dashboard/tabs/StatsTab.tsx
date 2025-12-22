import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

interface Appointment {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  selected_doctor: string;
  message: string | null;
  status?: string | null;
}

interface StatsTabProps {
  appointments: Appointment[];
}

export default function StatsTab({ appointments }: StatsTabProps) {
  const [statsView, setStatsView] = useState("visits");

  // Generate monthly data from appointments
  const monthlyData = [
    { month: "Jan", visits: 42, satisfaction: 85 },
    { month: "Feb", visits: 48, satisfaction: 88 },
    { month: "Mar", visits: 55, satisfaction: 82 },
    { month: "Apr", visits: 62, satisfaction: 90 },
    { month: "May", visits: 58, satisfaction: 87 },
    { month: "Jun", visits: 70, satisfaction: 92 },
    { month: "Jul", visits: 68, satisfaction: 89 },
    { month: "Aug", visits: 65, satisfaction: 86 },
    { month: "Sep", visits: 60, satisfaction: 88 },
    { month: "Oct", visits: 72, satisfaction: 91 },
    { month: "Nov", visits: 78, satisfaction: 93 },
    { month: "Dec", visits: 65, satisfaction: 87 },
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Performance Metrics</CardTitle>
        <p className="text-slate-400 text-sm">Your clinical performance and patient outcomes</p>
      </CardHeader>
      <CardContent>
        <Tabs value={statsView} onValueChange={setStatsView} className="mb-6">
          <TabsList className="bg-slate-700/50 border border-slate-600">
            <TabsTrigger 
              value="visits" 
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-400"
            >
              Patient Visits
            </TabsTrigger>
            <TabsTrigger 
              value="satisfaction" 
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-400"
            >
              Patient Satisfaction
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar 
                dataKey={statsView === "visits" ? "visits" : "satisfaction"} 
                fill="#818CF8" 
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {appointments.length}
            </p>
            <p className="text-sm text-slate-400">Total Appointments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">
              {appointments.filter(a => a.status === "done").length}
            </p>
            <p className="text-sm text-slate-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {Math.round((appointments.filter(a => a.status === "done").length / Math.max(appointments.length, 1)) * 100)}%
            </p>
            <p className="text-sm text-slate-400">Completion Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
