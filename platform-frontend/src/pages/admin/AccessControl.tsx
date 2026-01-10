import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessControl() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Access Control</h1>
          <p className="text-muted-foreground">Roles, permissions, and assignments.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Now routed; connect to roles data next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
