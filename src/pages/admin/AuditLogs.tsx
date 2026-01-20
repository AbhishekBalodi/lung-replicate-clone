import { useState, useEffect, useCallback } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Shield, User, Clock, FileText, Settings, LogIn, LogOut, Edit, Trash2, Eye, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";

interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string;
  action: string;
  resource: string;
  resource_id: number | null;
  ip_address: string;
  details: string;
  status: "success" | "failed";
  created_at: string;
}

interface Summary {
  totalActions: number;
  loginsToday: number;
  dataChanges: number;
  failedActions: number;
}

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
  const [summary, setSummary] = useState<Summary>({ totalActions: 0, loginsToday: 0, dataChanges: 0, failedActions: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, logsRes] = await Promise.all([
        apiGet('/api/dashboard/audit-logs/summary'),
        apiGet(`/api/dashboard/audit-logs?action=${actionFilter}&search=${searchQuery}`)
      ]);
      
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
      
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    const csv = [
      ['ID', 'User', 'Action', 'Resource', 'IP Address', 'Status', 'Date'].join(','),
      ...logs.map(l => [l.id, l.user_name, l.action, l.resource, l.ip_address, l.status, l.created_at].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
    toast.success('Export completed');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.resource?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground">Track all system activities and user actions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Actions</p><p className="text-2xl font-bold">{summary.totalActions}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Logins Today</p><p className="text-2xl font-bold">{summary.loginsToday}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Data Changes</p><p className="text-2xl font-bold">{summary.dataChanges}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-red-600">Failed Actions</p><p className="text-2xl font-bold text-red-600">{summary.failedActions}</p></CardContent></Card>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
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
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">No logs found</TableCell></TableRow>
                ) : (
                  filteredLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="flex items-center gap-2"><User className="h-4 w-4" />{log.user_name}</TableCell>
                      <TableCell><div className="flex items-center gap-2">{getActionIcon(log.action)}{log.action}</div></TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell><Badge className={log.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{log.status}</Badge></TableCell>
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
