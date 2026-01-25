import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type InventoryItem = {
  id: number;
  medicine_id: number | string;
  quantity: number | string;
  batch_number?: string | null;
  expiry_date?: string | null;
  name?: string;
};

type MedicineInfo = { id: number; name: string };

export default function PharmacyInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<MedicineInfo[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    medicine_id: '',
    quantity: '',
    batch_number: '',
  });

  const load = async () => {
    try {
      const [medRes, invRes] = await Promise.all([
        api.apiGet('/api/pharmacy/medicines'),
        api.apiGet('/api/pharmacy/inventory'),
      ]);

      const medJs = await medRes.json();
      if (!medRes.ok) throw new Error(medJs?.error || 'Failed to load medicines');
      setMedicines(medJs.items || []);

      const invJs = await invRes.json();
      if (!invRes.ok) throw new Error(invJs?.error || 'Failed to load inventory');
      setItems(invJs.items || []);
    } catch (err: unknown) {
      const e = err as Error;
      toast.error('Failed to load: ' + (e?.message ?? String(err)));
    }
  };

  const handleAdd = async () => {
    if (!form.medicine_id) return toast.error('Select a medicine');

    try {
      const payload = {
        medicine_id: Number(form.medicine_id),
        quantity: Number(form.quantity),
        batch_number: form.batch_number,
      };

      const res = await api.apiPost('/api/pharmacy/inventory', payload);
      const js = await res.json();

      if (!res.ok) {
        if (js?.error === 'Invalid medicine_id') {
          toast.error('Invalid medicine. Redirecting to Medicines page...');
          setTimeout(() => navigate('/admin/pharmacy/medicines'), 900);
          return;
        }
        throw new Error(js?.error || 'Failed to add inventory');
      }

      toast.success('Inventory added');
      setOpen(false);
      setForm({ medicine_id: '', quantity: '', batch_number: '' });
      load();
    } catch (err: unknown) {
      const e = err as Error;
      toast.error('Error: ' + (e?.message ?? String(err)));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">
        Pharmacy - Inventory
      </h1>

      {/* Add Button */}
      <div className="mt-4">
        <Button
          className="bg-emerald-700"
          onClick={() => setOpen(true)}
        >
          Add Inventory
        </Button>
      </div>

      {/* Inventory List */}
      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">
              {it.name || it.medicine_id} – {it.quantity}
            </div>
            <div className="text-sm text-emerald-700">
              Batch: {it.batch_number} • Expiry: {it.expiry_date}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md p-5 space-y-4">
            <h2 className="text-xl font-semibold text-emerald-900">
              Add Inventory
            </h2>

            {/* Medicine select */}
            {medicines.length ? (
              <select
                className="w-full border rounded p-2"
                value={form.medicine_id}
                onChange={(e) =>
                  setForm({ ...form, medicine_id: e.target.value })
                }
              >
                <option value="">Select medicine</option>
                {medicines.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-rose-600">
                  No medicines found. Add one first.
                </div>
                <Button
                  className="border border-emerald-700 text-emerald-700"
                  onClick={() => navigate('/admin/pharmacy/medicines')}
                >
                  Add Medicine
                </Button>
              </div>
            )}

            <Input
              placeholder="Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value })
              }
            />

            <Input
              placeholder="Batch Number"
              value={form.batch_number}
              onChange={(e) =>
                setForm({ ...form, batch_number: e.target.value })
              }
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-emerald-700"
                onClick={handleAdd}
                disabled={!form.medicine_id}
              >
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}
    </ConsoleShell>
  );
}
