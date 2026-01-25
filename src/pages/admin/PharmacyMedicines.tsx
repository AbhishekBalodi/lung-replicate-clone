import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type Medicine = {
  id: number;
  name: string;
  brand?: string | null;
  unit_price?: string | number;
};

export default function PharmacyMedicines() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    unit_price: '',
  });

  const load = async () => {
    try {
      const res = await api.apiGet('/api/pharmacy/medicines');
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');
      setItems(js.items || []);
    } catch (err: unknown) {
      const e = err as Error;
      toast.error('Failed to load: ' + (e?.message ?? String(err)));
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error('Name required');

    try {
      const res = await api.apiPost('/api/pharmacy/medicines', form);
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');

      toast.success('Medicine added');
      setOpen(false);
      setForm({ name: '', brand: '', unit_price: '' });
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
        Pharmacy - Medicines
      </h1>

      {/* Add Button */}
      <div className="mt-4">
        <Button
          className="bg-emerald-700"
          onClick={() => setOpen(true)}
        >
          Add Medicine
        </Button>
      </div>

      {/* Medicines List */}
      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">
              {it.name} {it.brand ? `• ${it.brand}` : ''}
            </div>
            <div className="text-sm text-emerald-700">
              Price: {it.unit_price}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md p-5 space-y-4">
            <h2 className="text-xl font-semibold text-emerald-900">
              Add Medicine
            </h2>

            <Input
              placeholder="Medicine Name *"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <Input
              placeholder="Brand"
              value={form.brand}
              onChange={(e) =>
                setForm({ ...form, brand: e.target.value })
              }
            />

            <Input
              placeholder="Unit Price"
              type="number"
              value={form.unit_price}
              onChange={(e) =>
                setForm({ ...form, unit_price: e.target.value })
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
