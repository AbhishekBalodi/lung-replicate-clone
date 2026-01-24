import { useState, useEffect } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, ClipboardList, Calendar, Edit, CheckCircle2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface TreatmentPlan {
  id: number;
  patient_id: number | null;
  patient_name: string;
  title: string;
  description: string;
  goals: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "on-hold";
  created_at: string;
}

export default function EMRTreatmentPlans() {
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "on-hold">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '', title: '', description: '', goals: '', start_date: '', end_date: '', status: 'active'
  });

  useEffect(() => {
    fetchPlans();
  }, [searchTerm, filter]);

  const fetchPlans = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filter !== 'all') params.append('status', filter);
      const res = await apiFetch(`/api/dashboard/emr/treatment-plans?${params}`).then(r => r.json());
      setPlans(res.plans || []);
    } catch (error) {
      console.error('Failed to fetch treatment plans:', error);
      toast.error('Failed to load treatment plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.patient_name || !formData.title) {
      toast.error('Patient name and title are required');
      return;
    }
    try {
      await apiFetch('/api/dashboard/emr/treatment-plans', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success('Treatment plan created successfully');
      setIsModalOpen(false);
      setFormData({ patient_name: '', title: '', description: '', goals: '', start_date: '', end_date: '', status: 'active' });
      fetchPlans();
    } catch (error) {
      toast.error('Failed to create treatment plan');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "on-hold": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (plan: TreatmentPlan): number => {
    if (!plan.start_date || !plan.end_date) return 0;
    if (plan.status === 'completed') return 100;
    const start = new Date(plan.start_date).getTime();
    const end = new Date(plan.end_date).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const parseGoals = (goalsStr: string): string[] => {
    if (!goalsStr) return [];
    try {
      return JSON.parse(goalsStr);
    } catch {
      return goalsStr.split('\n').filter(g => g.trim());
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Treatment Plans</h1>
            <p className="text-muted-foreground">Manage patient treatment plans and track progress</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Treatment Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Treatment Plan</DialogTitle>
                <DialogDescription>Enter the treatment plan details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_name">Patient Name *</Label>
                    <Input id="patient_name" value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Diagnosis/Title *</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">Treatment Goals (one per line)</Label>
                  <Textarea id="goals" rows={3} placeholder="Enter each goal on a new line" value={formData.goals} onChange={(e) => setFormData({...formData, goals: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description / Medications</Label>
                  <Textarea id="description" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">Create Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by patient or diagnosis..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {["all", "active", "completed", "on-hold"].map((status) => (
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
          {loading ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : plans.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No treatment plans found. Create your first treatment plan!</CardContent></Card>
          ) : (
            plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <ClipboardList className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{plan.patient_name}</CardTitle>
                        <CardDescription>{plan.title}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status === "active" && <Clock className="h-3 w-3 mr-1" />}
                        {plan.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.start_date && plan.end_date && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{calculateProgress(plan)}%</span>
                    </div>
                    <Progress value={calculateProgress(plan)} className="h-2" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Treatment Goals</h4>
                      <ul className="space-y-1">
                        {parseGoals(plan.goals).map((goal, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                            {goal}
                          </li>
                        ))}
                        {parseGoals(plan.goals).length === 0 && <li className="text-sm text-muted-foreground">No goals defined</li>}
                      </ul>
                    </div>
                    {plan.description && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Description / Medications</h4>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    )}
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
