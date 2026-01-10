import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Infrastructure() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Infrastructure</h1>
          <p className="text-muted-foreground">Rooms, equipment, and facilities.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Summary of room types and occupancy.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Maintenance and availability overview.</CardContent>
          </Card>
        </section>
      </div>
    </ConsoleShell>
  );
}
