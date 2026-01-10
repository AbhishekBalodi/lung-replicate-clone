import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, CheckCircle, AlertTriangle, FlaskConical, User } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { toast } from "sonner";

interface PendingTest {
  id: number;
  test_name: string;
  patient_name: string;
  patient_id: string;
  requested_by: string;
  requested_date: string;
  priority: "normal" | "urgent" | "critical";
  status: "pending" | "sample_collected" | "processing" | "completed";
  expected_date: string;
  sample_type: string;
}

export default function LabPendingTests() {
  const [tests, setTests] = useState<PendingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchPendingTests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/lab-tests/pending");
      if (res.ok) {
        const data = await res.json();
        setTests(data || []);
      } else {
        // Mock data
        setTests([
          { id: 1, test_name: "Complete Blood Count", patient_name: "Rahul Sharma", patient_id: "P001", requested_by: "Dr. Mann", requested_date: "2024-12-25", priority: "normal", status: "pending", expected_date: "2024-12-26", sample_type: "Blood" },
          { id: 2, test_name: "Chest X-Ray", patient_name: "Priya Gupta", patient_id: "P002", requested_by: "Dr. Gupta", requested_date: "2024-12-25", priority: "urgent", status: "sample_collected", expected_date: "2024-12-25", sample_type: "Imaging" },
          { id: 3, test_name: "Liver Function Test", patient_name: "Amit Kumar", patient_id: "P003", requested_by: "Dr. Sharma", requested_date: "2024-12-24", priority: "normal", status: "processing", expected_date: "2024-12-25", sample_type: "Blood" },
          { id: 4, test_name: "COVID-19 RT-PCR", patient_name: "Sunita Devi", patient_id: "P004", requested_by: "Dr. Mann", requested_date: "2024-12-25", priority: "critical", status: "pending", expected_date: "2024-12-25", sample_type: "Nasal Swab" },
          { id: 5, test_name: "Thyroid Profile", patient_name: "Vikram Singh", patient_id: "P005", requested_by: "Dr. Mehta", requested_date: "2024-12-24", priority: "normal", status: "sample_collected", expected_date: "2024-12-26", sample_type: "Blood" },
          { id: 6, test_name: "Urine Analysis", patient_name: "Neha Patel", patient_id: "P006", requested_by: "Dr. Gupta", requested_date: "2024-12-25", priority: "urgent", status: "pending", expected_date: "2024-12-25", sample_type: "Urine" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching pending tests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingTests();
  }, [fetchPendingTests]);

  const updateTestStatus = async (testId: number, newStatus: string) => {
    try {
      await apiPut(`/api/lab-tests/${testId}/status`, { status: newStatus });
      toast.success("Test status updated");
      fetchPendingTests();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getPriorityBadge = (priority: PendingTest["priority"]) => {
    const config = {
      normal: { className: "bg-gray-100 text-gray-800", label: "Normal" },
      urgent: { className: "bg-orange-100 text-orange-800", label: "Urgent" },
      critical: { className: "bg-red-100 text-red-800", label: "Critical" },
    };
    return <Badge className={config[priority].className}>{config[priority].label}</Badge>;
  };

  const getStatusBadge = (status: PendingTest["status"]) => {
    const config = {
      pending: { icon: Clock, className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      sample_collected: { icon: FlaskConical, className: "bg-blue-100 text-blue-800", label: "Sample Collected" },
      processing: { icon: AlertTriangle, className: "bg-purple-100 text-purple-800", label: "Processing" },
      completed: { icon: CheckCircle, className: "bg-green-100 text-green-800", label: "Completed" },
    };
    const { icon: Icon, className, label } = config[status];
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = 
      test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patient_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || test.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const stats = {
    total: tests.length,
    pending: tests.filter(t => t.status === "pending").length,
    critical: tests.filter(t => t.priority === "critical").length,
    urgent: tests.filter(t => t.priority === "urgent").length,
  };

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Lab Tests</h1>
          <p className="text-gray-600">Track and manage pending laboratory tests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <FlaskConical className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-600">Awaiting Sample</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-sm text-gray-600">Critical Priority</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.urgent}</p>
                <p className="text-sm text-gray-600">Urgent Priority</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search tests or patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Sample Type</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredTests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">No pending tests</TableCell>
                  </TableRow>
                ) : (
                  filteredTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.test_name}</TableCell>
                      <TableCell>
                        <div>
                          <p>{test.patient_name}</p>
                          <p className="text-sm text-gray-500">{test.patient_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{test.sample_type}</TableCell>
                      <TableCell>{test.requested_by}</TableCell>
                      <TableCell>{getPriorityBadge(test.priority)}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>{test.expected_date}</TableCell>
                      <TableCell>
                        <Select 
                          value={test.status} 
                          onValueChange={(value) => updateTestStatus(test.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sample_collected">Collected</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
