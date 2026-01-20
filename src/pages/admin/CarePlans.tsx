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
import { Search, Plus, Heart, User, Calendar, CheckCircle2, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface CarePlan {
  id: number;
  patient_id: number | null;
  patient_name: string;
  title: string;
  description: string;
  goals: string;
  interventions: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

export default function CarePlans() {
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '', title: '', description: '', goals: '', interventions: '', start_date: '', end_date: '', status: 'active'
  });

  useEffect(() => {
    fetchCarePlans();
  }, [searchTerm]);

  const fetchCarePlans = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const res = await apiFetch(`/api/dashboard/care-plans?${params}`).then(r => r.json());
      setCarePlans(res.carePlans || []);
    } catch (error) {
      console.error('Failed to fetch care plans:', error);
      toast.error('Failed to load care plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.patient_name || !formData.title) {
      toast.error('Patient name and condition/title are required');
      return;
    }
    try {
      await apiFetch('/api/dashboard/care-plans', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success('Care plan created successfully');
      setIsModalOpen(false);
      setFormData({ patient_name: '', title: '', description: '', goals: '', interventions: '', start_date: '', end_date: '', status: 'active' });
      fetchCarePlans();
    } catch (error) {
      toast.error('Failed to create care plan');
    }
  };

  const parseGoals = (goalsStr: string): { text: string; completed: boolean }[] => {
    if (!goalsStr) return [];
    try {
      const parsed = JSON.parse(goalsStr);
      if (Array.isArray(parsed)) {
        return parsed.map(g => typeof g === 'string' ? { text: g, completed: false } : g);
      }
      return [];
    } catch {
      return goalsStr.split('\n').filter(g => g.trim()).map(g => ({ text: g, completed: false }));
    }
  };

  const parseInterventions = (str: string): string[] => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return str.split('\n').filter(i => i.trim());
    }
  };

  const calculateProgress = (plan: CarePlan): number => {
    const goals = parseGoals(plan.goals);
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  };

  const getDuration = (startDate: string, endDate: string): string => {
    if (!startDate) return 'Ongoing';
    if (!endDate) return 'Ongoing';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return months > 0 ? `${months} months` : 'Ongoing';
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Long-Term Care Plans</h1>
            <p className="text-muted-foreground">Comprehensive care plans for chronic conditions</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Care Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Care Plan</DialogTitle>
                <DialogDescription>Enter the care plan details for long-term patient management.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_name">Patient Name *</Label>
                    <Input id="patient_name" value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Condition/Title *</Label>
                    <Input id="title" placeholder="e.g., Type 2 Diabetes Management" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">Care Goals (one per line)</Label>
                  <Textarea id="goals" rows={4} placeholder="Enter each goal on a new line&#10;e.g., Maintain fasting glucose 80-130 mg/dL&#10;HbA1c below 7%&#10;30 minutes daily exercise" value={formData.goals} onChange={(e) => setFormData({...formData, goals: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interventions">Care Instructions (one per line)</Label>
                  <Textarea id="interventions" rows={4} placeholder="Enter each instruction on a new line&#10;e.g., Take Metformin 500mg with breakfast&#10;Check blood sugar before breakfast daily" value={formData.interventions} onChange={(e) => setFormData({...formData, interventions: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Additional Notes</Label>
                  <Textarea id="description" rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">Create Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search care plans..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="grid gap-6">
          {loading ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : carePlans.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No care plans found. Create your first care plan!</CardContent></Card>
          ) : (
            carePlans.map((plan) => {
              const goals = parseGoals(plan.goals);
              const instructions = parseInterventions(plan.interventions);
              const progress = calculateProgress(plan);
              
              return (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
                          <Heart className="h-6 w-6 text-rose-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{plan.patient_name}</CardTitle>
                          <CardDescription>{plan.title}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        {plan.start_date && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Started {new Date(plan.start_date).toLocaleDateString()}
                          </div>
                        )}
                        <Badge variant="outline" className="mt-1">{getDuration(plan.start_date, plan.end_date)}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Care Goals
                        </h4>
                        <div className="space-y-2">
                          {goals.length > 0 ? goals.map((goal, idx) => (
                            <div key={idx} className={`flex items-center gap-2 p-2 rounded ${goal.completed ? 'bg-emerald-50' : ''}`}>
                              <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${goal.completed ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}>
                                {goal.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                              </div>
                              <span className={`text-sm ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {goal.text}
                              </span>
                            </div>
                          )) : (
                            <p className="text-sm text-muted-foreground">No goals defined</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          Care Instructions
                        </h4>
                        <ul className="space-y-2">
                          {instructions.length > 0 ? instructions.map((instruction, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs shrink-0">
                                {idx + 1}
                              </span>
                              {instruction}
                            </li>
                          )) : (
                            <li className="text-sm text-muted-foreground">No instructions defined</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Edit Plan</Button>
                      <Button variant="outline" size="sm">Print Instructions</Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Send to Patient</Button>
                    </div>
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
