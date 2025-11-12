import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { ConsoleShell } from "@/layouts/ConsoleShell";
import { Calendar as CalendarIcon, Clock, Mail, Phone, User, Activity } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    email: string;
    phone: string;
    doctor: string;
    message: string;
    status: string;
    time: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  done: number;
  rescheduled: number;
  today: number;
}

interface Doctor {
  name: string;
  appointment_count: number;
  pending_count: number;
}

export default function Calendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchCalendarData();
    fetchStats();
    fetchDoctors();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const response = await fetch("/api/calendar");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/calendar/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/calendar/doctors");
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: "Scheduled", className: "bg-green-500 hover:bg-green-600" },
      rescheduled: { label: "Rescheduled", className: "bg-blue-500 hover:bg-blue-600" },
      done: { label: "Completed", className: "bg-red-500 hover:bg-red-600" },
    };

    const variant = variants[status] || { label: status, className: "bg-gray-500" };
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <ConsoleShell>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">Loading calendar...</div>
        </div>
      </ConsoleShell>
    );
  }

  return (
    <ConsoleShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-8 w-8" />
            Appointment Calendar
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all appointments in calendar format
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">{stats.today}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
            <Card className="p-4 bg-green-500/10 border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400">Scheduled</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.pending}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">Rescheduled</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.rescheduled}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-red-500/10 border-red-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400">Completed</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.done}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar View */}
          <Card className="lg:col-span-3 p-6">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              slotMinTime="09:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={false}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              nowIndicator={true}
              slotDuration="01:00:00"
              businessHours={[
                {
                  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                  startTime: "10:00",
                  endTime: "15:00",
                },
                {
                  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                  startTime: "17:00",
                  endTime: "20:00",
                },
              ]}
              eventContent={(eventInfo) => {
                return (
                  <div className="p-1 text-xs overflow-hidden">
                    <div className="font-semibold truncate">{eventInfo.event.title}</div>
                    <div className="truncate opacity-90">
                      {eventInfo.event.extendedProps.doctor}
                    </div>
                  </div>
                );
              }}
            />
          </Card>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Selected Event Details */}
            {selectedEvent ? (
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Appointment Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient Name</p>
                    <p className="font-medium">{selectedEvent.title}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    {getStatusBadge(selectedEvent.extendedProps.status)}
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </p>
                    <p className="font-medium">{selectedEvent.extendedProps.time}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Doctor
                    </p>
                    <p className="font-medium">{selectedEvent.extendedProps.doctor}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="font-medium text-sm break-all">{selectedEvent.extendedProps.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </p>
                    <p className="font-medium">{selectedEvent.extendedProps.phone}</p>
                  </div>
                  {selectedEvent.extendedProps.message && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Message</p>
                        <p className="text-sm mt-1">{selectedEvent.extendedProps.message}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground text-center">
                  Click on an appointment to view details
                </p>
              </Card>
            )}

            {/* Doctors List */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Today's Schedule</h3>
              <div className="space-y-3">
                {doctors.map((doctor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doctor.appointment_count} appointments
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                      {doctor.pending_count}
                    </Badge>
                  </div>
                ))}
                {doctors.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No doctors scheduled
                  </p>
                )}
              </div>
            </Card>

            {/* Legend */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Status Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-sm">Rescheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm">Completed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ConsoleShell>
  );
}
