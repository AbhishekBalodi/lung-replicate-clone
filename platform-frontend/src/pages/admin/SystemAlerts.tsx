import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemAlerts() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">System Alerts</h1>
          <p className="text-muted-foreground">Operational alerts and incidents.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Now routed; connect to alert stream next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
