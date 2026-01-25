import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Review = {
  id: number;
  resource_type: string;
  resource_id: number;
  patient_user_id?: number | null;
  rating: number;
  comment?: string | null;
  created_at: string;
};

export default function Reviews() {
  const [items, setItems] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    resource_type: '',
    resource_id: '',
    rating: '',
    comment: '',
  });

  // -------- LOAD --------
  const load = async () => {
    try {
      const res = await api.apiGet('/api/reviews');
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');
      setItems(js.items || []);
    } catch (err: any) {
      toast.error('Failed to load reviews: ' + err.message);
    }
  };

  // -------- ADD --------
  const handleAdd = async () => {
    if (!form.resource_type || !form.resource_id || !form.rating) {
      toast.error('All required fields must be filled');
      return;
    }

    try {
      const res = await api.apiPost('/api/reviews', {
        resource_type: form.resource_type,
        resource_id: Number(form.resource_id),
        rating: Number(form.rating),
        comment: form.comment,
      });

      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');

      toast.success('Review added');
      setOpen(false);
      setForm({
        resource_type: '',
        resource_id: '',
        rating: '',
        comment: '',
      });
      load();
    } catch (err: any) {
      toast.error('Failed to add review: ' + err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ConsoleShell>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reviews</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Review</Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Review</DialogTitle>
              <DialogDescription>
                Create a new review
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Resource Type */}
              <div className="space-y-2">
                <Label>Resource Type *</Label>
                <Select
                  value={form.resource_type}
                  onValueChange={(v) =>
                    setForm({ ...form, resource_type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resource ID */}
              <div className="space-y-2">
                <Label>Resource ID *</Label>
                <Input
                  placeholder="Numeric ID"
                  value={form.resource_id}
                  onChange={(e) =>
                    setForm({ ...form, resource_id: e.target.value })
                  }
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Rating (1–5) *</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  placeholder="Enter rating"
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: e.target.value })
                  }
                />
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label>Comment</Label>
                <Input
                  placeholder="Optional comment"
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Save Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* LIST */}
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <Card className="p-4 text-sm text-muted-foreground">
            No reviews yet
          </Card>
        ) : (
          items.map((it) => (
            <Card key={it.id} className="p-3">
              <div className="font-medium">
                {it.resource_type} #{it.resource_id} • {it.rating}★
              </div>
              {it.comment && (
                <div className="text-sm text-muted-foreground">
                  {it.comment}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </ConsoleShell>
  );
}
