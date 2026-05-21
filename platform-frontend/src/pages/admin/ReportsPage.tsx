import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

type DailyResponse = {
  date: string;
  appointments?: { total?: number; completed?: number; pending?: number; cancelled?: number };
  revenue?: number;
  newPatients?: number;
};

type MonthlyResponse = {
  year: number;
  month: number;
  dailyStats?: Array<{ day: number; appointments: number; completed: number }>;
  revenue?: number;
  appointments?: { total?: number; completed?: number; cancelled?: number };
  newPatients?: number;
};

type DoctorRevenueRow = {
  doctor_id: number;
  doctor_name: string;
  specialization?: string;
  total_appointments: number;
  total_revenue: number;
};

type DepartmentRevenueRow = {
  department_id: number;
  department_name: string;
  doctor_count: number;
  total_appointments: number;
  total_revenue: number;
};

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

export default function ReportsPage() {
  const { type } = useParams<{ type: string }>();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [daily, setDaily] = useState<DailyResponse | null>(null);
  const [monthly, setMonthly] = useState<MonthlyResponse | null>(null);
  const [doctorRows, setDoctorRows] = useState<DoctorRevenueRow[]>([]);
  const [departmentRows, setDepartmentRows] = useState<DepartmentRevenueRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (type === 'daily') {
          const res = await apiFetch(`/api/dashboard/reports/daily?date=${selectedDate}`);
          const data: DailyResponse = await res.json();
          if (res.ok) setDaily(data);
        } else if (type === 'monthly') {
          const [yearStr, monthStr] = selectedMonth.split('-');
          const res = await apiFetch(`/api/dashboard/reports/monthly?year=${yearStr}&month=${monthStr}`);
          const data: MonthlyResponse = await res.json();
          if (res.ok) setMonthly(data);
        } else if (type === 'doctor-revenue') {
          const res = await apiFetch('/api/dashboard/reports/doctor-revenue');
          const data = await res.json();
          if (res.ok) setDoctorRows(Array.isArray(data?.doctors) ? data.doctors : []);
        } else if (type === 'department-revenue') {
          const res = await apiFetch('/api/dashboard/reports/department-revenue');
          const data = await res.json();
          if (res.ok) setDepartmentRows(Array.isArray(data?.departments) ? data.departments : []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, selectedDate, selectedMonth]);

  const dailyChartData = useMemo(() => {
    if (!daily) return [];
    return [
      { key: 'Completed', value: Number(daily.appointments?.completed || 0) },
      { key: 'Pending', value: Number(daily.appointments?.pending || 0) },
      { key: 'Cancelled', value: Number(daily.appointments?.cancelled || 0) },
    ];
  }, [daily]);

  const monthlyChartData = useMemo(() => {
    if (!monthly?.dailyStats) return [];
    return monthly.dailyStats.map((d) => ({
      day: `D${d.day}`,
      appointments: Number(d.appointments || 0),
      completed: Number(d.completed || 0),
    }));
  }, [monthly]);

  const doctorChartData = doctorRows.map((d) => ({
    name: d.doctor_name,
    revenue: Number(d.total_revenue || 0),
  }));

  const departmentChartData = departmentRows.map((d, idx) => ({
    name: d.department_name,
    revenue: Number(d.total_revenue || 0),
    color: COLORS[idx % COLORS.length],
  }));

  const exportCsv = () => {
    let rows: string[] = [];

    if (type === 'doctor-revenue') {
      rows = [
        ['Doctor', 'Specialization', 'Appointments', 'Revenue'].join(','),
        ...doctorRows.map((d) => [
          d.doctor_name,
          d.specialization || '',
          d.total_appointments,
          d.total_revenue,
        ].join(',')),
      ];
    } else if (type === 'department-revenue') {
      rows = [
        ['Department', 'Doctors', 'Appointments', 'Revenue'].join(','),
        ...departmentRows.map((d) => [
          d.department_name,
          d.doctor_count,
          d.total_appointments,
          d.total_revenue,
        ].join(',')),
      ];
    } else if (type === 'monthly') {
      rows = [
        ['Day', 'Appointments', 'Completed'].join(','),
        ...(monthly?.dailyStats || []).map((d) => [d.day, d.appointments, d.completed].join(',')),
      ];
    } else {
      rows = [
        ['Metric', 'Value'].join(','),
        ['Total Appointments', String(daily?.appointments?.total || 0)].join(','),
        ['Completed', String(daily?.appointments?.completed || 0)].join(','),
        ['Pending', String(daily?.appointments?.pending || 0)].join(','),
        ['Cancelled', String(daily?.appointments?.cancelled || 0)].join(','),
        ['Revenue', String(daily?.revenue || 0)].join(','),
      ];
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type || 'report'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const title =
    type === 'daily' ? 'Daily Reports' :
    type === 'monthly' ? 'Monthly Reports' :
    type === 'doctor-revenue' ? 'Doctor-wise Revenue' :
    type === 'department-revenue' ? 'Department-wise Revenue' :
    'Reports';

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">Comprehensive analytics and insights</p>
          </div>
          <div className="flex items-center gap-2">
            {type === 'daily' && (
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-[180px]" />
            )}
            {type === 'monthly' && (
              <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-[180px]" />
            )}
            <Button variant="outline" className="gap-2" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {loading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
        ) : (
          <>
            {type === 'daily' && daily && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Summary</CardTitle>
                    <CardDescription>{daily.date ? format(new Date(daily.date), 'PPP') : 'Selected date'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>Total Appointments: <strong>{daily.appointments?.total || 0}</strong></div>
                      <div>Completed: <strong>{daily.appointments?.completed || 0}</strong></div>
                      <div>Pending: <strong>{daily.appointments?.pending || 0}</strong></div>
                      <div>Cancelled: <strong>{daily.appointments?.cancelled || 0}</strong></div>
                      <div>Revenue: <strong>₹{Number(daily.revenue || 0).toLocaleString()}</strong></div>
                      <div>New Patients: <strong>{daily.newPatients || 0}</strong></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Status Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="key" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {type === 'monthly' && monthly && (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trend</CardTitle>
                  <CardDescription>Appointments vs completed by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" fontSize={11} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#3B82F6" />
                        <Bar dataKey="completed" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {type === 'doctor-revenue' && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Revenue by Doctor</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[380px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={doctorChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
                          <YAxis type="category" dataKey="name" width={140} fontSize={11} />
                          <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                          <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Doctor Table</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>Doctor</TableHead><TableHead>Appointments</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {doctorRows.map((d) => (
                          <TableRow key={d.doctor_id}>
                            <TableCell>{d.doctor_name}</TableCell>
                            <TableCell>{d.total_appointments}</TableCell>
                            <TableCell>₹{Number(d.total_revenue).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {type === 'department-revenue' && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Department Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[360px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={departmentChartData} cx="50%" cy="50%" outerRadius={120} dataKey="revenue" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {departmentChartData.map((entry, index) => <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Department Table</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>Department</TableHead><TableHead>Doctors</TableHead><TableHead>Appointments</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {departmentRows.map((d) => (
                          <TableRow key={d.department_id}>
                            <TableCell>{d.department_name}</TableCell>
                            <TableCell>{d.doctor_count}</TableCell>
                            <TableCell>{d.total_appointments}</TableCell>
                            <TableCell>₹{Number(d.total_revenue).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </ConsoleShell>
  );
}
