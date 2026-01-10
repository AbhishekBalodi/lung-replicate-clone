import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Departments() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="text-muted-foreground">Departments list and capacity summary.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Departments</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">—</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Doctors</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">—</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Beds</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">—</CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Department List</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This page is now accessible. Next step: connect to backend APIs.
          </CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
