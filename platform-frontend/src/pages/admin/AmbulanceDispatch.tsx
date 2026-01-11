import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';

export default function AmbulanceDispatch(){
  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Ambulance Dispatch</h1>
      <Card className="p-4 mt-4">
        <p className="text-emerald-700">Dispatch functionality placeholder — you can view ambulances and mark as dispatched here.</p>
      </Card>
    </ConsoleShell>
  );
}