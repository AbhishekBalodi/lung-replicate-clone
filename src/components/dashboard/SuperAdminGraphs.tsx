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
import {
  format,
  parseISO,
  startOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";

/* =========================
   TYPES
========================= */

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

/* =========================
   ✅ BACKEND CHART SUPPORT (NEW)
========================= */

interface BackendChartsData {
  revenueByMonth?: { month: string; revenue: number }[];
  appointmentsByMonth?: { month: string; count: number }[];
}

interface SuperAdminGraphsProps {
  appointments: Appointment[];
  patients: Patient[];
  invoices: Invoice[];
  doctors: Doctor[];
  backendCharts?: BackendChartsData; // ✅ OPTIONAL
}

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
];

export default function SuperAdminGraphs({
  appointments,
  patients,
  invoices,
  doctors,
  backendCharts, // ✅ NEW
}: SuperAdminGraphsProps) {
  const [activeTab, setActiveTab] = useState("revenue");

  /* ============================================================
     FRONTEND CALCULATED DATA (UNCHANGED)
  ============================================================ */

  const revenueData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      );

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

      const total = monthInvoices.reduce(
        (sum, inv) => sum + (inv.total_amount || inv.total || 0),
        0
      );

      months.push({
        month: format(monthDate, "MMM"),
        revenue: total,
      });
    }
    return months;
  }, [invoices]);

  const appointmentsData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      );

      const monthAppointments = appointments.filter((apt) => {
        if (!apt.appointment_date) return false;
        try {
          const date = parseISO(apt.appointment_date);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      });

      months.push({
        month: format(monthDate, "MMM"),
        total: monthAppointments.length,
      });
    }
    return months;
  }, [appointments]);

  /* ============================================================
     ✅ BACKEND DATA NORMALIZATION (NEW)
  ============================================================ */

  const backendRevenueData = useMemo(() => {
    if (!backendCharts?.revenueByMonth) return [];

    return backendCharts.revenueByMonth.map((r) => ({
      month: format(parseISO(`${r.month}-01`), "MMM"),
      revenue: r.revenue,
    }));
  }, [backendCharts]);

  const backendAppointmentsData = useMemo(() => {
    if (!backendCharts?.appointmentsByMonth) return [];

    return backendCharts.appointmentsByMonth.map((a) => ({
      month: format(parseISO(`${a.month}-01`), "MMM"),
      total: a.count,
    }));
  }, [backendCharts]);

  /* ============================================================
     ✅ FINAL DATA (AUTO FALLBACK)
  ============================================================ */

  const finalRevenueData =
    backendRevenueData.length > 0 ? backendRevenueData : revenueData;

  const finalAppointmentsData =
    backendAppointmentsData.length > 0
      ? backendAppointmentsData
      : appointmentsData;

  /* ============================================================
     UI (UNCHANGED)
  ============================================================ */

  return (
    <Card className="bg-emerald-800/90 border-emerald-700 text-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Hospital Performance Metrics
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-emerald-900/50 border border-emerald-600">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-[350px]">
          {activeTab === "revenue" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalRevenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area dataKey="revenue" stroke="#10B981" fill="#10B981" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeTab === "appointments" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalAppointmentsData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
