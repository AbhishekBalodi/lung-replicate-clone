import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LabRevenue() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Lab Revenue</h1>
          <p className="text-muted-foreground">Revenue from lab services and tests.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Connect to lab billing tables next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
