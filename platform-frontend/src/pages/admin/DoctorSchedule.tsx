import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Edit, Trash2, Save, AlertCircle, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast } from "sonner";

interface TimeSlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
}

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

interface ScheduleSettings {
  default_slot_duration: number;
  buffer_time: number;
  booking_window_days: number;
  cancellation_hours: number;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DoctorSchedule() {
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [settings, setSettings] = useState<ScheduleSettings>({
    default_slot_duration: 15,
    buffer_time: 5,
    booking_window_days: 30,
    cancellation_hours: 24
  });
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({ day: "Monday", start_time: "09:00", end_time: "17:00", slot_duration: 15 });
  const [leaveForm, setLeaveForm] = useState({ start_date: "", end_date: "", reason: "" });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [slotsRes, leavesRes, settingsRes] = await Promise.all([
        apiGet("/api/dashboard/schedule/slots"),
        apiGet("/api/dashboard/schedule/leaves"),
        apiGet("/api/dashboard/schedule/settings")
      ]);

      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSchedule(data.slots || []);
      }

      if (leavesRes.ok) {
        const data = await leavesRes.json();
        setLeaves(data.leaves || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching schedule data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSlot = async () => {
    try {
      const res = await apiPost("/api/dashboard/schedule/slots", slotForm);
      if (res.ok) {
        const data = await res.json();
        toast.success("Slot added successfully");
        setIsSlotDialogOpen(false);
        if (data.slot) {
          setSchedule(prev => [...prev, data.slot]);
        } else {
          fetchData();
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add slot");
      }
    } catch (error) {
      toast.error("Failed to add slot");
    }
  };

  const handleAddLeave = async () => {
    if (!leaveForm.start_date || !leaveForm.end_date) {
      toast.error("Start and end dates are required");
      return;
    }
    try {
      const res = await apiPost("/api/dashboard/schedule/leaves", leaveForm);
      if (res.ok) {
        const data = await res.json();
        toast.success("Leave request submitted");
        setIsLeaveDialogOpen(false);
        setLeaveForm({ start_date: "", end_date: "", reason: "" });
        if (data.leave) {
          setLeaves(prev => [...prev, data.leave]);
        } else {
          fetchData();
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit leave");
      }
    } catch (error) {
      toast.error("Failed to submit leave request");
    }
  };

  const toggleSlotActive = async (id: number) => {
    try {
      const res = await apiPut(`/api/dashboard/schedule/slots/${id}/toggle`, {});
      if (res.ok) {
        setSchedule(prev => prev.map(slot =>
          slot.id === id ? { ...slot, is_active: !slot.is_active } : slot
        ));
      }
    } catch (error) {
      toast.error("Failed to toggle slot");
    }
  };

  const deleteSlot = async (id: number) => {
    if (!confirm("Delete this time slot?")) return;
    try {
      const res = await apiDelete(`/api/dashboard/schedule/slots/${id}`);
      if (res.ok) {
        toast.success("Slot deleted");
        setSchedule(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete slot");
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await apiPost("/api/dashboard/schedule/settings", settings);
      if (res.ok) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const getScheduleByDay = (day: string) => schedule.filter(slot => slot.day === day);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-100 text-emerald-800";
      case "pending": return "bg-amber-100 text-amber-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Schedule & Availability</h1>
            <p className="text-muted-foreground">Manage your clinic hours and availability</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <Label htmlFor="emergency" className="text-sm font-medium text-amber-800">Emergency Override</Label>
              <Switch
                id="emergency"
                checked={emergencyMode}
                onCheckedChange={setEmergencyMode}
              />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="leaves">Leave Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-4">
            {loading ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {daysOfWeek.map((day) => {
                  const daySlots = getScheduleByDay(day);
                  return (
                    <Card key={day}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{day}</CardTitle>
                          <Dialog open={isSlotDialogOpen && slotForm.day === day} onOpenChange={(open) => { setIsSlotDialogOpen(open); if (open) setSlotForm({ ...slotForm, day }); }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSlotForm({ ...slotForm, day })}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Slot
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Time Slot for {slotForm.day}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Start Time</Label>
                                    <Input type="time" value={slotForm.start_time} onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} />
                                  </div>
                                  <div>
                                    <Label>End Time</Label>
                                    <Input type="time" value={slotForm.end_time} onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} />
                                  </div>
                                </div>
                                <div>
                                  <Label>Slot Duration (minutes)</Label>
                                  <Select value={slotForm.slot_duration.toString()} onValueChange={(v) => setSlotForm({ ...slotForm, slot_duration: parseInt(v) })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="10">10 minutes</SelectItem>
                                      <SelectItem value="15">15 minutes</SelectItem>
                                      <SelectItem value="20">20 minutes</SelectItem>
                                      <SelectItem value="30">30 minutes</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button onClick={handleAddSlot} className="w-full">Add Slot</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {daySlots.length > 0 ? (
                          <div className="flex flex-wrap gap-3">
                            {daySlots.map((slot) => (
                              <div
                                key={slot.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  slot.is_active ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className={`h-4 w-4 ${slot.is_active ? 'text-emerald-600' : 'text-gray-400'}`} />
                                  <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {slot.slot_duration} min slots
                                </Badge>
                                <Switch
                                  checked={slot.is_active}
                                  onCheckedChange={() => toggleSlotActive(slot.id)}
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSlot(slot.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground py-2">
                            No slots configured. Click "Add Slot" to set availability.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaves" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>Manage your time off and unavailability</CardDescription>
                  </div>
                  <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Request Leave
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Leave</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input type="date" value={leaveForm.start_date} onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })} />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input type="date" value={leaveForm.end_date} onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <Label>Reason</Label>
                          <Textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Reason for leave..." />
                        </div>
                        <Button onClick={handleAddLeave} className="w-full">Submit Request</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaves.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No leave requests</p>
                  ) : (
                    leaves.map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {new Date(leave.start_date).toLocaleDateString()} 
                              {leave.start_date !== leave.end_date && ` - ${new Date(leave.end_date).toLocaleDateString()}`}
                            </div>
                            <div className="text-sm text-muted-foreground">{leave.reason}</div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(leave.status)}>
                          {leave.status === "approved" && <Check className="h-3 w-3 mr-1" />}
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Slot Duration</CardTitle>
                  <CardDescription>Default duration for appointment slots</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={settings.default_slot_duration.toString()} onValueChange={(v) => setSettings({ ...settings, default_slot_duration: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Buffer Time</CardTitle>
                  <CardDescription>Time between consecutive appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={settings.buffer_time.toString()} onValueChange={(v) => setSettings({ ...settings, buffer_time: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Window</CardTitle>
                  <CardDescription>How far in advance can patients book</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={settings.booking_window_days.toString()} onValueChange={(v) => setSettings({ ...settings, booking_window_days: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                      <SelectItem value="60">2 months</SelectItem>
                      <SelectItem value="90">3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Policy</CardTitle>
                  <CardDescription>Minimum notice for cancellations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={settings.cancellation_hours.toString()} onValueChange={(v) => setSettings({ ...settings, cancellation_hours: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No restriction</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
