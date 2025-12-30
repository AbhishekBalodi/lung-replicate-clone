import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const API_ROOT = (import.meta as any).env.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

type RoomAllotment = { id:number; room_id?: number; room_number?: string; patient_name?: string; from_date?: string; to_date?: string };

export default function RoomsAlloted(){
  const [items,setItems]=useState<RoomAllotment[]>([]);
  const load = async()=>{
    try{
      const res = await api.apiGet(`${API_ROOT}/rooms/allotments`);
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); setItems(js.items||[]);
    } catch (err: unknown) { const e = err as Error; toast.error('Failed to load: ' + (e?.message ?? String(err))); }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Alloted Rooms</h1>
      <div className="mt-4 space-y-3">
        {items.map(it=> (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">Room: {it.room_number || it.room_id}</div>
            <div className="text-sm text-emerald-700">Patient: {it.patient_name} • From: {it.from_date}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}