import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Search, FileText, Clock, CheckCircle, XCircle, AlertCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface Claim {
  id: number;
  claim_number: string;
  patient_name: string;
  insurance_provider: string;
  policy_number: string;
  claim_amount: number;
  approved_amount: number;
  status: "pending" | "submitted" | "approved" | "rejected" | "partially_approved";
  submitted_date: string;
  treatment: string;
  treatment_type: string;
}

export default function InsuranceClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ✅ FORM STATE (THIS FIXES EVERYTHING)
  const [form, setForm] = useState({
    patient_name: "",
    insurance_provider: "",
    policy_number: "",
    claim_amount: "",
    treatment: "",
  });

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet("api/dashboard/financial/insurance-claims");
      if (res.ok) {
        const data = await res.json();
        setClaims(data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // ✅ FIXED SUBMIT
  const handleSubmitClaim = async () => {
    try {
      const res = await apiPost("api/dashboard/financial/insurance-claims", {
        patient_name: (
          document.querySelector(
            'input[placeholder="Enter patient name"]'
          ) as HTMLInputElement
        )?.value,

        insurance_provider: (
          document.querySelector(
            'input[placeholder="Enter insurance company"]'
          ) as HTMLInputElement
        )?.value,

        policy_number: (
          document.querySelector(
            'input[placeholder="Enter policy number"]'
          ) as HTMLInputElement
        )?.value,

        claim_amount: Number(
          (
            document.querySelector(
              'input[placeholder="Enter amount"]'
            ) as HTMLInputElement
          )?.value
        ),

        // ✅ MATCH BACKEND FIELD NAME
        treatment: "Surgery",
      });

      if (!res.ok) {
        toast.error("Failed to submit claim");
        return;
      }

      toast.success("Claim submitted successfully");
      setIsDialogOpen(false);
      fetchClaims();
    } catch (err) {
      toast.error("Failed to submit claim");
    }
  };

  const getStatusBadge = (status: Claim["status"]) => {
    const map = {
      pending: { icon: Clock, cls: "bg-yellow-100 text-yellow-800" },
      submitted: { icon: FileText, cls: "bg-blue-100 text-blue-800" },
      approved: { icon: CheckCircle, cls: "bg-green-100 text-green-800" },
      rejected: { icon: XCircle, cls: "bg-red-100 text-red-800" },
      partially_approved: { icon: AlertCircle, cls: "bg-orange-100 text-orange-800" },
    };
    const { icon: Icon, cls } = map[status];
    return (
      <Badge className={cls}>
        <Icon className="h-3 w-3 mr-1" />{status}
      </Badge>
    );
  };

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Insurance Claims</h1>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Claim</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit New Insurance Claim</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <Label>Patient Name *</Label>
                  <Input value={form.patient_name}
                    onChange={e => setForm({ ...form, patient_name: e.target.value })} />
                </div>

                <div>
                  <Label>Insurance Provider *</Label>
                  <Input value={form.insurance_provider}
                    onChange={e => setForm({ ...form, insurance_provider: e.target.value })} />
                </div>

                <div>
                  <Label>Policy Number</Label>
                  <Input value={form.policy_number}
                    onChange={e => setForm({ ...form, policy_number: e.target.value })} />
                </div>

                <div>
                  <Label>Claim Amount *</Label>
                  <Input type="number" value={form.claim_amount}
                    onChange={e => setForm({ ...form, claim_amount: e.target.value })} />
                </div>

                <div>
                  <Label>Treatment</Label>
                  <Select value={form.treatment}
                    onValueChange={v => setForm({ ...form, treatment: v })}>
                    <SelectTrigger><SelectValue placeholder="Select treatment" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Hospitalization">Hospitalization</SelectItem>
                      <SelectItem value="ICU Care">ICU Care</SelectItem>
                      <SelectItem value="OPD">OPD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={handleSubmitClaim}>
                  Submit Claim
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* TABLE UNCHANGED */}
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
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : claims.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.claim_number}</TableCell>
                    <TableCell>{c.patient_name}</TableCell>
                    <TableCell>{c.insurance_provider}</TableCell>
                    <TableCell>{c.treatment_type}</TableCell>
                    <TableCell>₹{c.claim_amount}</TableCell>
                    <TableCell>₹{c.approved_amount}</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell>{c.submitted_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
