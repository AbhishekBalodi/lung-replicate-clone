import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DailyReports() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Daily Reports</h1>
          <p className="text-muted-foreground">Daily KPIs and performance breakdown.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Report</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Now routed; connect to daily aggregates next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
