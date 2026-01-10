import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoctorRevenueReport() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Doctor-wise Revenue</h1>
          <p className="text-muted-foreground">Revenue by doctor with comparisons.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Now routed; connect to billing + doctor mapping next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
