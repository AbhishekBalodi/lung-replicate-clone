import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type Room = { id: number; room_number: string; room_type_id?: number | string; room_type_name?: string | null; bed_count?: number; status?: string };

export default function Rooms(){
  const [rooms,setRooms]=useState<Room[]>([]);
  const [form,setForm]=useState<{ room_number: string; room_type_id: string; bed_count: string }>({ room_number:'', room_type_id:'', bed_count:'1' });

  const load = async()=>{ try{ const res = await api.apiGet('/api/rooms'); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); setRooms(js.items||[]); } catch(err: unknown){ const e = err as Error; toast.error('Failed to load rooms: '+(e?.message ?? String(err))); } }
  const handleAdd = async()=>{ if(!form.room_number.trim()) return toast.error('Room number required'); try{ const res = await api.apiPost('/api/rooms', { ...form, bed_count: Number(form.bed_count) }); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); toast.success('Added'); setForm({ room_number:'', room_type_id:'', bed_count:'1' }); load(); } catch(err: unknown){ const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); } }
  useEffect(()=>{ load(); },[]);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Rooms</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input placeholder="Room Number" value={form.room_number} onChange={(e)=>setForm({...form,room_number:e.target.value})} />
          <Input placeholder="Room Type ID" value={form.room_type_id} onChange={(e)=>setForm({...form,room_type_id:e.target.value})} />
          <Input placeholder="Bed Count" value={form.bed_count} onChange={(e)=>setForm({...form,bed_count:e.target.value})} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd}>Add Room</Button>
      </Card>

      <div className="mt-4 space-y-3">
        {rooms.map(it=> (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">{it.room_number} • {it.room_type_name || it.room_type_id}</div>
            <div className="text-sm text-emerald-700">Beds: {it.bed_count} • Status: {it.status}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}