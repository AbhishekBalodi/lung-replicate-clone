import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type Medicine = { id: number; name: string; brand?: string | null; unit_price?: string | number };

export default function PharmacyMedicines() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [form, setForm] = useState<{ name: string; brand: string; unit_price: string }>({ name: '', brand: '', unit_price: '' });

  const load = async () => {
    try {
      const res = await api.apiGet('/api/pharmacy/medicines');
      const js = await res.json(); if (!res.ok) throw new Error(js?.error || 'Failed'); setItems(js.items || []);
    } catch (err: unknown) { const e = err as Error; toast.error('Failed to load: ' + (e?.message ?? String(err))); }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error('Name required');
    try {
      const res = await api.apiPost('/api/pharmacy/medicines', form);
      const js = await res.json(); if (!res.ok) throw new Error(js?.error || 'Failed'); toast.success('Added'); setForm({ name: '', brand: '', unit_price: '' }); load();
    } catch (err: unknown) { const e = err as Error; toast.error('Error: ' + (e?.message ?? String(err))); }
  };

  useEffect(() => { load(); }, []);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Pharmacy - Medicines</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <Input placeholder="Unit Price" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd}>Add Medicine</Button>
      </Card>

      <div className="mt-4 space-y-3">
        {items.map(it => (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">{it.name} {it.brand ? `• ${it.brand}` : ''}</div>
            <div className="text-sm text-emerald-700">Price: {it.unit_price}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}