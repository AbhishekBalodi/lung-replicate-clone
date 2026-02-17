import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type Ambulance = { id: number; vehicle_number: string; model?: string | null; driver_name?: string | null; driver_contact?: string | null };

const API_ROOT = '/api';

export default function AmbulancesPage() {
  const [items, setItems] = useState<Ambulance[]>([]);
  const [form, setForm] = useState<{ vehicle_number: string; model: string; driver_name: string; driver_contact: string }>({ vehicle_number: '', model: '', driver_name: '', driver_contact: '' });

  const load = async () => {
    try {
      const res = await api.apiGet(`${API_ROOT}/ambulances`);
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');
      setItems(js.items || []);
    } catch (err: unknown) { const e = err as Error; toast.error('Failed to load ambulances: ' + (e?.message ?? String(err))); }
  };

  const handleAdd = async () => {
    if (!form.vehicle_number.trim()) return toast.error('Vehicle number required');
    try {
      const res = await api.apiPost(`${API_ROOT}/ambulances`, form);
      const js = await res.json(); if (!res.ok) throw new Error(js?.error || 'Failed');
      toast.success('Added'); setForm({ vehicle_number: '', model: '', driver_name: '', driver_contact: '' }); load();
    } catch (err: unknown) { const e = err as Error; toast.error('Error: ' + (e?.message ?? String(err))); }
  };

  useEffect(() => { load(); }, []);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Ambulances</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input placeholder="Vehicle Number" value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
          <Input placeholder="Driver Name" value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} />
          <Input placeholder="Driver Contact" value={form.driver_contact} onChange={(e) => setForm({ ...form, driver_contact: e.target.value })} />
          <Input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd}>Add Ambulance</Button>
      </Card>

      <div className="mt-4 space-y-3">
        {items.map(it => (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">{it.vehicle_number} - {it.driver_name || 'No driver'}</div>
            <div className="text-sm text-emerald-700">{it.model} • {it.driver_contact}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}