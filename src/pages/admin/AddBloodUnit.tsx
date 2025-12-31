import { useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Droplet } from 'lucide-react';

export default function AddBloodUnit() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    blood_type: '',
    units: '',
    donor_name: '',
    donor_id: '',
    collection_date: '',
    expiry_date: '',
    location: '',
    batch_number: '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.blood_type || !form.units || !form.collection_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Blood unit added successfully');
    setIsSubmitting(false);
    navigate('/admin/blood-bank/stock');
  };

  return (
    <ConsoleShell>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/blood-bank/stock')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Blood Unit</h1>
            <p className="text-muted-foreground">Register a new blood unit to the inventory</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-red-500" />
                Blood Unit Details
              </CardTitle>
              <CardDescription>Enter the details of the blood unit being added</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Blood Type and Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Blood Type *</Label>
                  <Select value={form.blood_type} onValueChange={(v) => handleChange('blood_type', v)}>
                    <SelectTrigger id="blood_type">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="units">Units *</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    placeholder="Enter number of units"
                    value={form.units}
                    onChange={(e) => handleChange('units', e.target.value)}
                  />
                </div>
              </div>

              {/* Donor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="donor_name">Donor Name</Label>
                  <Input
                    id="donor_name"
                    placeholder="Enter donor name"
                    value={form.donor_name}
                    onChange={(e) => handleChange('donor_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donor_id">Donor ID</Label>
                  <Input
                    id="donor_id"
                    placeholder="Enter donor ID"
                    value={form.donor_id}
                    onChange={(e) => handleChange('donor_id', e.target.value)}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collection_date">Collection Date *</Label>
                  <Input
                    id="collection_date"
                    type="date"
                    value={form.collection_date}
                    onChange={(e) => handleChange('collection_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => handleChange('expiry_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Storage Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Storage Location</Label>
                  <Select value={form.location} onValueChange={(v) => handleChange('location', v)}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select storage location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Refrigerator 1">Refrigerator 1</SelectItem>
                      <SelectItem value="Refrigerator 2">Refrigerator 2</SelectItem>
                      <SelectItem value="Refrigerator 3">Refrigerator 3</SelectItem>
                      <SelectItem value="Freezer 1">Freezer 1</SelectItem>
                      <SelectItem value="Freezer 2">Freezer 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch_number">Batch Number</Label>
                  <Input
                    id="batch_number"
                    placeholder="Enter batch number"
                    value={form.batch_number}
                    onChange={(e) => handleChange('batch_number', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes..."
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Adding...' : 'Add Blood Unit'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/blood-bank/stock')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </ConsoleShell>
  );
}
