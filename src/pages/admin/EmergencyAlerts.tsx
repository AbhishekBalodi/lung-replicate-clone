import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, User, Clock, Phone, CheckCircle2, XCircle, Siren, Activity, ThermometerSun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Alert {
  id: number;
  type: "critical-lab" | "emergency-patient" | "code-blue" | "vital-alert";
  title: string;
  description: string;
  patient?: string;
  time: string;
  severity: "critical" | "high" | "medium";
  acknowledged: boolean;
}

const mockAlerts: Alert[] = [
  { id: 1, type: "critical-lab", title: "Critical Lab Value", description: "Potassium level 6.5 mEq/L (Critical High)", patient: "Amit Kumar", time: "5 min ago", severity: "critical", acknowledged: false },
  { id: 2, type: "emergency-patient", title: "Emergency Patient", description: "Chest pain and shortness of breath - arrived at ER", patient: "Unknown", time: "12 min ago", severity: "critical", acknowledged: false },
  { id: 3, type: "vital-alert", title: "Abnormal Vital Signs", description: "BP 180/110, Heart rate 120 bpm", patient: "Priya Patel", time: "25 min ago", severity: "high", acknowledged: true },
  { id: 4, type: "critical-lab", title: "Low Hemoglobin", description: "Hb 6.2 g/dL - Blood transfusion may be required", patient: "Rahul Sharma", time: "1 hour ago", severity: "high", acknowledged: true },
];

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [filter, setFilter] = useState<"all" | "unacknowledged">("all");

  const acknowledgeAlert = (id: number) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
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

  const criticalCount = alerts.filter(a => a.severity === "critical" && !a.acknowledged).length;
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Emergency & Alerts</h1>
            <p className="text-muted-foreground">Critical notifications and patient emergencies</p>
          </div>
          <div className="flex gap-2">
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
              <Switch
                id="notifications"
                checked={enableNotifications}
                onCheckedChange={setEnableNotifications}
              />
              <Label htmlFor="notifications">Push Notifications</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="sound"
                checked={soundAlerts}
                onCheckedChange={setSoundAlerts}
              />
              <Label htmlFor="sound">Sound Alerts</Label>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-emerald-600" : ""}
          >
            All Alerts ({alerts.length})
          </Button>
          <Button
            variant={filter === "unacknowledged" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unacknowledged")}
            className={filter === "unacknowledged" ? "bg-emerald-600" : ""}
          >
            Unacknowledged ({unacknowledgedCount})
          </Button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`transition-all ${getCardBgColor(alert.severity, alert.acknowledged)} ${
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
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="outline" className="bg-gray-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {alert.patient && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {alert.patient}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
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
          ))}

          {filteredAlerts.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No pending alerts at this time</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ConsoleShell>
  );
}
