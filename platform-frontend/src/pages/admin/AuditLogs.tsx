import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuditLogs() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="text-muted-foreground">Track system actions (login, edits, exports).</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Now routed; connect to backend logs next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
