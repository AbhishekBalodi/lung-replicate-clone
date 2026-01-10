import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, Mail, MessageSquare, Smartphone, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    email_appointments: true,
    email_billing: true,
    email_reports: false,
    sms_appointments: true,
    sms_emergency: true,
    push_all: true,
    push_critical: true,
    daily_digest: false,
    weekly_report: true,
  });

  const handleSave = () => {
    toast.success("Notification settings saved");
  };

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600">Configure how you receive alerts and updates</p>
          </div>
          <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Email Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Appointment Reminders</Label><Switch checked={settings.email_appointments} onCheckedChange={(c) => setSettings({...settings, email_appointments: c})} /></div>
              <div className="flex items-center justify-between"><Label>Billing Alerts</Label><Switch checked={settings.email_billing} onCheckedChange={(c) => setSettings({...settings, email_billing: c})} /></div>
              <div className="flex items-center justify-between"><Label>Daily Reports</Label><Switch checked={settings.email_reports} onCheckedChange={(c) => setSettings({...settings, email_reports: c})} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />SMS Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Appointment Confirmations</Label><Switch checked={settings.sms_appointments} onCheckedChange={(c) => setSettings({...settings, sms_appointments: c})} /></div>
              <div className="flex items-center justify-between"><Label>Emergency Alerts</Label><Switch checked={settings.sms_emergency} onCheckedChange={(c) => setSettings({...settings, sms_emergency: c})} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Push Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>All Notifications</Label><Switch checked={settings.push_all} onCheckedChange={(c) => setSettings({...settings, push_all: c})} /></div>
              <div className="flex items-center justify-between"><Label>Critical Only</Label><Switch checked={settings.push_critical} onCheckedChange={(c) => setSettings({...settings, push_critical: c})} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Reports & Digest</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Daily Digest</Label><Switch checked={settings.daily_digest} onCheckedChange={(c) => setSettings({...settings, daily_digest: c})} /></div>
              <div className="flex items-center justify-between"><Label>Weekly Report</Label><Switch checked={settings.weekly_report} onCheckedChange={(c) => setSettings({...settings, weekly_report: c})} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ConsoleShell>
  );
}
