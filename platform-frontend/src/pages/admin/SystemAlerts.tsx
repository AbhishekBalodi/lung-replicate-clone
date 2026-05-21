import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, AlertTriangle, CheckCircle, Info, XCircle, Clock, Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type AlertItem = {
  id: number;
  title: string;
  message: string;
  alert_type: "critical" | "warning" | "info" | "success" | "error";
  priority: "low" | "normal" | "high" | "critical";
  status: "active" | "dismissed" | "expired";
  created_at?: string;
};

const getAlertConfig = (type: string) => {
  const configs: Record<string, { icon: JSX.Element; bg: string; border: string }> = {
    critical: { icon: <XCircle className="h-5 w-5 text-red-500" />, bg: "bg-red-50", border: "border-red-200" },
    error: { icon: <XCircle className="h-5 w-5 text-red-500" />, bg: "bg-red-50", border: "border-red-200" },
    warning: { icon: <AlertTriangle className="h-5 w-5 text-orange-500" />, bg: "bg-orange-50", border: "border-orange-200" },
    info: { icon: <Info className="h-5 w-5 text-blue-500" />, bg: "bg-blue-50", border: "border-blue-200" },
    success: { icon: <CheckCircle className="h-5 w-5 text-green-500" />, bg: "bg-green-50", border: "border-green-200" },
  };
  return configs[type] || configs.info;
};

export default function SystemAlerts() {
  const [alertList, setAlertList] = useState<AlertItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, critical: 0, active: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: "",
    message: "",
    alert_type: "warning",
    priority: "normal",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, listRes] = await Promise.all([
        apiGet("/api/dashboard/system-alerts/summary"),
        apiGet(`/api/dashboard/system-alerts?type=${typeFilter}&status=active&search=${encodeURIComponent(search)}`),
      ]);
      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary({
          total: data.total || 0,
          critical: data.critical || 0,
          active: data.active || 0,
          today: data.today || 0,
        });
      }
      if (listRes.ok) {
        const data = await listRes.json();
        setAlertList(data.alerts || []);
      }
    } catch (err) {
      toast.error("Failed to load system alerts");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dismissAlert = async (id: number) => {
    try {
      const res = await apiPut(`/api/dashboard/system-alerts/${id}/dismiss`, {});
      if (!res.ok) throw new Error();
      setAlertList((prev) => prev.filter((a) => a.id !== id));
      fetchData();
    } catch {
      toast.error("Failed to dismiss alert");
    }
  };

  const createAlert = async () => {
    if (!newAlert.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      const res = await apiPost("/api/dashboard/system-alerts", newAlert);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      toast.success("Alert created");
      setCreateOpen(false);
      setNewAlert({ title: "", message: "", alert_type: "warning", priority: "normal" });
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to create alert");
    }
  };

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
            <p className="text-gray-600">Monitor system health and notifications</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">{summary.active} active</Badge>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" /> New Alert</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create System Alert</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label>Title</Label>
                    <Input value={newAlert.title} onChange={(e) => setNewAlert((p) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Input value={newAlert.message} onChange={(e) => setNewAlert((p) => ({ ...p, message: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Type</Label>
                      <Select value={newAlert.alert_type} onValueChange={(v) => setNewAlert((p) => ({ ...p, alert_type: v }))}>
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
                      <Label>Priority</Label>
                      <Select value={newAlert.priority} onValueChange={(v) => setNewAlert((p) => ({ ...p, priority: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full" onClick={createAlert}>Create Alert</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><Bell className="h-6 w-6 text-slate-500" /><div><p className="text-2xl font-bold">{summary.total}</p><p className="text-sm text-gray-600">Total</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><XCircle className="h-6 w-6 text-red-500" /><div><p className="text-2xl font-bold">{summary.critical}</p><p className="text-sm text-gray-600">Critical</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-orange-500" /><div><p className="text-2xl font-bold">{summary.active}</p><p className="text-sm text-gray-600">Active</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><Clock className="h-6 w-6 text-blue-500" /><div><p className="text-2xl font-bold">{summary.today}</p><p className="text-sm text-gray-600">Today</p></div></CardContent></Card>
        </div>

        <div className="flex gap-3">
          <Input placeholder="Search alerts..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData}>Refresh</Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <Card><CardContent className="p-8 text-center text-slate-500">Loading alerts...</CardContent></Card>
          ) : alertList.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-slate-500">No alerts found</CardContent></Card>
          ) : (
            alertList.map((alert) => {
              const config = getAlertConfig(alert.alert_type);
              return (
                <Card key={alert.id} className={`${config.bg} border ${config.border}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    {config.icon}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {alert.created_at ? new Date(alert.created_at).toLocaleString() : "-"}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)}>Dismiss</Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ConsoleShell>
  );
}
