import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { format, parseISO, startOfMonth, subMonths, isWithinInterval, startOfDay, endOfDay } from "date-fns";

interface Appointment {
  id: number;
  full_name: string;
  appointment_date: string;
  appointment_time: string;
  status?: string | null;
  doctor_id?: number;
  created_at?: string | null;
}

interface Patient {
  id: number;
  full_name: string;
  created_at?: string;
  last_visit_date?: string;
  is_new_patient?: boolean;
}

interface Invoice {
  id: number;
  status: string;
  total_amount?: number;
  total?: number;
  created_at?: string;
  issue_date?: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization?: string | null;
  is_active: boolean;
}

interface SuperAdminGraphsProps {
  appointments: Appointment[];
  patients: Patient[];
  invoices: Invoice[];
  doctors: Doctor[];
}

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#84CC16"];

export default function SuperAdminGraphs({
  appointments,
  patients,
  invoices,
  doctors,
}: SuperAdminGraphsProps) {
  const [activeTab, setActiveTab] = useState("revenue");

  // Generate monthly revenue data from invoices
  const revenueData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const monthInvoices = invoices.filter((inv) => {
        const invDate = inv.issue_date || inv.created_at;
        if (!invDate) return false;
        try {
          const date = parseISO(invDate);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      });

      const total = monthInvoices.reduce((sum, inv) => sum + (inv.total_amount || inv.total || 0), 0);
      const paid = monthInvoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (inv.total_amount || inv.total || 0), 0);

      months.push({
        month: format(monthDate, "MMM"),
        revenue: total,
        paid: paid,
        pending: total - paid,
      });
    }
    return months;
  }, [invoices]);

  // Generate monthly appointments data
  const appointmentsData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const monthAppointments = appointments.filter((apt) => {
        if (!apt.appointment_date) return false;
        try {
          const date = parseISO(apt.appointment_date);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      });

      const completed = monthAppointments.filter((a) => a.status === "done").length;
      const cancelled = monthAppointments.filter((a) => a.status === "cancelled").length;
      const pending = monthAppointments.filter((a) => !a.status || a.status === "pending").length;

      months.push({
        month: format(monthDate, "MMM"),
        total: monthAppointments.length,
        completed,
        cancelled,
        pending,
      });
    }
    return months;
  }, [appointments]);

  // Generate patient growth data
  const patientGrowthData = useMemo(() => {
    const months = [];
    let cumulativeTotal = 0;

    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const newPatients = patients.filter((p) => {
        if (!p.created_at) return false;
        try {
          const date = parseISO(p.created_at);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      });

      const returningPatients = patients.filter((p) => {
        if (!p.last_visit_date || !p.created_at) return false;
        try {
          const createdDate = parseISO(p.created_at);
          const visitDate = parseISO(p.last_visit_date);
          // If created before this month but visited in this month
          return (
            createdDate < monthStart &&
            isWithinInterval(visitDate, { start: monthStart, end: monthEnd })
          );
        } catch {
          return false;
        }
      });

      cumulativeTotal += newPatients.length;

      months.push({
        month: format(monthDate, "MMM"),
        new: newPatients.length,
        returning: returningPatients.length,
        total: cumulativeTotal,
      });
    }
    return months;
  }, [patients]);

  // Department-wise income (by doctor specialization)
  const departmentData = useMemo(() => {
    const deptMap: Record<string, number> = {};

    // Group doctors by specialization
    doctors.forEach((doc) => {
      const dept = doc.specialization || "General";
      if (!deptMap[dept]) deptMap[dept] = 0;
    });

    // Assign revenue (simulated based on appointments count for now)
    const appointmentsByDoctor = appointments.reduce((acc, apt) => {
      if (apt.doctor_id) {
        acc[apt.doctor_id] = (acc[apt.doctor_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    doctors.forEach((doc) => {
      const dept = doc.specialization || "General";
      const appointmentCount = appointmentsByDoctor[doc.id] || 0;
      // Estimate revenue based on appointments (avg consultation fee)
      deptMap[dept] += appointmentCount * 500; // ₹500 average per appointment
    });

    return Object.entries(deptMap)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [doctors, appointments]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const today = new Date();
    const thisMonth = startOfMonth(today);
    const lastMonth = subMonths(thisMonth, 1);

    // This month's revenue
    const thisMonthRevenue = invoices
      .filter((inv) => {
        const date = inv.issue_date || inv.created_at;
        if (!date) return false;
        try {
          return parseISO(date) >= thisMonth;
        } catch {
          return false;
        }
      })
      .reduce((sum, inv) => sum + (inv.total_amount || inv.total || 0), 0);

    // Last month's revenue
    const lastMonthRevenue = invoices
      .filter((inv) => {
        const date = inv.issue_date || inv.created_at;
        if (!date) return false;
        try {
          const d = parseISO(date);
          return d >= lastMonth && d < thisMonth;
        } catch {
          return false;
        }
      })
      .reduce((sum, inv) => sum + (inv.total_amount || inv.total || 0), 0);

    const revenueChange =
      lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

    // This month's appointments
    const thisMonthAppointments = appointments.filter((apt) => {
      if (!apt.appointment_date) return false;
      try {
        return parseISO(apt.appointment_date) >= thisMonth;
      } catch {
        return false;
      }
    }).length;

    const completedThisMonth = appointments.filter((apt) => {
      if (!apt.appointment_date) return false;
      try {
        return parseISO(apt.appointment_date) >= thisMonth && apt.status === "done";
      } catch {
        return false;
      }
    }).length;

    const completionRate =
      thisMonthAppointments > 0 ? Math.round((completedThisMonth / thisMonthAppointments) * 100) : 0;

    return {
      totalRevenue: invoices.reduce((sum, inv) => sum + (inv.total_amount || inv.total || 0), 0),
      thisMonthRevenue,
      revenueChange,
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter((a) => a.status === "done").length,
      completionRate,
    };
  }, [invoices, appointments]);

  return (
    <Card className="bg-emerald-800/90 border-emerald-700 text-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Hospital Performance Metrics</CardTitle>
        <p className="text-emerald-100 text-sm">Hospital-wide analytics and trends</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-emerald-900/50 border border-emerald-600">
            <TabsTrigger
              value="revenue"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-emerald-200"
            >
              Revenue Trend
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-emerald-200"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger
              value="patients"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-emerald-200"
            >
              Patient Growth
            </TabsTrigger>
            <TabsTrigger
              value="department"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-emerald-200"
            >
              Departments
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-[350px]">
          {activeTab === "revenue" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#D1FAE5", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#D1FAE5", fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#064E3B",
                    border: "1px solid #065F46",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeTab === "appointments" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#D1FAE5", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#D1FAE5", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#064E3B",
                    border: "1px solid #065F46",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cancelled" stackId="a" fill="#EF4444" name="Cancelled" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ color: "#D1FAE5" }} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeTab === "patients" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientGrowthData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#D1FAE5", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#D1FAE5", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#064E3B",
                    border: "1px solid #065F46",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="new"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 2 }}
                  name="New Patients"
                />
                <Line
                  type="monotone"
                  dataKey="returning"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                  name="Returning"
                />
                <Legend wrapperStyle={{ color: "#D1FAE5" }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeTab === "department" && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ""
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#064E3B",
                    border: "1px solid #065F46",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-emerald-600">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-300">
              ₹{summaryStats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-emerald-200">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-300">{summaryStats.completedAppointments}</p>
            <p className="text-sm text-emerald-200">Completed Appointments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-300">{summaryStats.completionRate}%</p>
            <p className="text-sm text-emerald-200">Completion Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
