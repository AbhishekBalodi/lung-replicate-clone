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
import { Plus, Ambulance } from "lucide-react";
import ConsoleShell from "@/layouts/ConsoleShell";

const StaffFleetList = () => {
  const fleet = [
    {
      id: 1,
      driver: "Ramesh Kumar",
      vehicleNo: "DL 01 AB 1234",
      type: "Ambulance",
      availability: "Available",
    },
  ];

  return (
    <ConsoleShell>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ambulance className="h-5 w-5" />
          Fleet & Ambulance Staff
        </CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Fleet
        </Button>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Vehicle No</TableHead>
              <TableHead>Vehicle Type</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {fleet.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.driver}</TableCell>
                <TableCell>{f.vehicleNo}</TableCell>
                <TableCell>{f.type}</TableCell>
                <TableCell>
                  <Badge className={f.availability === "Available" ? "success" : "destructive"}>
                    {f.availability}
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

export default StaffFleetList;
