import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";
import ConsoleShell from "@/layouts/ConsoleShell";

const StaffDetails = () => {
  const staff = [
    {
      id: 1,
      name: "Sunita Verma",
      role: "Nurse",
      department: "ICU",
      phone: "+91 91234 56789",
      status: "Active",
    },
  ];

  return (
    <ConsoleShell>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Hospital Staff Directory
        </CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Staff
        </Button>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.role}</TableCell>
                <TableCell>{s.department}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>
                  <Badge className={s.status === "Active" ? "success" : "secondary"}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </ConsoleShell>
  );
};

export default StaffDetails;
