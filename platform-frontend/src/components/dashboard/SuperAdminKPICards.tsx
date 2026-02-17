import { Card } from "@/components/ui/card";
import {
  Users,
  Percent,
  DollarSign,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";

interface SuperAdminKPICardsProps {
  totalStaff: number;
  newStaffThisMonth: number;
  occupancyRate: number;
  occupancyChange: number;
  pendingPayments: number;
  pendingPaymentsAmount: number;
  cancelledAppointments: number;
  cancelledChange: number;
  totalRooms?: number;
  occupiedRooms?: number;

  availableStaffToday?: number;
  totalPatients?: number;
  todayPatients?: number;
  totalAppointments?: number;
  todayAppointments?: number;
  weeklyRevenue?: number;
  monthlyRevenue?: number;
  yearlyRevenue?: number;
}

const openInNewTab = (path: string) => {
  window.open(path, '_blank', 'noopener,noreferrer');
};

export default function SuperAdminKPICards({
  totalStaff,
  newStaffThisMonth,
  occupancyRate,
  occupancyChange,
  pendingPayments,
  pendingPaymentsAmount,
  cancelledAppointments,
  cancelledChange,
  totalRooms = 0,
  occupiedRooms = 0,

  availableStaffToday = 0,
  totalPatients = 0,
  todayPatients = 0,
  totalAppointments = 0,
  todayAppointments = 0,
  weeklyRevenue = 0,
  monthlyRevenue = 0,
  yearlyRevenue = 0,
}: SuperAdminKPICardsProps) {

  const [staffFilter, setStaffFilter] = useState<"total" | "today">("total");
  const [patientFilter, setPatientFilter] = useState<"total" | "today">("total");
  const [appointmentFilter, setAppointmentFilter] = useState<"total" | "today">("total");
  const [revenueFilter, setRevenueFilter] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRevenueValue = () => {
    if (revenueFilter === "weekly") return weeklyRevenue;
    if (revenueFilter === "yearly") return yearlyRevenue;
    return monthlyRevenue;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {/* STAFF KPI */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-purple-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Staff</p>
              <span className="text-xs text-purple-500 font-medium">+{newStaffThisMonth} this month</span>
            </div>
          </div>
          <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value as any)} className="text-xs border rounded-md px-2 py-1 bg-background">
            <option value="total">Total</option>
            <option value="today">Available Today</option>
          </select>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold">{staffFilter === "total" ? totalStaff : availableStaffToday}</p>
          <p className="text-sm text-muted-foreground mt-1">{staffFilter === "total" ? "Hospital employees" : "On-duty staff"}</p>
        </div>
        <button onClick={() => openInNewTab("/admin/staffs/list")} className="flex items-center gap-1 text-purple-600 text-sm mt-4 hover:text-purple-700 transition-colors font-medium">
          Manage Staff <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* PATIENTS / OCCUPANCY KPI */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-blue-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Patients / Occupancy</p>
              <span className={`text-xs font-medium flex items-center gap-1 ${occupancyChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {occupancyChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {occupancyChange}%
              </span>
            </div>
          </div>
          <select value={patientFilter} onChange={(e) => setPatientFilter(e.target.value as any)} className="text-xs border rounded-md px-2 py-1 bg-background">
            <option value="total">Total Patients</option>
            <option value="today">Today</option>
          </select>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold">{patientFilter === "total" ? totalPatients : todayPatients}</p>
          <p className="text-sm text-muted-foreground mt-1">{occupiedRooms}/{totalRooms} rooms occupied</p>
        </div>
        <button onClick={() => openInNewTab("/admin/rooms")} className="flex items-center gap-1 text-blue-600 text-sm mt-4 hover:text-blue-700 transition-colors font-medium">
          View Rooms <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* REVENUE KPI */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-amber-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Revenue</p>
              <span className="text-xs text-amber-500 font-medium">{formatCurrency(pendingPaymentsAmount)} pending</span>
            </div>
          </div>
          <select value={revenueFilter} onChange={(e) => setRevenueFilter(e.target.value as any)} className="text-xs border rounded-md px-2 py-1 bg-background">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold">{formatCurrency(getRevenueValue())}</p>
          <p className="text-sm text-muted-foreground mt-1">Revenue summary</p>
        </div>
        <button onClick={() => openInNewTab("/admin/billing")} className="flex items-center gap-1 text-amber-600 text-sm mt-4 hover:text-amber-700 transition-colors font-medium">
          View Invoices <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* APPOINTMENTS KPI */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-red-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Appointments</p>
              <span className={`text-xs font-medium flex items-center gap-1 ${cancelledChange <= 0 ? "text-green-500" : "text-red-500"}`}>
                {cancelledChange}%
              </span>
            </div>
          </div>
          <select value={appointmentFilter} onChange={(e) => setAppointmentFilter(e.target.value as any)} className="text-xs border rounded-md px-2 py-1 bg-background">
            <option value="total">Total</option>
            <option value="today">Today</option>
          </select>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold">{appointmentFilter === "total" ? totalAppointments : todayAppointments}</p>
          <p className="text-sm text-muted-foreground mt-1">{cancelledAppointments} cancelled this month</p>
        </div>
        <button onClick={() => openInNewTab("/appointments")} className="flex items-center gap-1 text-red-600 text-sm mt-4 hover:text-red-700 transition-colors font-medium">
          View Details <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

    </div>
  );
}
