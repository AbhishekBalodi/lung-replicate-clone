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
import { Plus, Phone } from "lucide-react";
import ConsoleShell from "@/layouts/ConsoleShell";

const StaffCallList = () => {
  const staff = [
    {
      id: 1,
      name: "Anita Sharma",
      phone: "+91 98765 43210",
      shift: "Day",
      callsToday: 48,
      status: "Active",
    },
  ];

  return (
    <ConsoleShell>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Center Staff
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
              <TableHead>Phone</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Calls Today</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{s.shift}</TableCell>
                <TableCell>{s.callsToday}</TableCell>
                <TableCell>
                  <Badge className={s.status === "Active" ? "success" : "secondary"}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">Edit</Button>
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

export default StaffCallList;
