import { useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplet, AlertCircle, CheckCircle2 } from 'lucide-react';

const availableStock = [
  { type: 'A+', units: 12 },
  { type: 'A-', units: 4 },
  { type: 'B+', units: 8 },
  { type: 'B-', units: 2 },
  { type: 'AB+', units: 3 },
  { type: 'AB-', units: 1 },
  { type: 'O+', units: 15 },
  { type: 'O-', units: 5 },
];

export default function IssueBlood() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    blood_type: '',
    units: '',
    patient_name: '',
    patient_id: '',
    department: '',
    purpose: '',
    priority: 'normal',
    issued_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const selectedStock = availableStock.find(s => s.type === form.blood_type);
  const hasEnoughStock = selectedStock && Number(form.units) <= selectedStock.units;

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.blood_type || !form.units || !form.patient_name || !form.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!hasEnoughStock) {
      toast.error('Insufficient blood stock for this request');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Blood issued successfully');
    setIsSubmitting(false);
    navigate('/admin/blood-bank/issued');
  };

  return (
    <ConsoleShell>
      <div className="space-y-5 max-w-2xl mx-auto">

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Droplet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">How Blood Bank Works</p>
              <p className="text-[11px] text-slate-500">Manage blood inventory, donors, collections, and issuance</p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/blood-bank/issued')} className="rounded-full border-slate-200 bg-white shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Issue Blood</h1>
            <p className="text-sm text-slate-500">Issue blood units to a patient</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm">
          {['Blood Stock', 'Blood Donor', 'Blood Issued', 'Add Blood Unit', 'Issue Blood'].map((item, index) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${index === 4 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Stock Overview */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-800">Available Blood Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableStock.map((stock) => (
                <Badge 
                  key={stock.type} 
                  variant={stock.units <= 2 ? 'destructive' : stock.units <= 5 ? 'secondary' : 'default'}
                  className="text-sm"
                >
                  {stock.type}: {stock.units} units
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Droplet className="h-5 w-5 text-rose-500" />
                Issue Details
              </CardTitle>
              <CardDescription className="text-slate-500">Fill in the details for blood issuance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Blood Type and Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Blood Type *</Label>
                  <Select value={form.blood_type} onValueChange={(v) => handleChange('blood_type', v)}>
                    <SelectTrigger id="blood_type">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStock.map((stock) => (
                        <SelectItem key={stock.type} value={stock.type}>
                          {stock.type} ({stock.units} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="units">Units Required *</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    placeholder="Enter number of units"
                    value={form.units}
                    onChange={(e) => handleChange('units', e.target.value)}
                  />
                  {form.blood_type && form.units && (
                    <div className="flex items-center gap-1.5 text-xs">
                      {hasEnoughStock ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-600">Stock available</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-red-600">Insufficient stock</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_name">Patient Name *</Label>
                  <Input
                    id="patient_name"
                    placeholder="Enter patient name"
                    value={form.patient_name}
                    onChange={(e) => handleChange('patient_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient_id">Patient ID</Label>
                  <Input
                    id="patient_id"
                    placeholder="Enter patient ID"
                    value={form.patient_id}
                    onChange={(e) => handleChange('patient_id', e.target.value)}
                  />
                </div>
              </div>

              {/* Department and Purpose */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={form.department} onValueChange={(v) => handleChange('department', v)}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="Oncology">Oncology</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="General Ward">General Ward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Surgery, Emergency Transfusion"
                    value={form.purpose}
                    onChange={(e) => handleChange('purpose', e.target.value)}
                  />
                </div>
              </div>

              {/* Priority and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => handleChange('priority', v)}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issued_date">Issue Date</Label>
                  <Input
                    id="issued_date"
                    type="date"
                    value={form.issued_date}
                    onChange={(e) => handleChange('issued_date', e.target.value)}
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
                <Button type="submit" disabled={isSubmitting || !hasEnoughStock} className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm hover:opacity-95">
                  <Droplet className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Processing...' : 'Issue Blood'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/blood-bank/issued')} className="rounded-full border-slate-200 bg-white">
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
