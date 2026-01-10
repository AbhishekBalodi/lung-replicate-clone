import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DepartmentRevenueReport() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Department-wise Revenue</h1>
          <p className="text-muted-foreground">Revenue by department and service line.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Now routed; connect to billing + department mapping next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
