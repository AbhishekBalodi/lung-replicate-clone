import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type Room = { id: number; room_number: string; type?: string; status?: string };

const API_ROOT = (import.meta as any).env.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

export default function NewAllotment(){
  const [rooms,setRooms]=useState<Room[]>([]);
  const [form,setForm]=useState({ room_id:'', patient_name:'', doctor_id:'', from_date:'', to_date:'' });

  const loadRooms = async()=>{
    try{ const res = await api.apiGet(`${API_ROOT}/rooms`); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); setRooms(js.items||[]);} catch (err: unknown){ const e = err as Error; toast.error('Failed to load rooms: '+(e?.message ?? String(err))); } }

  const handleAdd = async()=>{
    if(!form.room_id||!form.from_date) return toast.error('room and from_date required');
    try{ const res = await api.apiPost(`${API_ROOT}/rooms/allotments`, form); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); toast.success('Allotment created'); setForm({ room_id:'', patient_name:'', doctor_id:'', from_date:'', to_date:'' }); } catch (err: unknown){ const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); } }

  useEffect(()=>{ loadRooms(); },[]);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">New Room Allotment</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input placeholder="Room ID" value={form.room_id} onChange={(e)=>setForm({...form,room_id:e.target.value})} />
          <Input placeholder="Patient Name" value={form.patient_name} onChange={(e)=>setForm({...form,patient_name:e.target.value})} />
          <Input placeholder="Doctor ID" value={form.doctor_id} onChange={(e)=>setForm({...form,doctor_id:e.target.value})} />
          <Input placeholder="From (YYYY-MM-DD HH:mm)" value={form.from_date} onChange={(e)=>setForm({...form,from_date:e.target.value})} />
          <Input placeholder="To (YYYY-MM-DD HH:mm)" value={form.to_date} onChange={(e)=>setForm({...form,to_date:e.target.value})} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd}>Create Allotment</Button>
      </Card>
    </ConsoleShell>
  );
}