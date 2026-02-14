import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

type Room = {
  id: number;
  room_number: string;
  type?: string;
};

export default function NewAllotment() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({
    patient_id: '',
    patient_name: '',
    emergency_contact: '',
    doctor_id: '',
    room_id: '',
    room_type: '',
    department: '',
    special_requirements: '',
    allotment_date: '',
    expected_discharge_date: '',
    purpose: '',
    payment_method: '',
    insurance_details: '',
    notes: '',
  });

  const loadRooms = async () => {
    try {
      const res = await apiFetch('/api/rooms');
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');
      setRooms(js.items || []);
    } catch (err: unknown) {
      const e = err as Error;
      toast.error('Failed to load rooms: ' + (e?.message ?? String(err)));
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const submit = async () => {
    if (!form.patient_id || !form.room_id || !form.allotment_date) {
      return toast.error('Patient ID, Room, and Allotment Date are required');
    }

    try {
      const res = await apiFetch('/api/rooms/allotments', { method: 'POST', body: JSON.stringify(form) });
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');
      toast.success('Room allotment created');
      navigate('/admin/rooms/alloted');
    } catch (err: unknown) {
      const e = err as Error;
      toast.error('Error: ' + (e?.message ?? String(err)));
    }
  };

  return (
    <ConsoleShell>
      <div className="space-y-6 max-w-6xl">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate('/admin/rooms/alloted')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">New Room Allotment</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Room Allotment Details</CardTitle>
            <CardDescription>
              Assign a room to a patient. Fill in all required information below.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">

            {/* Patient + Room Info */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Patient Information</h3>

                <Input
                  placeholder="Patient ID"
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                />

                <Input
                  placeholder="Patient Name"
                  value={form.patient_name}
                  onChange={(e) =>
                    setForm({ ...form, patient_name: e.target.value })
                  }
                />

                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, doctor_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attending doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Dr. Emily Chen</SelectItem>
                    <SelectItem value="2">Dr. Michael Brown</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Emergency Contact"
                  value={form.emergency_contact}
                  onChange={(e) =>
                    setForm({ ...form, emergency_contact: e.target.value })
                  }
                />
              </div>

              {/* Room Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Room Information</h3>

                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, room_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room number" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.room_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, room_type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="semi-private">Semi-Private</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="icu">ICU</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, department: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="pulmonology">Pulmonology</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Special requirements"
                  value={form.special_requirements}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      special_requirements: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Allotment + Billing */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Allotment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Allotment Details</h3>

                <Input
                  type="date"
                  value={form.allotment_date}
                  onChange={(e) =>
                    setForm({ ...form, allotment_date: e.target.value })
                  }
                />

                <Input
                  type="date"
                  value={form.expected_discharge_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      expected_discharge_date: e.target.value,
                    })
                  }
                />

                <Textarea
                  placeholder="Purpose of admission"
                  value={form.purpose}
                  onChange={(e) =>
                    setForm({ ...form, purpose: e.target.value })
                  }
                />
              </div>

              {/* Billing Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Billing Information</h3>

                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, payment_method: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Insurance details (if applicable)"
                  value={form.insurance_details}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      insurance_details: e.target.value,
                    })
                  }
                />

                <Textarea
                  placeholder="Additional notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            Create Allotment
          </Button>
        </div>

      </div>
    </ConsoleShell>
  );
}
