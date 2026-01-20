import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, CheckCircle2, Clock, AlertTriangle, FileText, Calendar, User, X, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { toast } from "sonner";

interface Task {
  id: number;
  type: "report" | "follow-up" | "emergency" | "lab" | "general";
  title: string;
  description: string;
  patient_name?: string;
  due_date: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
}

interface Notification {
  id: number;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Summary {
  unread: number;
  pending: number;
  urgent: number;
}

export default function TasksNotifications() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<Summary>({ unread: 0, pending: 0, urgent: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "completed">("pending");
  const [loading, setLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    type: "general" as Task["type"],
    priority: "medium" as Task["priority"],
    due_date: "",
    patient_name: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksSummaryRes, tasksRes, notifSummaryRes, notifRes] = await Promise.all([
        apiGet("/api/dashboard/tasks/summary"),
        apiGet(`/api/dashboard/tasks?status=${taskFilter}`),
        apiGet("/api/dashboard/notifications/summary"),
        apiGet("/api/dashboard/notifications")
      ]);

      if (tasksSummaryRes.ok) {
        const data = await tasksSummaryRes.json();
        setSummary(prev => ({ ...prev, pending: data.pending || 0, urgent: data.urgent || 0 }));
      }

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
      }

      if (notifSummaryRes.ok) {
        const data = await notifSummaryRes.json();
        setSummary(prev => ({ ...prev, unread: data.unread || 0 }));
      }

      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [taskFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTask = async () => {
    if (!taskForm.title || !taskForm.due_date) {
      toast.error("Title and due date are required");
      return;
    }
    try {
      const res = await apiPost("/api/dashboard/tasks", taskForm);
      if (res.ok) {
        const data = await res.json();
        toast.success("Task created");
        setIsTaskDialogOpen(false);
        setTaskForm({ title: "", description: "", type: "general", priority: "medium", due_date: "", patient_name: "" });
        if (data.task) {
          setTasks(prev => [data.task, ...prev]);
        } else {
          fetchData();
        }
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const markTaskComplete = async (id: number) => {
    try {
      const res = await apiPut(`/api/dashboard/tasks/${id}/complete`, {});
      if (res.ok) {
        toast.success("Task completed");
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "completed" } : t));
      }
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      await apiPut(`/api/dashboard/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      await apiPost("/api/dashboard/notifications/read-all", {});
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setSummary(prev => ({ ...prev, unread: 0 }));
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const dismissNotification = async (id: number) => {
    try {
      await apiDelete(`/api/dashboard/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      toast.error("Failed to dismiss notification");
    }
  };

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
      (task.patient_name && task.patient_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = taskFilter === "all" || task.status === taskFilter;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
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
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Task description..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <Select value={taskForm.type} onValueChange={(v) => setTaskForm({ ...taskForm, type: v as any })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="report">Report</SelectItem>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                            <SelectItem value="lab">Lab</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as any })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>Patient Name (optional)</Label>
                      <Input value={taskForm.patient_name} onChange={(e) => setTaskForm({ ...taskForm, patient_name: e.target.value })} placeholder="Patient name" />
                    </div>
                    <Button onClick={handleAddTask} className="w-full">Create Task</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : (
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
                            {task.patient_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {task.patient_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {task.status === "pending" && (
                          <Button variant="outline" size="sm" onClick={() => markTaskComplete(task.id)}>
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
                {filteredTasks.length === 0 && (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No tasks found</CardContent></Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={markAllRead}>
                Mark all as read
              </Button>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-l-4 ${getNotificationColor(notification.type)} ${notification.is_read ? "opacity-60" : ""}`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
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
