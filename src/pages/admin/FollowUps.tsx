import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, User, Phone, Mail, Bell, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FollowUp {
  id: number;
  patientName: string;
  phone: string;
  email: string;
  followUpDate: string;
  reason: string;
  reminderSent: boolean;
  status: "pending" | "completed" | "overdue";
  notes: string;
}

const mockFollowUps: FollowUp[] = [
  { id: 1, patientName: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@email.com", followUpDate: "2026-01-16", reason: "Diabetes check-up", reminderSent: true, status: "pending", notes: "Check HbA1c levels" },
  { id: 2, patientName: "Priya Patel", phone: "+91 87654 32109", email: "priya@email.com", followUpDate: "2026-01-18", reason: "BP monitoring", reminderSent: false, status: "pending", notes: "Review BP diary" },
  { id: 3, patientName: "Amit Kumar", phone: "+91 76543 21098", email: "amit@email.com", followUpDate: "2026-01-10", reason: "Post-bronchitis review", reminderSent: true, status: "overdue", notes: "Check if symptoms resolved" },
  { id: 4, patientName: "Sneha Gupta", phone: "+91 65432 10987", email: "sneha@email.com", followUpDate: "2026-01-05", reason: "Vaccination schedule", reminderSent: true, status: "completed", notes: "Second dose administered" },
];

export default function FollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>(mockFollowUps);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "completed">("all");

  const filteredFollowUps = followUps.filter(f => {
    const matchesSearch = f.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || f.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-amber-600" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "overdue": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800";
      case "completed": return "bg-emerald-100 text-emerald-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const toggleReminder = (id: number) => {
    setFollowUps(followUps.map(f => 
      f.id === id ? { ...f, reminderSent: !f.reminderSent } : f
    ));
  };

  const markComplete = (id: number) => {
    setFollowUps(followUps.map(f => 
      f.id === id ? { ...f, status: "completed" as const } : f
    ));
  };

  const stats = {
    total: followUps.length,
    pending: followUps.filter(f => f.status === "pending").length,
    overdue: followUps.filter(f => f.status === "overdue").length,
    today: followUps.filter(f => f.followUpDate === new Date().toISOString().split('T')[0]).length,
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Follow-Ups & Care Plans</h1>
            <p className="text-muted-foreground">Manage patient follow-ups and send reminders</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Follow-Up
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Follow-Ups</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
              <div className="text-sm text-muted-foreground">Due Today</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "overdue", "completed"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status as any)}
                className={filter === status ? "bg-emerald-600" : ""}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredFollowUps.map((followUp) => (
            <Card key={followUp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{followUp.patientName}</h3>
                        <Badge className={getStatusColor(followUp.status)}>
                          {getStatusIcon(followUp.status)}
                          <span className="ml-1">{followUp.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{followUp.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {followUp.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {followUp.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="text-center md:text-right">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        {new Date(followUp.followUpDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{followUp.notes}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`reminder-${followUp.id}`}
                          checked={followUp.reminderSent}
                          onCheckedChange={() => toggleReminder(followUp.id)}
                        />
                        <Label htmlFor={`reminder-${followUp.id}`} className="text-xs">
                          <Bell className="h-3 w-3" />
                        </Label>
                      </div>
                      {followUp.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markComplete(followUp.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ConsoleShell>
  );
}
