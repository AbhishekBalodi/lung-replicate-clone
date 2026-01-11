import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiFetch } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Download, Calendar, TrendingUp, Users, Stethoscope, Building } from 'lucide-react';

interface Appointment {
  id: number;
  appointment_date: string;
  status?: string;
  doctor_id?: number;
  selected_doctor?: string;
}

interface Invoice {
  id: number;
  total?: number;
  total_amount?: number;
  issue_date?: string;
  created_at?: string;
  status: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization?: string;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

export default function ReportsPage() {
  const { type } = useParams<{ type: string }>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, invRes, docRes] = await Promise.all([
          apiFetch('/api/appointment'),
          apiFetch('/api/billing/invoices'),
          apiFetch('/api/doctors'),
        ]);

        const aptData = await aptRes.json();
        const invData = await invRes.json();
        const docData = await docRes.json();

        if (aptRes.ok) setAppointments(Array.isArray(aptData) ? aptData : []);
        if (invRes.ok) setInvoices(Array.isArray(invData) ? invData : []);
        if (docRes.ok) setDoctors(docData.doctors || []);
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Daily report data (last 30 days)
  const dailyData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayAppointments = appointments.filter((apt) => {
        if (!apt.appointment_date) return false;
        try {
          return isWithinInterval(parseISO(apt.appointment_date), { start: dayStart, end: dayEnd });
        } catch {
          return false;
        }
      });

      const dayInvoices = invoices.filter((inv) => {
        const invDate = inv.issue_date || inv.created_at;
        if (!invDate) return false;
        try {
          return isWithinInterval(parseISO(invDate), { start: dayStart, end: dayEnd });
        } catch {
          return false;
        }
      });

      days.push({
        date: format(date, 'dd MMM'),
        appointments: dayAppointments.length,
        revenue: dayInvoices.reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0),
        completed: dayAppointments.filter((a) => a.status === 'done').length,
      });
    }
    return days;
  }, [appointments, invoices]);

  // Monthly report data (last 12 months)
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const monthAppointments = appointments.filter((apt) => {
        if (!apt.appointment_date) return false;
        try {
          return isWithinInterval(parseISO(apt.appointment_date), { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      });

      const monthInvoices = invoices.filter((inv) => {
        const invDate = inv.issue_date || inv.created_at;
        if (!invDate) return false;
        try {
          return isWithinInterval(parseISO(invDate), { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      });

      months.push({
        month: format(monthDate, 'MMM yyyy'),
        appointments: monthAppointments.length,
        revenue: monthInvoices.reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0),
        completed: monthAppointments.filter((a) => a.status === 'done').length,
        cancelled: monthAppointments.filter((a) => a.status === 'cancelled').length,
      });
    }
    return months;
  }, [appointments, invoices]);

  // Doctor-wise revenue
  const doctorRevenueData = useMemo(() => {
    const doctorMap: Record<string, { name: string; appointments: number; revenue: number }> = {};

    doctors.forEach((doc) => {
      doctorMap[doc.id] = { name: doc.name, appointments: 0, revenue: 0 };
    });

    appointments.forEach((apt) => {
      if (apt.doctor_id && doctorMap[apt.doctor_id]) {
        doctorMap[apt.doctor_id].appointments++;
        // Estimate revenue per appointment
        doctorMap[apt.doctor_id].revenue += 500;
      }
    });

    return Object.values(doctorMap)
      .filter((d) => d.appointments > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [doctors, appointments]);

  // Department-wise revenue
  const departmentRevenueData = useMemo(() => {
    const deptMap: Record<string, { name: string; revenue: number; color: string }> = {};

    doctors.forEach((doc, i) => {
      const dept = doc.specialization || 'General';
      if (!deptMap[dept]) {
        deptMap[dept] = { name: dept, revenue: 0, color: COLORS[Object.keys(deptMap).length % COLORS.length] };
      }
    });

    appointments.forEach((apt) => {
      const doc = doctors.find((d) => d.id === apt.doctor_id);
      if (doc) {
        const dept = doc.specialization || 'General';
        if (deptMap[dept]) {
          deptMap[dept].revenue += 500;
        }
      }
    });

    return Object.values(deptMap)
      .filter((d) => d.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [doctors, appointments]);

  const getTitle = () => {
    switch (type) {
      case 'daily':
        return 'Daily Reports';
      case 'monthly':
        return 'Monthly Reports';
      case 'doctor-revenue':
        return 'Doctor-wise Revenue';
      case 'department-revenue':
        return 'Department-wise Revenue';
      default:
        return 'Reports';
    }
  };

  if (loading) return <ConsoleShell><div className="p-6">Loading...</div></ConsoleShell>;

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{getTitle()}</h1>
            <p className="text-muted-foreground">Comprehensive analytics and insights</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Daily Reports */}
        {type === 'daily' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Last 30 Days Overview</CardTitle>
                <CardDescription>Daily appointments and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="appointments" fill="#3B82F6" name="Appointments" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyData.slice(-7).reverse().map((day, i) => (
                      <TableRow key={i}>
                        <TableCell>{day.date}</TableCell>
                        <TableCell>{day.appointments}</TableCell>
                        <TableCell>{day.completed}</TableCell>
                        <TableCell>₹{day.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly Reports */}
        {type === 'monthly' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>12 Month Trend</CardTitle>
                <CardDescription>Monthly performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" fontSize={10} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
                      <Bar dataKey="cancelled" stackId="a" fill="#EF4444" name="Cancelled" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Cancelled</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.slice(-6).reverse().map((month, i) => (
                      <TableRow key={i}>
                        <TableCell>{month.month}</TableCell>
                        <TableCell>{month.appointments}</TableCell>
                        <TableCell>{month.completed}</TableCell>
                        <TableCell>{month.cancelled}</TableCell>
                        <TableCell>₹{month.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Doctor-wise Revenue */}
        {type === 'doctor-revenue' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Doctor</CardTitle>
                <CardDescription>Performance comparison across doctors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctorRevenueData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} />
                      <YAxis type="category" dataKey="name" width={150} fontSize={12} />
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                      <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doctor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorRevenueData.map((doc, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>{doc.appointments}</TableCell>
                        <TableCell>₹{doc.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Department-wise Revenue */}
        {type === 'department-revenue' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Department</CardTitle>
                  <CardDescription>Distribution across specializations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentRevenueData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={120}
                          dataKey="revenue"
                        >
                          {departmentRevenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentRevenueData.map((dept, i) => {
                        const total = departmentRevenueData.reduce((s, d) => s + d.revenue, 0);
                        const share = total > 0 ? Math.round((dept.revenue / total) * 100) : 0;
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{dept.name}</TableCell>
                            <TableCell>₹{dept.revenue.toLocaleString()}</TableCell>
                            <TableCell>{share}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ConsoleShell>
  );
}
