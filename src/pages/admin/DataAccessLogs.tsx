import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Database, Eye, Download, Edit, User } from "lucide-react";
import { useState } from "react";

const dataLogs = [
  { id: 1, user: "Dr. Mann", action: "VIEW", data_type: "Patient Medical History", patient: "Rahul Sharma", timestamp: "2024-12-25 10:15:00", records: 25 },
  { id: 2, user: "Admin", action: "EXPORT", data_type: "Billing Report", patient: "Multiple", timestamp: "2024-12-25 09:30:00", records: 150 },
  { id: 3, user: "Dr. Gupta", action: "VIEW", data_type: "Lab Results", patient: "Priya Gupta", timestamp: "2024-12-25 11:00:00", records: 5 },
  { id: 4, user: "Nurse Singh", action: "EDIT", data_type: "Vitals", patient: "Amit Kumar", timestamp: "2024-12-25 11:30:00", records: 1 },
  { id: 5, user: "Receptionist", action: "VIEW", data_type: "Appointment History", patient: "Sunita Devi", timestamp: "2024-12-25 12:00:00", records: 12 },
  { id: 6, user: "Lab Tech", action: "EXPORT", data_type: "Test Results", patient: "Multiple", timestamp: "2024-12-25 12:30:00", records: 45 },
];

const getActionIcon = (action: string) => {
  const icons: Record<string, React.ReactNode> = { VIEW: <Eye className="h-4 w-4" />, EXPORT: <Download className="h-4 w-4" />, EDIT: <Edit className="h-4 w-4" /> };
  return icons[action] || <Database className="h-4 w-4" />;
};

export default function DataAccessLogs() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = dataLogs.filter(log => log.user.toLowerCase().includes(searchQuery.toLowerCase()) || log.data_type.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Access Logs</h1>
          <p className="text-gray-600">Monitor who accessed patient data and when</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Accesses</p><p className="text-2xl font-bold">{dataLogs.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Views</p><p className="text-2xl font-bold">{dataLogs.filter(l => l.action === "VIEW").length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Exports</p><p className="text-2xl font-bold text-orange-600">{dataLogs.filter(l => l.action === "EXPORT").length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Records Accessed</p><p className="text-2xl font-bold">{dataLogs.reduce((sum, l) => sum + l.records, 0)}</p></CardContent></Card>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="flex items-center gap-2"><User className="h-4 w-4" />{log.user}</TableCell>
                    <TableCell><div className="flex items-center gap-2">{getActionIcon(log.action)}<Badge variant="outline">{log.action}</Badge></div></TableCell>
                    <TableCell>{log.data_type}</TableCell>
                    <TableCell>{log.patient}</TableCell>
                    <TableCell>{log.records}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
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
