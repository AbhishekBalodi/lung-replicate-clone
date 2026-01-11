import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Shield, User, Clock, FileText, Settings, LogIn, LogOut, Edit, Trash2, Eye } from "lucide-react";
import { useState } from "react";

const mockLogs = [
  { id: 1, user: "Dr. Mann", action: "LOGIN", resource: "System", ip: "192.168.1.100", timestamp: "2024-12-25 09:15:23", status: "success" },
  { id: 2, user: "Admin", action: "UPDATE", resource: "Patient P001", ip: "192.168.1.101", timestamp: "2024-12-25 09:20:45", status: "success" },
  { id: 3, user: "Dr. Gupta", action: "VIEW", resource: "Lab Results", ip: "192.168.1.102", timestamp: "2024-12-25 09:25:10", status: "success" },
  { id: 4, user: "Nurse Singh", action: "CREATE", resource: "Prescription", ip: "192.168.1.103", timestamp: "2024-12-25 09:30:00", status: "success" },
  { id: 5, user: "Unknown", action: "LOGIN", resource: "System", ip: "203.45.67.89", timestamp: "2024-12-25 09:35:22", status: "failed" },
  { id: 6, user: "Admin", action: "DELETE", resource: "Old Records", ip: "192.168.1.101", timestamp: "2024-12-25 09:40:15", status: "success" },
  { id: 7, user: "Dr. Sharma", action: "EXPORT", resource: "Patient Data", ip: "192.168.1.104", timestamp: "2024-12-25 09:45:30", status: "success" },
  { id: 8, user: "Reception", action: "LOGOUT", resource: "System", ip: "192.168.1.105", timestamp: "2024-12-25 09:50:00", status: "success" },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) || log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all system activities and user actions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Actions</p><p className="text-2xl font-bold">{mockLogs.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Logins Today</p><p className="text-2xl font-bold">{mockLogs.filter(l => l.action === "LOGIN").length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Data Changes</p><p className="text-2xl font-bold">{mockLogs.filter(l => ["CREATE", "UPDATE", "DELETE"].includes(l.action)).length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600 text-red-600">Failed Actions</p><p className="text-2xl font-bold text-red-600">{mockLogs.filter(l => l.status === "failed").length}</p></CardContent></Card>
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
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="flex items-center gap-2"><User className="h-4 w-4" />{log.user}</TableCell>
                    <TableCell><div className="flex items-center gap-2">{getActionIcon(log.action)}{log.action}</div></TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
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
