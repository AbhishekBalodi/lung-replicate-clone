import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Calendar, Users, Settings, Save } from "lucide-react";
import { useState } from "react";

export default function AppointmentRules() {
  const [settings, setSettings] = useState({
    slotDuration: 15,
    maxDailyAppointments: 50,
    advanceBookingDays: 30,
    bufferBetweenAppointments: 5,
    allowSameDay: true,
    allowWalkIns: true,
    autoConfirm: false,
    sendReminders: true,
    reminderHoursBefore: 24,
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    lunchBreakStart: "13:00",
    lunchBreakEnd: "14:00",
  });

  const handleSave = () => {
    console.log("Saving settings:", settings);
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointment Rules</h1>
            <p className="text-slate-600">Configure appointment booking rules and settings</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" /> Time Settings
              </CardTitle>
              <CardDescription>Configure appointment duration and timing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slot Duration (minutes)</Label>
                  <Input 
                    type="number" 
                    value={settings.slotDuration}
                    onChange={(e) => setSettings({...settings, slotDuration: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Buffer Between Appointments (min)</Label>
                  <Input 
                    type="number" 
                    value={settings.bufferBetweenAppointments}
                    onChange={(e) => setSettings({...settings, bufferBetweenAppointments: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Working Hours Start</Label>
                  <Input 
                    type="time" 
                    value={settings.workingHoursStart}
                    onChange={(e) => setSettings({...settings, workingHoursStart: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Working Hours End</Label>
                  <Input 
                    type="time" 
                    value={settings.workingHoursEnd}
                    onChange={(e) => setSettings({...settings, workingHoursEnd: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lunch Break Start</Label>
                  <Input 
                    type="time" 
                    value={settings.lunchBreakStart}
                    onChange={(e) => setSettings({...settings, lunchBreakStart: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lunch Break End</Label>
                  <Input 
                    type="time" 
                    value={settings.lunchBreakEnd}
                    onChange={(e) => setSettings({...settings, lunchBreakEnd: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Booking Settings
              </CardTitle>
              <CardDescription>Configure booking limits and advance booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Daily Appointments</Label>
                  <Input 
                    type="number" 
                    value={settings.maxDailyAppointments}
                    onChange={(e) => setSettings({...settings, maxDailyAppointments: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Advance Booking (days)</Label>
                  <Input 
                    type="number" 
                    value={settings.advanceBookingDays}
                    onChange={(e) => setSettings({...settings, advanceBookingDays: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reminder Hours Before</Label>
                <Input 
                  type="number" 
                  value={settings.reminderHoursBefore}
                  onChange={(e) => setSettings({...settings, reminderHoursBefore: parseInt(e.target.value)})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Toggle Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" /> Feature Toggles
              </CardTitle>
              <CardDescription>Enable or disable appointment features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Same Day Booking</p>
                    <p className="text-sm text-slate-600">Allow patients to book same-day appointments</p>
                  </div>
                  <Switch 
                    checked={settings.allowSameDay}
                    onCheckedChange={(checked) => setSettings({...settings, allowSameDay: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Walk-ins</p>
                    <p className="text-sm text-slate-600">Allow walk-in appointments</p>
                  </div>
                  <Switch 
                    checked={settings.allowWalkIns}
                    onCheckedChange={(checked) => setSettings({...settings, allowWalkIns: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto Confirm</p>
                    <p className="text-sm text-slate-600">Automatically confirm appointments</p>
                  </div>
                  <Switch 
                    checked={settings.autoConfirm}
                    onCheckedChange={(checked) => setSettings({...settings, autoConfirm: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Send Reminders</p>
                    <p className="text-sm text-slate-600">Send appointment reminders</p>
                  </div>
                  <Switch 
                    checked={settings.sendReminders}
                    onCheckedChange={(checked) => setSettings({...settings, sendReminders: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsoleShell>
  );
}
