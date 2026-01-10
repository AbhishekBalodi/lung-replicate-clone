import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, MessageSquare, Filter, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const mockComplaints = [
  { id: 1, patient: "John Doe", subject: "Long waiting time", description: "Had to wait 2 hours beyond appointment time", category: "Wait Time", priority: "high", status: "open", date: "2026-01-08", department: "General Medicine" },
  { id: 2, patient: "Jane Smith", subject: "Billing discrepancy", description: "Charged twice for the same consultation", category: "Billing", priority: "medium", status: "in-progress", date: "2026-01-07", department: "Finance" },
  { id: 3, patient: "Mike Johnson", subject: "Staff behavior", description: "Receptionist was rude during check-in", category: "Staff", priority: "high", status: "resolved", date: "2026-01-06", department: "Administration" },
  { id: 4, patient: "Sarah Williams", subject: "Cleanliness issue", description: "Restroom was not clean", category: "Facility", priority: "low", status: "open", date: "2026-01-05", department: "Housekeeping" },
  { id: 5, patient: "Robert Brown", subject: "Medicine availability", description: "Prescribed medicine not available in pharmacy", category: "Pharmacy", priority: "medium", status: "in-progress", date: "2026-01-04", department: "Pharmacy" },
];

export default function ComplaintsManagement() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const filteredComplaints = mockComplaints.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterPriority !== "all" && c.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    return <Badge className={styles[priority as keyof typeof styles]}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: "bg-blue-100 text-blue-800",
      "in-progress": "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800"
    };
    return <Badge className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  return (
    <ConsoleShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaints Management</h1>
          <p className="text-slate-600">Track and resolve patient complaints</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Complaints</p>
                  <p className="text-2xl font-bold">{mockComplaints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Open</p>
                  <p className="text-2xl font-bold">{mockComplaints.filter(c => c.status === "open").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold">{mockComplaints.filter(c => c.status === "in-progress").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Resolved</p>
                  <p className="text-2xl font-bold">{mockComplaints.filter(c => c.status === "resolved").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">All Complaints</CardTitle>
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredComplaints.map((c) => (
                <div key={c.id} className="border rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.subject}</span>
                        {getPriorityBadge(c.priority)}
                        {getStatusBadge(c.status)}
                      </div>
                      <p className="text-sm text-slate-600">Patient: {c.patient} • {c.date} • {c.department}</p>
                      <p className="text-sm mt-2">{c.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
