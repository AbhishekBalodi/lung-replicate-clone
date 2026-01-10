import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Users, Lock, Key, Settings } from "lucide-react";
import { useState } from "react";

const roles = [
  { id: 1, name: "Super Admin", users: 2, permissions: ["all"], color: "bg-red-100 text-red-800" },
  { id: 2, name: "Doctor", users: 8, permissions: ["patients", "appointments", "prescriptions", "lab_results"], color: "bg-blue-100 text-blue-800" },
  { id: 3, name: "Nurse", users: 15, permissions: ["patients", "vitals", "medications"], color: "bg-green-100 text-green-800" },
  { id: 4, name: "Receptionist", users: 5, permissions: ["appointments", "billing", "patients_basic"], color: "bg-purple-100 text-purple-800" },
  { id: 5, name: "Lab Technician", users: 4, permissions: ["lab_tests", "lab_results"], color: "bg-orange-100 text-orange-800" },
  { id: 6, name: "Pharmacist", users: 3, permissions: ["pharmacy", "prescriptions_view"], color: "bg-cyan-100 text-cyan-800" },
];

const permissionModules = [
  { id: "patients", name: "Patient Management", description: "View and manage patient records" },
  { id: "appointments", name: "Appointments", description: "Schedule and manage appointments" },
  { id: "billing", name: "Billing", description: "Create invoices and manage payments" },
  { id: "lab_tests", name: "Lab Tests", description: "Order and manage lab tests" },
  { id: "pharmacy", name: "Pharmacy", description: "Manage pharmacy inventory" },
  { id: "reports", name: "Reports", description: "View and generate reports" },
  { id: "settings", name: "Settings", description: "System configuration" },
];

export default function AccessControl() {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
          <Button><Key className="h-4 w-4 mr-2" />Add Role</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className={`cursor-pointer transition-all ${selectedRole === role.id ? "ring-2 ring-emerald-500" : ""}`} onClick={() => setSelectedRole(role.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={role.color}>{role.name}</Badge>
                  <span className="text-sm text-gray-600">{role.users} users</span>
                </div>
                <p className="text-xs text-gray-500">{role.permissions.length === 1 && role.permissions[0] === "all" ? "Full access" : `${role.permissions.length} modules`}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Permission Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Super Admin</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Nurse</TableHead>
                  <TableHead>Receptionist</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissionModules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">{module.description}</TableCell>
                    <TableCell><Switch checked={true} disabled /></TableCell>
                    <TableCell><Switch checked={["patients", "appointments"].includes(module.id)} /></TableCell>
                    <TableCell><Switch checked={["patients"].includes(module.id)} /></TableCell>
                    <TableCell><Switch checked={["appointments", "billing"].includes(module.id)} /></TableCell>
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
