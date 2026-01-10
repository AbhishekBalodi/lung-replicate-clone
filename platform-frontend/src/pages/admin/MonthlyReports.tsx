import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonthlyReports() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Monthly Reports</h1>
          <p className="text-muted-foreground">Monthly trends and summaries.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Report</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Now routed; connect to monthly aggregates next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
