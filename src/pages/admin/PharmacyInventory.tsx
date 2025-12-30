import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type InventoryItem = { id: number; medicine_id: number | string; quantity: number | string; batch_number?: string | null; expiry_date?: string | null; name?: string };
type MedicineInfo = { id: number; name: string };

export default function PharmacyInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<MedicineInfo[]>([]);
  const [form, setForm] = useState<{ medicine_id: string; quantity: string; batch_number: string }>({ medicine_id: '', quantity: '', batch_number: '' });

  const load = async () => {
    try {
      // load medicines and inventory in parallel
      const [medRes, invRes] = await Promise.all([
        api.apiGet('/api/pharmacy/medicines'),
        api.apiGet('/api/pharmacy/inventory')
      ]);
      const medJs = await medRes.json();
      if (!medRes.ok) throw new Error(medJs?.error || 'Failed to load medicines');
      setMedicines(medJs.items || []);

      const invJs = await invRes.json();
      if (!invRes.ok) throw new Error(invJs?.error || 'Failed to load inventory');
      setItems(invJs.items || []);
    } catch (err: unknown) { const e = err as Error; toast.error('Failed to load: ' + (e?.message ?? String(err))); }
  };

  const handleAdd = async () => {
    if (!form.medicine_id) return toast.error('Select or enter medicine id');
    try {
      // ensure medicine_id is numeric
      const payload = { ...form, medicine_id: Number(form.medicine_id), quantity: Number(form.quantity) };
      const res = await api.apiPost('/api/pharmacy/inventory', payload);
      const js = await res.json();
      if (!res.ok) {
        // if backend indicates an invalid medicine id, give a clearer message and help the user add the medicine
        if (js?.error === 'Invalid medicine_id') {
          toast.error('Invalid medicine id. Please add the medicine first. Redirecting to Medicines page...');
          // small delay so the toast is visible before navigating
          setTimeout(() => navigate('/admin/pharmacy/medicines'), 900);
          return;
        }
        throw new Error(js?.error || 'Failed to add inventory');
      }
      toast.success('Added');
      setForm({ medicine_id: '', quantity: '', batch_number: '' });
      load();
    } catch (err: unknown) { const e = err as Error; toast.error('Error: ' + (e?.message ?? String(err))); }
  };

  useEffect(() => { load(); }, []);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Pharmacy - Inventory</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-1">Medicine</label>
            {medicines.length ? (
              <select className="w-full border rounded p-2" value={form.medicine_id} onChange={(e) => setForm({ ...form, medicine_id: e.target.value })}>
                <option value="">Select medicine</option>
                {medicines.map(m => <option key={m.id} value={String(m.id)}>{m.id} - {m.name}</option>)}
              </select>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-rose-600">No medicines found. Add a medicine first.</div>
                <div className="flex gap-2 items-center">
                  <Button className="border border-emerald-700 text-emerald-700" onClick={() => navigate('/admin/pharmacy/medicines')}>Add Medicine</Button>
                  <Input placeholder="Medicine ID (numeric)" value={form.medicine_id} onChange={(e) => setForm({ ...form, medicine_id: e.target.value })} />
                </div>
                <div className="text-xs text-rose-500">Tip: adding a medicine is recommended; manual ID entry may fail if the ID does not exist.</div>
              </div>
            )}
          </div>
          <Input placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <Input placeholder="Batch Number" value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd} disabled={!form.medicine_id}>Add Inventory</Button>
      </Card>

      <div className="mt-4 space-y-3">
        {items.map(it => (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">{it.name || it.medicine_id} - {it.quantity}</div>
            <div className="text-sm text-emerald-700">Batch: {it.batch_number} • Expiry: {it.expiry_date}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}