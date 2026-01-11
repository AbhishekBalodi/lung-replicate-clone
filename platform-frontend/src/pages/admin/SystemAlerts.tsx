import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle, Info, XCircle, Clock } from "lucide-react";
import { useState } from "react";

const alerts = [
  { id: 1, type: "critical", title: "Server CPU High", message: "Server CPU usage exceeded 90%", time: "5 min ago", read: false },
  { id: 2, type: "warning", title: "Low Disk Space", message: "Database disk usage at 85%", time: "1 hour ago", read: false },
  { id: 3, type: "info", title: "Backup Complete", message: "Daily backup completed successfully", time: "2 hours ago", read: true },
  { id: 4, type: "success", title: "System Update", message: "Security patches applied successfully", time: "3 hours ago", read: true },
  { id: 5, type: "warning", title: "Failed Login Attempts", message: "5 failed login attempts from IP 203.45.67.89", time: "4 hours ago", read: false },
  { id: 6, type: "info", title: "New User Registered", message: "Dr. Mehta joined as Cardiologist", time: "5 hours ago", read: true },
];

const getAlertConfig = (type: string) => {
  const configs: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
    critical: { icon: <XCircle className="h-5 w-5 text-red-500" />, bg: "bg-red-50", border: "border-red-200" },
    warning: { icon: <AlertTriangle className="h-5 w-5 text-orange-500" />, bg: "bg-orange-50", border: "border-orange-200" },
    info: { icon: <Info className="h-5 w-5 text-blue-500" />, bg: "bg-blue-50", border: "border-blue-200" },
    success: { icon: <CheckCircle className="h-5 w-5 text-green-500" />, bg: "bg-green-50", border: "border-green-200" },
  };
  return configs[type] || configs.info;
};

export default function SystemAlerts() {
  const [alertList, setAlertList] = useState(alerts);
  const unreadCount = alertList.filter(a => !a.read).length;

  const markAsRead = (id: number) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = () => {
    setAlertList(prev => prev.map(a => ({ ...a, read: true })));
  };

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
            <p className="text-gray-600">Monitor system health and notifications</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="destructive">{unreadCount} unread</Badge>
            <Button variant="outline" onClick={markAllRead}>Mark All Read</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><XCircle className="h-6 w-6 text-red-500" /><div><p className="text-2xl font-bold">{alertList.filter(a => a.type === "critical").length}</p><p className="text-sm text-gray-600">Critical</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-orange-500" /><div><p className="text-2xl font-bold">{alertList.filter(a => a.type === "warning").length}</p><p className="text-sm text-gray-600">Warnings</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><Info className="h-6 w-6 text-blue-500" /><div><p className="text-2xl font-bold">{alertList.filter(a => a.type === "info").length}</p><p className="text-sm text-gray-600">Info</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-500" /><div><p className="text-2xl font-bold">{alertList.filter(a => a.type === "success").length}</p><p className="text-sm text-gray-600">Success</p></div></CardContent></Card>
        </div>

        <div className="space-y-3">
          {alertList.map((alert) => {
            const config = getAlertConfig(alert.type);
            return (
              <Card key={alert.id} className={`${config.bg} border ${config.border} ${!alert.read ? "ring-2 ring-offset-1 ring-gray-300" : ""}`}>
                <CardContent className="p-4 flex items-start gap-4">
                  {config.icon}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />{alert.time}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  </div>
                  {!alert.read && <Button size="sm" variant="ghost" onClick={() => markAsRead(alert.id)}>Dismiss</Button>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ConsoleShell>
  );
}
