import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type Donor = { id: number; name: string; phone?: string | null; email?: string | null; blood_group_id?: number | string; group_name?: string; rh_factor?: string };

const API_ROOT = (import.meta as any).env.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';

export default function BloodDonors(){
  const [items,setItems]=useState<Donor[]>([]);
  const [form,setForm]=useState<{ name:string; phone:string; email:string; blood_group_id:string }>({ name:'', phone:'', email:'', blood_group_id:'' });

  const load = async()=>{
    try{
      const res = await api.apiGet(`${API_ROOT}/blood-bank/donors`);
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); setItems(js.items||[]);
    } catch (err: unknown) { const e = err as Error; toast.error('Failed to load: '+(e?.message ?? String(err))); }
  }

  const handleAdd = async()=>{
    if(!form.name.trim()) return toast.error('Name required');
    try{
      const res = await api.apiPost(`${API_ROOT}/blood-bank/donors`, form);
      const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); toast.success('Added'); setForm({ name:'', phone:'', email:'', blood_group_id:'' }); load();
    } catch (err: unknown) { const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Blood Donors</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
          <Input placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
          <Input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
          <Input placeholder="Blood Group ID" value={form.blood_group_id} onChange={(e)=>setForm({...form,blood_group_id:e.target.value})} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd}>Add Donor</Button>
      </Card>

      <div className="mt-4 space-y-3">
        {items.map(it=> (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">{it.name} - {it.phone}</div>
            <div className="text-sm text-emerald-700">Blood Group: {it.group_name}{it.rh_factor||''}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}