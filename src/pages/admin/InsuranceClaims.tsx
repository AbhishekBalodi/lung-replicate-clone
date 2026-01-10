import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface Claim {
  id: number;
  claim_number: string;
  patient_name: string;
  patient_id: string;
  insurance_provider: string;
  policy_number: string;
  claim_amount: number;
  approved_amount: number;
  status: "pending" | "submitted" | "approved" | "rejected" | "partially_approved";
  submitted_date: string;
  treatment_type: string;
  remarks: string;
}

export default function InsuranceClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/insurance/claims");
      if (res.ok) {
        const data = await res.json();
        setClaims(data || []);
      } else {
        // Mock data
        setClaims([
          { id: 1, claim_number: "CLM-2024-001", patient_name: "Rahul Sharma", patient_id: "P001", insurance_provider: "ICICI Lombard", policy_number: "POL123456", claim_amount: 75000, approved_amount: 75000, status: "approved", submitted_date: "2024-12-15", treatment_type: "Surgery", remarks: "Approved in full" },
          { id: 2, claim_number: "CLM-2024-002", patient_name: "Priya Gupta", patient_id: "P002", insurance_provider: "Star Health", policy_number: "POL789012", claim_amount: 45000, approved_amount: 0, status: "pending", submitted_date: "2024-12-20", treatment_type: "Hospitalization", remarks: "Under review" },
          { id: 3, claim_number: "CLM-2024-003", patient_name: "Amit Kumar", patient_id: "P003", insurance_provider: "HDFC Ergo", policy_number: "POL345678", claim_amount: 120000, approved_amount: 100000, status: "partially_approved", submitted_date: "2024-12-18", treatment_type: "ICU Care", remarks: "Room charges partially covered" },
          { id: 4, claim_number: "CLM-2024-004", patient_name: "Sunita Devi", patient_id: "P004", insurance_provider: "Max Bupa", policy_number: "POL901234", claim_amount: 35000, approved_amount: 0, status: "rejected", submitted_date: "2024-12-10", treatment_type: "OPD", remarks: "Pre-existing condition" },
          { id: 5, claim_number: "CLM-2024-005", patient_name: "Vikram Singh", patient_id: "P005", insurance_provider: "Bajaj Allianz", policy_number: "POL567890", claim_amount: 85000, approved_amount: 0, status: "submitted", submitted_date: "2024-12-22", treatment_type: "Surgery", remarks: "Documents submitted" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const getStatusBadge = (status: Claim["status"]) => {
    const config = {
      pending: { icon: Clock, className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      submitted: { icon: FileText, className: "bg-blue-100 text-blue-800", label: "Submitted" },
      approved: { icon: CheckCircle, className: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { icon: XCircle, className: "bg-red-100 text-red-800", label: "Rejected" },
      partially_approved: { icon: AlertCircle, className: "bg-orange-100 text-orange-800", label: "Partial" },
    };
    const { icon: Icon, className, label } = config[status];
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claim_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.insurance_provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === "pending" || c.status === "submitted").length,
    approved: claims.filter(c => c.status === "approved").length,
    totalClaimed: claims.reduce((sum, c) => sum + c.claim_amount, 0),
    totalApproved: claims.reduce((sum, c) => sum + c.approved_amount, 0),
  };

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insurance Claims</h1>
            <p className="text-gray-600">Manage and track insurance claims</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Claim
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit New Insurance Claim</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input placeholder="Enter patient name" />
                </div>
                <div>
                  <Label>Insurance Provider</Label>
                  <Input placeholder="Enter insurance company" />
                </div>
                <div>
                  <Label>Policy Number</Label>
                  <Input placeholder="Enter policy number" />
                </div>
                <div>
                  <Label>Claim Amount</Label>
                  <Input type="number" placeholder="Enter amount" />
                </div>
                <div>
                  <Label>Treatment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="hospitalization">Hospitalization</SelectItem>
                      <SelectItem value="icu">ICU Care</SelectItem>
                      <SelectItem value="opd">OPD</SelectItem>
                      <SelectItem value="maternity">Maternity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => {
                  toast.success("Claim submitted successfully");
                  setIsDialogOpen(false);
                }}>
                  Submit Claim
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Claimed</p>
              <p className="text-2xl font-bold">₹{stats.totalClaimed.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Approved</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.totalApproved.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="partially_approved">Partial</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">No claims found</TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.claim_number}</TableCell>
                      <TableCell>{claim.patient_name}</TableCell>
                      <TableCell>
                        <div>
                          <p>{claim.insurance_provider}</p>
                          <p className="text-sm text-gray-500">{claim.policy_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>{claim.treatment_type}</TableCell>
                      <TableCell>₹{claim.claim_amount.toLocaleString()}</TableCell>
                      <TableCell>₹{claim.approved_amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(claim.status)}</TableCell>
                      <TableCell>{claim.submitted_date}</TableCell>
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
