import { Card } from "@/components/ui/card";
import { Users, Percent, DollarSign, XCircle, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
}

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
}: SuperAdminKPICardsProps) {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Staff Card */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-purple-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Total Staff</p>
              <span className="text-xs text-purple-500 font-medium">
                +{newStaffThisMonth} this month
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">{totalStaff}</p>
          <p className="text-sm text-muted-foreground mt-1">Hospital employees</p>
        </div>
        <button 
          onClick={() => navigate("/admin/staff")}
          className="flex items-center gap-1 text-purple-600 text-sm mt-4 hover:text-purple-700 transition-colors font-medium"
        >
          Manage Staff
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Occupancy Rate Card */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-blue-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Occupancy Rate</p>
              <span className={`text-xs font-medium flex items-center gap-1 ${occupancyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {occupancyChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {occupancyChange >= 0 ? '+' : ''}{occupancyChange}% vs last week
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">{occupancyRate}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            {occupiedRooms}/{totalRooms} rooms occupied
          </p>
        </div>
        <button 
          onClick={() => navigate("/admin/rooms")}
          className="flex items-center gap-1 text-blue-600 text-sm mt-4 hover:text-blue-700 transition-colors font-medium"
        >
          View Rooms
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Pending Payments Card */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-amber-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Pending Payments</p>
              <span className="text-xs text-amber-500 font-medium">
                {formatCurrency(pendingPaymentsAmount)} outstanding
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">{pendingPayments}</p>
          <p className="text-sm text-muted-foreground mt-1">Invoices awaiting payment</p>
        </div>
        <button 
          onClick={() => navigate("/admin/invoices")}
          className="flex items-center gap-1 text-amber-600 text-sm mt-4 hover:text-amber-700 transition-colors font-medium"
        >
          View Invoices
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>

      {/* Cancelled Appointments Card */}
      <Card className="relative overflow-hidden bg-card border-l-4 border-l-red-500 border-t border-r border-b p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Cancelled</p>
              <span className={`text-xs font-medium flex items-center gap-1 ${cancelledChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {cancelledChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {cancelledChange >= 0 ? '+' : ''}{cancelledChange}% vs last month
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">{cancelledAppointments}</p>
          <p className="text-sm text-muted-foreground mt-1">Appointments this month</p>
        </div>
        <button 
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-1 text-red-600 text-sm mt-4 hover:text-red-700 transition-colors font-medium"
        >
          View Details
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </Card>
    </div>
  );
}
