import { useState } from "react";
import ConsoleShell from "@/layouts/ConsoleShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const departments = [
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Pulmonology",
  "Gastroenterology",
  "Pediatrics",
];

export default function Rooms() {
  const [active, setActive] = useState("Cardiology");

  return (
    <ConsoleShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Rooms by Department</h1>
        <Button>Add New Room</Button>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {departments.slice(0, 3).map(dep => (
          <Card key={dep} className="p-4">
            <h3 className="font-medium">{dep}</h3>
            <p className="text-2xl font-bold mt-2">25</p>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-green-600">Available: 7</span>
              <span className="text-red-500">Occupied: 18</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {departments.map(dep => (
          <button
            key={dep}
            onClick={() => setActive(dep)}
            className={`px-3 py-1.5 rounded-md text-sm ${
              active === dep ? "bg-black text-white" : "bg-muted"
            }`}
          >
            {dep}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Input placeholder="Search rooms..." />
      </div>

      {/* Table */}
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Room Number</th>
              <th>Room Type</th>
              <th>Status</th>
              <th>Patient</th>
              <th>Doctor</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">101</td>
              <td>Private</td>
              <td>
                <Badge variant="destructive">Occupied</Badge>
              </td>
              <td>John Smith</td>
              <td>Dr. Emily Chen</td>
            </tr>
            <tr>
              <td className="p-3">102</td>
              <td>Private</td>
              <td>
                <Badge variant="success">Available</Badge>
              </td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </ConsoleShell>
  );
}
