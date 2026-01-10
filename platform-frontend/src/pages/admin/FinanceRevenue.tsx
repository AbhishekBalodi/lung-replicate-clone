import ConsoleShell from "@/layouts/ConsoleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinanceRevenue() {
  return (
    <ConsoleShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Revenue</h1>
          <p className="text-muted-foreground">Revenue KPIs and trends.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">—</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">—</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Insurance Claims</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">—</CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Connect this to real billing data next.</CardContent>
        </Card>
      </div>
    </ConsoleShell>
  );
}
