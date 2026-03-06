import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, User, Clock, Phone, CheckCircle2, XCircle, Siren, Activity, ThermometerSun, Plus, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InstructionBanner from "@/components/InstructionBanner";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";

interface Alert {
  id: number;
  alert_type?: string;
  type?: string;
  title: string;
  message?: string;
  description?: string;
  patient_name?: string;
  patient?: string;
  priority?: string;
  severity?: string;
  status?: string;
  acknowledged?: boolean;
  created_at?: string;
  time?: string;
}

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [filter, setFilter] = useState<"all" | "unacknowledged">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    alert_type: "vital-alert",
    priority: "high",
    patient_name: ""
  });

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/dashboard/system-alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts((data.alerts || []).map((a: Alert) => ({
          ...a,
          type: a.alert_type || a.type || "vital-alert",
          description: a.message || a.description || "",
          patient: a.patient_name || a.patient || "",
          severity: a.priority || a.severity || "medium",
          acknowledged: a.status === "dismissed" || a.acknowledged === true,
          time: a.created_at ? getTimeAgo(a.created_at) : "just now"
        })));
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`;
  };

  const acknowledgeAlert = async (id: number) => {
    try {
      const res = await apiPut(`/api/dashboard/system-alerts/${id}/dismiss`, {});
      if (res.ok) {
        setAlerts(alerts.map(alert =>
          alert.id === id ? { ...alert, acknowledged: true, status: "dismissed" } : alert
        ));
        toast.success("Alert acknowledged");
      }
    } catch {
      // Fallback: update locally
      setAlerts(alerts.map(alert =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      ));
    }
  };

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast.success("Alert dismissed");
  };

  const handleCreateAlert = async () => {
    if (!formData.title || !formData.message) {
      toast.error("Title and message are required");
      return;
    }
    try {
      const res = await apiPost("/api/dashboard/system-alerts", formData);
      if (res.ok) {
        toast.success("Alert created");
        setIsDialogOpen(false);
        setFormData({ title: "", message: "", alert_type: "vital-alert", priority: "high", patient_name: "" });
        fetchAlerts();
      } else {
        toast.error("Failed to create alert");
      }
    } catch {
      toast.error("Failed to create alert");
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical-lab": return <Activity className="h-6 w-6" />;
      case "emergency-patient": return <Siren className="h-6 w-6" />;
      case "code-blue": return <AlertTriangle className="h-6 w-6" />;
      case "vital-alert": return <ThermometerSun className="h-6 w-6" />;
      default: return <Bell className="h-6 w-6" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCardBgColor = (severity: string, acknowledged: boolean) => {
    if (acknowledged) return "bg-gray-50 opacity-75";
    switch (severity) {
      case "critical": return "bg-red-50 border-red-200";
      case "high": return "bg-orange-50 border-orange-200";
      default: return "";
    }
  };

  const filteredAlerts = filter === "all"
    ? alerts
    : alerts.filter(a => !a.acknowledged);

  const criticalCount = alerts.filter(a => (a.severity === "critical" || a.priority === "critical") && !a.acknowledged).length;
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <InstructionBanner
          title="How Emergency & Alerts Work"
          summary="Real-time critical notifications for patient emergencies, abnormal lab results, and vital sign alerts."
          steps={[
            { title: "Create an Alert", description: "Click '+ Create Alert' to manually add a new emergency alert with title, message, type, priority, and optional patient name." },
            { title: "Acknowledge Alerts", description: "Click 'Acknowledge' on any alert to mark it as seen. This tells other staff you're handling it." },
            { title: "Dismiss Alerts", description: "Click 'Dismiss' to remove resolved alerts from the active list." },
            { title: "Configure Settings", description: "Toggle Push Notifications and Sound Alerts on/off using the switches in Alert Settings." },
          ]}
          tips={[
            "Critical alerts pulse red — these need immediate attention.",
            "Use the 'Unacknowledged' filter to see only pending alerts.",
            "Alerts can be manually created or auto-generated by the system.",
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Emergency & Alerts</h1>
            <p className="text-muted-foreground">Critical notifications and patient emergencies</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAlerts}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Emergency Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Alert Title</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Critical Lab Value" />
                  </div>
                  <div>
                    <Label>Message / Description</Label>
                    <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Describe the emergency..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Alert Type</Label>
                      <Select value={formData.alert_type} onValueChange={(v) => setFormData({ ...formData, alert_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical-lab">Critical Lab</SelectItem>
                          <SelectItem value="emergency-patient">Emergency Patient</SelectItem>
                          <SelectItem value="code-blue">Code Blue</SelectItem>
                          <SelectItem value="vital-alert">Vital Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Patient Name (optional)</Label>
                    <Input value={formData.patient_name} onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })} placeholder="Patient name" />
                  </div>
                  <Button onClick={handleCreateAlert} className="w-full bg-red-600 hover:bg-red-700">Create Alert</Button>
                </div>
              </DialogContent>
            </Dialog>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="px-3 py-1 animate-pulse">
                <Siren className="h-4 w-4 mr-1" />
                {criticalCount} Critical
              </Badge>
            )}
            <Badge variant="outline" className="px-3 py-1">
              <Bell className="h-4 w-4 mr-1" />
              {unacknowledgedCount} Pending
            </Badge>
          </div>
        </div>

        {/* Alert Settings */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Alert Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch id="notifications" checked={enableNotifications} onCheckedChange={setEnableNotifications} />
              <Label htmlFor="notifications">Push Notifications</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sound" checked={soundAlerts} onCheckedChange={setSoundAlerts} />
              <Label htmlFor="sound">Sound Alerts</Label>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All Alerts ({alerts.length})
          </Button>
          <Button variant={filter === "unacknowledged" ? "default" : "outline"} size="sm" onClick={() => setFilter("unacknowledged")}>
            Unacknowledged ({unacknowledgedCount})
          </Button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {loading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading alerts...</CardContent></Card>
          ) : filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No pending alerts at this time. Click "Create Alert" to add one manually.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`transition-all ${getCardBgColor(alert.severity || "medium", !!alert.acknowledged)} ${
                  !alert.acknowledged && alert.severity === "critical" ? "animate-pulse" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                      alert.severity === "critical" ? "bg-red-100 text-red-600" :
                      alert.severity === "high" ? "bg-orange-100 text-orange-600" :
                      "bg-yellow-100 text-yellow-600"
                    }`}>
                      {getAlertIcon(alert.type || alert.alert_type || "vital-alert")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge className={getSeverityColor(alert.severity || "medium")}>
                          {(alert.severity || "medium").toUpperCase()}
                        </Badge>
                        {alert.acknowledged && (
                          <Badge variant="outline" className="bg-gray-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Acknowledged
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description || alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {alert.patient && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {alert.patient}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {alert.time || "just now"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!alert.acknowledged && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => acknowledgeAlert(alert.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => dismissAlert(alert.id)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      {alert.patient && (
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </ConsoleShell>
  );
}
