import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Edit, Trash2, Save, AlertCircle, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeSlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const mockSchedule: TimeSlot[] = [
  { id: 1, day: "Monday", startTime: "09:00", endTime: "13:00", slotDuration: 15, isActive: true },
  { id: 2, day: "Monday", startTime: "17:00", endTime: "20:00", slotDuration: 15, isActive: true },
  { id: 3, day: "Tuesday", startTime: "09:00", endTime: "13:00", slotDuration: 15, isActive: true },
  { id: 4, day: "Wednesday", startTime: "09:00", endTime: "13:00", slotDuration: 15, isActive: true },
  { id: 5, day: "Thursday", startTime: "09:00", endTime: "13:00", slotDuration: 15, isActive: true },
  { id: 6, day: "Friday", startTime: "09:00", endTime: "13:00", slotDuration: 15, isActive: true },
  { id: 7, day: "Saturday", startTime: "10:00", endTime: "14:00", slotDuration: 20, isActive: true },
  { id: 8, day: "Sunday", startTime: "10:00", endTime: "12:00", slotDuration: 20, isActive: false },
];

const mockLeaves: LeaveRequest[] = [
  { id: 1, startDate: "2026-01-20", endDate: "2026-01-22", reason: "Personal leave", status: "approved" },
  { id: 2, startDate: "2026-02-14", endDate: "2026-02-14", reason: "Conference", status: "pending" },
];

export default function DoctorSchedule() {
  const [schedule, setSchedule] = useState<TimeSlot[]>(mockSchedule);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [defaultSlotDuration, setDefaultSlotDuration] = useState("15");

  const toggleSlotActive = (id: number) => {
    setSchedule(schedule.map(slot =>
      slot.id === id ? { ...slot, isActive: !slot.isActive } : slot
    ));
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
            <Button className="bg-emerald-600 hover:bg-emerald-700">
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
            <div className="grid gap-4">
              {daysOfWeek.map((day) => {
                const daySlots = getScheduleByDay(day);
                return (
                  <Card key={day}>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{day}</CardTitle>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Slot
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {daySlots.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {daySlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                slot.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Clock className={`h-4 w-4 ${slot.isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {slot.slotDuration} min slots
                              </Badge>
                              <Switch
                                checked={slot.isActive}
                                onCheckedChange={() => toggleSlotActive(slot.id)}
                              />
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
          </TabsContent>

          <TabsContent value="leaves" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>Manage your time off and unavailability</CardDescription>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Leave
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {new Date(leave.startDate).toLocaleDateString()} 
                            {leave.startDate !== leave.endDate && ` - ${new Date(leave.endDate).toLocaleDateString()}`}
                          </div>
                          <div className="text-sm text-muted-foreground">{leave.reason}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(leave.status)}>
                          {leave.status === "approved" && <Check className="h-3 w-3 mr-1" />}
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </Badge>
                        {leave.status === "pending" && (
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
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
                  <Select value={defaultSlotDuration} onValueChange={setDefaultSlotDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Select defaultValue="24">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
