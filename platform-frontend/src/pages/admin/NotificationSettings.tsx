import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare, Smartphone, Save } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPut } from "@/lib/api";

type NotificationSetting = {
  id?: number;
  category: string;
  setting_key: string;
  setting_name: string;
  enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
};

const defaultSettings: NotificationSetting[] = [
  { category: "appointments", setting_key: "new_appointment", setting_name: "New Appointment", enabled: true, email_enabled: true, sms_enabled: true, push_enabled: true },
  { category: "appointments", setting_key: "appointment_reminder", setting_name: "Appointment Reminder", enabled: true, email_enabled: true, sms_enabled: true, push_enabled: true },
  { category: "billing", setting_key: "invoice_created", setting_name: "Invoice Created", enabled: true, email_enabled: true, sms_enabled: false, push_enabled: true },
  { category: "billing", setting_key: "payment_received", setting_name: "Payment Received", enabled: true, email_enabled: true, sms_enabled: false, push_enabled: true },
  { category: "lab", setting_key: "results_ready", setting_name: "Lab Results Ready", enabled: true, email_enabled: true, sms_enabled: true, push_enabled: true },
  { category: "system", setting_key: "system_alerts", setting_name: "System Alerts", enabled: true, email_enabled: true, sms_enabled: false, push_enabled: true },
];

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/dashboard/notification-settings");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const serverSettings = data?.settings || [];
      setSettings(serverSettings.length ? serverSettings : defaultSettings);
    } catch {
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateRow = (index: number, key: keyof NotificationSetting, value: boolean) => {
    setSettings((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const withIds = settings.filter((s) => s.id);
      const withoutIds = settings.filter((s) => !s.id);

      for (const setting of withIds) {
        await apiPut(`/api/dashboard/notification-settings/${setting.id}`, {
          enabled: setting.enabled,
          email_enabled: setting.email_enabled,
          sms_enabled: setting.sms_enabled,
          push_enabled: setting.push_enabled,
        });
      }

      if (withoutIds.length) {
        const res = await apiPost("/api/dashboard/notification-settings", { settings: withoutIds });
        if (!res.ok) throw new Error();
      }

      toast.success("Notification settings saved");
      fetchSettings();
    } catch {
      toast.error("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const byCategory = (cat: string) => settings.filter((s) => s.category === cat);

  const renderGroup = (title: string, icon: JSX.Element, rows: NotificationSetting[]) => (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => {
          const idx = settings.findIndex((s) => s.setting_key === row.setting_key && s.category === row.category);
          return (
            <div key={`${row.category}-${row.setting_key}`} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label>{row.setting_name}</Label>
                <Switch checked={row.enabled} onCheckedChange={(v) => updateRow(idx, "enabled", v)} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <label className="flex items-center justify-between gap-2">Email <Switch checked={row.email_enabled} onCheckedChange={(v) => updateRow(idx, "email_enabled", v)} /></label>
                <label className="flex items-center justify-between gap-2">SMS <Switch checked={row.sms_enabled} onCheckedChange={(v) => updateRow(idx, "sms_enabled", v)} /></label>
                <label className="flex items-center justify-between gap-2">Push <Switch checked={row.push_enabled} onCheckedChange={(v) => updateRow(idx, "push_enabled", v)} /></label>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-gray-600">Configure alerts by channel and event type</p>
          </div>
          <Button onClick={handleSave} disabled={saving || loading}><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}</Button>
        </div>

        {loading ? (
          <Card><CardContent className="p-8 text-center text-slate-500">Loading settings...</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderGroup("Appointments", <Bell className="h-5 w-5" />, byCategory("appointments"))}
            {renderGroup("Billing", <Mail className="h-5 w-5" />, byCategory("billing"))}
            {renderGroup("Lab", <Smartphone className="h-5 w-5" />, byCategory("lab"))}
            {renderGroup("System", <MessageSquare className="h-5 w-5" />, byCategory("system"))}
          </div>
        )}
      </div>
    </ConsoleShell>
  );
}
