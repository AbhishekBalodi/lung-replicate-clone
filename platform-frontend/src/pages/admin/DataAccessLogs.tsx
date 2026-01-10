import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DataAccessLogs() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Data Access Logs</h1>
          <p className="text-muted-foreground">Read access tracking for sensitive records.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Access Events</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Now routed; connect to backend audit events next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
