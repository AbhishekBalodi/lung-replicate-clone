import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, FileText, Settings, LogIn, LogOut, Edit, Trash2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type AuditLog = {
  id: number;
  user_name: string;
  action: string;
  resource: string;
  ip_address: string | null;
  created_at: string;
  status: string;
};

type AuditSummary = {
  totalActions: number;
  loginsToday: number;
  dataChanges: number;
  failedActions: number;
};

const getActionIcon = (action: string) => {
  const icons: Record<string, React.ReactNode> = {
    LOGIN: <LogIn className="h-4 w-4" />,
    LOGOUT: <LogOut className="h-4 w-4" />,
    CREATE: <FileText className="h-4 w-4" />,
    UPDATE: <Edit className="h-4 w-4" />,
    DELETE: <Trash2 className="h-4 w-4" />,
    VIEW: <Eye className="h-4 w-4" />,
    EXPORT: <FileText className="h-4 w-4" />,
  };
  return icons[action] || <Settings className="h-4 w-4" />;
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<AuditSummary>({ totalActions: 0, loginsToday: 0, dataChanges: 0, failedActions: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, logsRes] = await Promise.all([
          apiFetch('/api/dashboard/audit-logs/summary'),
          apiFetch(`/api/dashboard/audit-logs?action=${actionFilter}&search=${encodeURIComponent(searchQuery)}`),
        ]);

        const summaryData = await summaryRes.json();
        const logsData = await logsRes.json();

        if (summaryRes.ok) setSummary(summaryData);
        if (logsRes.ok) setLogs(Array.isArray(logsData?.logs) ? logsData.logs : []);
      } catch (error) {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [actionFilter, searchQuery]);

  const filteredLogs = logs;

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all system activities and user actions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Actions</p><p className="text-2xl font-bold">{summary.totalActions}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Logins Today</p><p className="text-2xl font-bold">{summary.loginsToday}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Data Changes</p><p className="text-2xl font-bold">{summary.dataChanges}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600 text-red-600">Failed Actions</p><p className="text-2xl font-bold text-red-600">{summary.failedActions}</p></CardContent></Card>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
              <SelectItem value="LOGOUT">Logout</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="VIEW">View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading audit logs...</TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No logs found</TableCell>
                  </TableRow>
                ) : filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="flex items-center gap-2"><User className="h-4 w-4" />{log.user_name}</TableCell>
                    <TableCell><div className="flex items-center gap-2">{getActionIcon(log.action)}{log.action}</div></TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell className="font-mono text-sm">{log.ip_address || '-'}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell><Badge className={log.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{log.status}</Badge></TableCell>
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
