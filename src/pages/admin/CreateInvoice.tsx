import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Item = {
  description: string;
  quantity: number;
  unit_price: number;
};

export default function CreateInvoice() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ]);

  const addItem = () =>
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);

  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const updateItem = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const updated = [...items];
    updated[index][field] =
      field === 'description' ? String(value) : Number(value);
    setItems(updated);
  };

  const subtotal = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const submit = () => {
    if (!items.some(i => i.description)) {
      toast.error('Add at least one item');
      return;
    }

    toast.success('Invoice created (UI only)');
    navigate('/admin/billing');
  };

  return (
    <ConsoleShell>
      <div className="space-y-6 max-w-6xl">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/billing')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Invoice</h1>
            <p className="text-muted-foreground">
              Create a new invoice for a patient.
            </p>
          </div>
        </div>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Basic invoice information</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Invoice Number</Label>
              <Input value="INV-XXX" disabled />
            </div>
            <div>
              <Label>Invoice Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" />
            </div>

            <div className="md:col-span-3">
              <Label>Invoice Type</Label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Invoice</SelectItem>
                  <SelectItem value="insurance">Insurance Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Select patient for billing</CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder="Search patient..." />
            <p className="text-sm text-muted-foreground mt-2">
              (Patient search UI will go here)
            </p>
          </CardContent>
        </Card>

        {/* Items & Services */}
        <Card>
          <CardHeader>
            <CardTitle>Items & Services</CardTitle>
            <CardDescription>Services billed to patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-3 items-end"
              >
                <div className="col-span-5">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(idx, 'description', e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, 'quantity', e.target.value)
                    }
                  />
                </div>

                <div className="col-span-3">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(idx, 'unit_price', e.target.value)
                    }
                  />
                </div>

                <div className="col-span-1 text-sm">
                  ₹{item.quantity * item.unit_price}
                </div>

                <div className="col-span-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>

          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="space-y-2 text-right">
            <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
            <div>Tax (8%): ₹{tax.toFixed(2)}</div>
            <div className="text-lg font-bold">
              Total: ₹{total.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Notes & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Internal or patient notes..." />
            </div>

            <div>
              <Label>Payment Terms</Label>
              <Select defaultValue="net30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due">Due on Receipt</SelectItem>
                  <SelectItem value="net15">Net 15 Days</SelectItem>
                  <SelectItem value="net30">Net 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={submit}>Create Invoice</Button>
          <Button variant="outline">Save as Draft</Button>
        </div>

      </div>
    </ConsoleShell>
  );
}
