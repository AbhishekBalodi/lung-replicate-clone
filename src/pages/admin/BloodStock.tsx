import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type BloodStockItem = { id: number; blood_group_id: number | string; units: number | string; unit_type?: string; batch_number?: string; expiry_date?: string; group_name?: string; rh_factor?: string };

const API_ROOT = (import.meta as any).env.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

export default function BloodStock() {
  const [items, setItems] = useState<BloodStockItem[]>([]);
  const [form, setForm] = useState({ blood_group_id: '', units: '', unit_type: 'ml' });

  const load = async () => {
    try {
      const res = await api.apiGet(`${API_ROOT}/blood-bank/stock`);
      const js = await res.json(); if (!res.ok) throw new Error(js?.error || 'Failed'); setItems(js.items || []);
    } catch (err: unknown) { const e = err as Error; toast.error('Failed to load: ' + (e?.message ?? String(err))); }
  };

  const handleAdd = async () => {
    if (!form.blood_group_id) return toast.error('Select blood group id');
    try {
      const res = await api.apiPost(`${API_ROOT}/blood-bank/stock`, form);
      const js = await res.json(); if (!res.ok) throw new Error(js?.error || 'Failed'); toast.success('Added'); setForm({ blood_group_id: '', units: '', unit_type: 'ml' }); load();
    } catch (err: unknown) { const e = err as Error; toast.error('Error: ' + (e?.message ?? String(err))); }
  };

  useEffect(() => { load(); }, []);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Blood Stock</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <Input placeholder="Blood Group ID" value={form.blood_group_id} onChange={(e) => setForm({ ...form, blood_group_id: e.target.value })} />
          <Input placeholder="Units" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} />
          <Input placeholder="Unit Type" value={form.unit_type} onChange={(e) => setForm({ ...form, unit_type: e.target.value })} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd}>Add Stock</Button>
      </Card>

      <div className="mt-4 space-y-3">
        {items.map(it => (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">{it.group_name}{it.rh_factor ? it.rh_factor : ''} - {it.units} {it.unit_type}</div>
            <div className="text-sm text-emerald-700">Batch: {it.batch_number} • Expiry: {it.expiry_date}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}