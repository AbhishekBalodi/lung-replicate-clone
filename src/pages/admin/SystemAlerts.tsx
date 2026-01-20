import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, AlertTriangle, CheckCircle, Info, XCircle, Clock, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";

interface Alert {
  id: number;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Summary {
  critical: number;
  warning: number;
  info: number;
  success: number;
}

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<Summary>({ critical: 0, warning: 0, info: 0, success: 0 });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "info" as Alert["type"],
    title: "",
    message: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, alertsRes] = await Promise.all([
        apiGet("/api/dashboard/system-alerts/summary"),
        apiGet("/api/dashboard/system-alerts")
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddAlert = async () => {
    if (!formData.title || !formData.message) {
      toast.error("Title and message are required");
      return;
    }
    try {
      const res = await apiPost("/api/dashboard/system-alerts", formData);
      if (res.ok) {
        const data = await res.json();
        toast.success("Alert created");
        setIsDialogOpen(false);
        setFormData({ type: "info", title: "", message: "" });
        if (data.alert) {
          setAlerts(prev => [data.alert, ...prev]);
        } else {
          fetchData();
        }
      } else {
        toast.error("Failed to create alert");
      }
    } catch (error) {
      toast.error("Failed to create alert");
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiPut(`/api/dashboard/system-alerts/${id}/dismiss`, {});
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (error) {
      toast.error("Failed to dismiss alert");
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(alerts.filter(a => !a.is_read).map(a => apiPut(`/api/dashboard/system-alerts/${a.id}/dismiss`, {})));
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
      toast.success("All alerts dismissed");
    } catch (error) {
      toast.error("Failed to dismiss all alerts");
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Alerts</h1>
            <p className="text-muted-foreground">Monitor system health and notifications</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="destructive">{unreadCount} unread</Badge>
            <Button variant="outline" onClick={markAllRead}>Mark All Read</Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create System Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Alert title" />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Alert message..." />
                  </div>
                  <Button onClick={handleAddAlert} className="w-full">Create Alert</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{summary.critical}</p>
                    <p className="text-sm text-muted-foreground">Critical</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{summary.warning}</p>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Info className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{summary.info}</p>
                    <p className="text-sm text-muted-foreground">Info</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{summary.success}</p>
                    <p className="text-sm text-muted-foreground">Success</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No system alerts</p>
                  </CardContent>
                </Card>
              ) : (
                alerts.map((alert) => {
                  const config = getAlertConfig(alert.type);
                  return (
                    <Card key={alert.id} className={`${config.bg} border ${config.border} ${!alert.is_read ? "ring-2 ring-offset-1 ring-gray-300" : ""}`}>
                      <CardContent className="p-4 flex items-start gap-4">
                        {config.icon}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(alert.created_at).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        </div>
                        {!alert.is_read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(alert.id)}>
                            Dismiss
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </ConsoleShell>
  );
}
