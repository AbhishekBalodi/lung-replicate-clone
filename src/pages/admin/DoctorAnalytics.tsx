import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock, TrendingUp, Star, CheckCircle2, XCircle, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { apiGet } from "@/lib/api";

interface AnalyticsSummary {
  totalPatients: number;
  totalAppointments: number;
  completionRate: number;
  avgConsultationTime: string;
  rating: number;
  totalReviews: number;
  revenue: string;
  newPatients: number;
  todayAppointments: number;
  avgDailyHours: string;
  patientSatisfaction: number;
}

interface MonthlyData {
  month: string;
  patients: number;
  appointments: number;
}

interface AppointmentStatus {
  name: string;
  value: number;
  color: string;
}

interface RatingBreakdown {
  stars: number;
  count: number;
}

export default function DoctorAnalytics() {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalPatients: 0,
    totalAppointments: 0,
    completionRate: 0,
    avgConsultationTime: "0 min",
    rating: 0,
    totalReviews: 0,
    revenue: "₹0",
    newPatients: 0,
    todayAppointments: 0,
    avgDailyHours: "0h",
    patientSatisfaction: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentStatus[]>([]);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, trendsRes, statusRes, ratingsRes] = await Promise.all([
        apiGet(`/api/dashboard/analytics/summary?period=${period}`),
        apiGet(`/api/dashboard/analytics/trends?period=${period}`),
        apiGet("/api/dashboard/analytics/status-distribution"),
        apiGet("/api/dashboard/analytics/ratings")
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary({
          totalPatients: data.totalPatients || 0,
          totalAppointments: data.totalAppointments || 0,
          completionRate: data.completionRate || 0,
          avgConsultationTime: data.avgConsultationTime || "0 min",
          rating: data.rating || 0,
          totalReviews: data.totalReviews || 0,
          revenue: data.revenue || "₹0",
          newPatients: data.newPatients || 0,
          todayAppointments: data.todayAppointments || 0,
          avgDailyHours: data.avgDailyHours || "0h",
          patientSatisfaction: data.patientSatisfaction || 0
        });
      }

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setMonthlyData(data.trends || []);
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setAppointmentTypes(data.distribution || [
          { name: "Completed", value: 0, color: "#10b981" },
          { name: "Cancelled", value: 0, color: "#ef4444" },
          { name: "No-show", value: 0, color: "#f59e0b" },
          { name: "Rescheduled", value: 0, color: "#3b82f6" }
        ]);
      }

      if (ratingsRes.ok) {
        const data = await ratingsRes.json();
        setRatingBreakdown(data.ratings || []);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const completedCount = appointmentTypes.find(a => a.name === "Completed")?.value || 0;
  const cancelledCount = appointmentTypes.find(a => a.name === "Cancelled")?.value || 0;
  const noShowCount = appointmentTypes.find(a => a.name === "No-show")?.value || 0;
  const rescheduledCount = appointmentTypes.find(a => a.name === "Rescheduled")?.value || 0;

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Performance Analytics</h1>
            <p className="text-muted-foreground">Track your practice performance and patient metrics</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Loading analytics...</CardContent></Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{summary.totalPatients}</div>
                      <div className="text-sm text-muted-foreground">Patients Treated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{summary.totalAppointments}</div>
                      <div className="text-sm text-muted-foreground">Appointments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{summary.avgConsultationTime}</div>
                      <div className="text-sm text-muted-foreground">Avg. Consultation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{summary.rating.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">{summary.totalReviews} reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Patients & Appointments Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patients & Appointments Trend</CardTitle>
                  <CardDescription>Monthly overview of patient visits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={2} name="Patients" />
                          <Line type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={2} name="Appointments" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No trend data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Status</CardTitle>
                  <CardDescription>Distribution of appointment outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    {appointmentTypes.some(a => a.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={appointmentTypes}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {appointmentTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No appointment data
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {appointmentTypes.map((type) => (
                      <div key={type.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                        <span className="text-sm">{type.name}: {type.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Completion Rate & Ratings */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Completion Rate</CardTitle>
                  <CardDescription>Percentage of completed vs scheduled appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-emerald-600">{summary.completionRate}%</div>
                    <p className="text-muted-foreground mt-2">Completion Rate</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Completed</span>
                          <span className="text-sm font-medium">{completedCount}</span>
                        </div>
                        <Progress value={summary.totalAppointments > 0 ? (completedCount / summary.totalAppointments) * 100 : 0} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Cancelled/No-show</span>
                          <span className="text-sm font-medium">{cancelledCount + noShowCount}</span>
                        </div>
                        <Progress value={summary.totalAppointments > 0 ? ((cancelledCount + noShowCount) / summary.totalAppointments) * 100 : 0} className="h-2 [&>div]:bg-red-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Rescheduled</span>
                          <span className="text-sm font-medium">{rescheduledCount}</span>
                        </div>
                        <Progress value={summary.totalAppointments > 0 ? (rescheduledCount / summary.totalAppointments) * 100 : 0} className="h-2 [&>div]:bg-blue-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patient Ratings</CardTitle>
                  <CardDescription>Feedback breakdown by star rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl font-bold">{summary.rating.toFixed(1)}</div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${star <= Math.round(summary.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{summary.totalReviews} total reviews</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {ratingBreakdown.length > 0 ? (
                      ratingBreakdown.map((rating) => (
                        <div key={rating.stars} className="flex items-center gap-3">
                          <span className="text-sm w-6">{rating.stars}★</span>
                          <Progress
                            value={summary.totalReviews > 0 ? (rating.count / summary.totalReviews) * 100 : 0}
                            className="flex-1 h-2"
                          />
                          <span className="text-sm text-muted-foreground w-10">{rating.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center">No ratings yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardContent className="p-4">
                  <div className="text-emerald-700">
                    <TrendingUp className="h-8 w-8 mb-2" />
                    <div className="text-2xl font-bold">{summary.newPatients}</div>
                    <div className="text-sm">New Patients</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-blue-700">
                    <Calendar className="h-8 w-8 mb-2" />
                    <div className="text-2xl font-bold">{summary.todayAppointments}</div>
                    <div className="text-sm">Today's Appointments</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="text-purple-700">
                    <Clock className="h-8 w-8 mb-2" />
                    <div className="text-2xl font-bold">{summary.avgDailyHours}</div>
                    <div className="text-sm">Avg. Daily Hours</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="text-amber-700">
                    <Star className="h-8 w-8 mb-2" />
                    <div className="text-2xl font-bold">{summary.patientSatisfaction}%</div>
                    <div className="text-sm">Patient Satisfaction</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ConsoleShell>
  );
}
