import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, CheckCircle2, Clock, AlertTriangle, FileText, Phone, Calendar, User, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: number;
  type: "report" | "follow-up" | "emergency" | "lab";
  title: string;
  description: string;
  patient?: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
}

interface Notification {
  id: number;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockTasks: Task[] = [
  { id: 1, type: "report", title: "Review Lab Report", description: "Blood test results for Rahul Sharma", patient: "Rahul Sharma", dueDate: "2026-01-15", priority: "high", status: "pending" },
  { id: 2, type: "follow-up", title: "Patient Follow-Up Due", description: "Diabetes check-up reminder", patient: "Priya Patel", dueDate: "2026-01-16", priority: "medium", status: "pending" },
  { id: 3, type: "emergency", title: "Critical Lab Value", description: "Potassium level 6.2 mEq/L", patient: "Amit Kumar", dueDate: "2026-01-15", priority: "high", status: "pending" },
  { id: 4, type: "lab", title: "Sign Prescription", description: "Pending prescription approval", patient: "Sneha Gupta", dueDate: "2026-01-15", priority: "low", status: "completed" },
];

const mockNotifications: Notification[] = [
  { id: 1, type: "warning", title: "Critical Lab Result", message: "Patient Amit Kumar has abnormal potassium levels", time: "5 minutes ago", read: false },
  { id: 2, type: "info", title: "New Appointment", message: "Rahul Sharma booked for tomorrow at 10:00 AM", time: "1 hour ago", read: false },
  { id: 3, type: "success", title: "Prescription Sent", message: "Prescription for Priya Patel sent to pharmacy", time: "2 hours ago", read: true },
  { id: 4, type: "info", title: "Follow-Up Reminder", message: "3 patients due for follow-up this week", time: "3 hours ago", read: true },
];

export default function TasksNotifications() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "completed">("pending");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "report": return <FileText className="h-5 w-5" />;
      case "follow-up": return <Calendar className="h-5 w-5" />;
      case "emergency": return <AlertTriangle className="h-5 w-5" />;
      case "lab": return <FileText className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "warning": return "border-l-amber-500 bg-amber-50";
      case "error": return "border-l-red-500 bg-red-50";
      case "success": return "border-l-emerald-500 bg-emerald-50";
      default: return "border-l-blue-500 bg-blue-50";
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.patient && task.patient.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = taskFilter === "all" || task.status === taskFilter;
    return matchesSearch && matchesFilter;
  });

  const markTaskComplete = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: "completed" as const } : t));
  };

  const markNotificationRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const highPriorityTasks = tasks.filter(t => t.priority === "high" && t.status === "pending").length;

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tasks & Notifications</h1>
            <p className="text-muted-foreground">Manage your pending tasks and alerts</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Bell className="h-4 w-4 mr-1" />
              {unreadCount} unread
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-amber-700 border-amber-200 bg-amber-50">
              <Clock className="h-4 w-4 mr-1" />
              {pendingTasks} pending
            </Badge>
            {highPriorityTasks > 0 && (
              <Badge variant="outline" className="px-3 py-1 text-red-700 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {highPriorityTasks} urgent
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks">Tasks ({pendingTasks})</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {["all", "pending", "completed"].map((filter) => (
                  <Button
                    key={filter}
                    variant={taskFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTaskFilter(filter as any)}
                    className={taskFilter === filter ? "bg-emerald-600" : ""}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className={`hover:shadow-md transition-shadow ${task.status === "completed" ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        task.type === "emergency" ? "bg-red-100 text-red-600" :
                        task.type === "follow-up" ? "bg-blue-100 text-blue-600" :
                        "bg-emerald-100 text-emerald-600"
                      }`}>
                        {getTypeIcon(task.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}>
                            {task.title}
                          </h3>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {task.patient && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.patient}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {task.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markTaskComplete(task.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      {task.status === "completed" && (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}>
                Mark all as read
              </Button>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-l-4 ${getNotificationColor(notification.type)} ${notification.read ? "opacity-60" : ""}`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {notifications.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No notifications to show</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ConsoleShell>
  );
}
