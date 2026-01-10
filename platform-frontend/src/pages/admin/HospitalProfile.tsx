import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HospitalProfile() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Hospital Profile</h1>
          <p className="text-muted-foreground">View and manage hospital information.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This page is wired in routing. Next step is connecting it to backend data.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Email, phone, address.</CardContent>
          </Card>
        </section>
      </div>
    </ConsoleShell>
  );
}
