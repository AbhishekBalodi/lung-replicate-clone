import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LabPendingTests() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Pending Tests</h1>
          <p className="text-muted-foreground">Pending lab tests queue and turnaround.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Queue</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">This page is now accessible.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
