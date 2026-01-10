import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const API_ROOT = (import.meta as any).env.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

type RoomAllotment = {
  id: number;
  allotment_code?: string;
  patient_name?: string;
  patient_code?: string;
  room_number?: string;
  room_type?: string;
  department?: string;
  allotment_date?: string;
  status?: 'Occupied' | 'Discharged';
  doctor_name?: string;
};

export default function RoomsAlloted() {
  const [items, setItems] = useState<RoomAllotment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.apiGet(`${API_ROOT}/rooms/allotments`);
      const js = await res.json();
      if (!res.ok) throw new Error(js?.error || 'Failed');
      setItems(js.items || []);
    } catch (err: unknown) {
      const e = err as Error;
      toast.error('Failed to load: ' + (e?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = items.length;
  const occupied = items.filter(i => i.status === 'Occupied').length;
  const available = Math.max(0, 120 - occupied); // mock total rooms
  const occupancyRate = total ? Math.round((occupied / 120) * 100) : 0;

  return (
    <ConsoleShell>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Alloted Rooms</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Allotment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card><CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Total Rooms</div>
            <div className="text-2xl font-bold">120</div>
          </CardContent></Card>

          <Card><CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Occupied</div>
            <div className="text-2xl font-bold">{occupied}</div>
          </CardContent></Card>

          <Card><CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-2xl font-bold">{available}</div>
          </CardContent></Card>

          <Card><CardContent className="p-5">
            <div className="text-sm text-muted-foreground">Occupancy Rate</div>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
          </CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search by patient, room..."
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dec 31, 2025 - Dec 31, 2025
          </Button>

          <Select>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="semi">Semi-Private</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="px-4 py-3">Allotment ID</th>
                  <th>Patient</th>
                  <th>Room</th>
                  <th>Department</th>
                  <th>Allotment Date</th>
                  <th>Status</th>
                  <th>Doctor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-4 text-muted-foreground">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} className="p-4 text-muted-foreground">No records found</td></tr>
                ) : (
                  items.map(it => (
                    <tr key={it.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">
                        {it.allotment_code || `RA-${it.id}`}
                      </td>
                      <td>
                        <div>{it.patient_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {it.patient_code}
                        </div>
                      </td>
                      <td>
                        <div>{it.room_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {it.room_type}
                        </div>
                      </td>
                      <td>{it.department}</td>
                      <td>{it.allotment_date}</td>
                      <td>
                        {it.status === 'Occupied' ? (
                          <Badge>Occupied</Badge>
                        ) : (
                          <Badge variant="secondary">Discharged</Badge>
                        )}
                      </td>
                      <td>{it.doctor_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

      </div>
    </ConsoleShell>
  );
}
