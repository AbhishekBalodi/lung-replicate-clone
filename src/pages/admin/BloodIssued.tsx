import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type Issued = { id:number; blood_group_id?: number; group_name?: string; rh_factor?: string; units?: number; issued_to_name?: string; issued_to_contact?: string; issued_at?: string };

export default function BloodIssued(){
  const [items,setItems]=useState<Issued[]>([]);
  const [groups,setGroups]=useState<any[]>([]);
  const [form,setForm]=useState<{ blood_group_id:string; units:string; issued_to_name:string; issued_to_contact:string }>( { blood_group_id:'', units:'', issued_to_name:'', issued_to_contact:'' } );

  const load = async()=>{
    try{
      const [res1, res2] = await Promise.all([api.apiGet('/api/blood-bank/issued'), api.apiGet('/api/blood-bank/groups')]);
      const js1 = await res1.json(); if(!res1.ok) throw new Error(js1?.error||'Failed issued');
      const js2 = await res2.json(); if(!res2.ok) throw new Error(js2?.error||'Failed groups');
      setItems(js1.items||[]);
      setGroups(js2.items||[]);
    }catch(err){ const e = err as Error; toast.error('Failed to load: '+(e?.message ?? String(err))); }
  }

  const handleAdd = async()=>{
    if(!form.blood_group_id) return toast.error('Select blood group');
    if(!form.units) return toast.error('Enter units');
    try{
      const body = { blood_group_id: Number(form.blood_group_id), units: Number(form.units), issued_to_name: form.issued_to_name, issued_to_contact: form.issued_to_contact };
      const res = await api.apiPost('/api/blood-bank/issued', body);
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      toast.success('Issued recorded'); setForm({ blood_group_id:'', units:'', issued_to_name:'', issued_to_contact:'' }); load();
    }catch(err){ const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Blood Issued</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <select className="p-2 border rounded" value={form.blood_group_id} onChange={(e)=>setForm({...form,blood_group_id:e.target.value})}>
            <option value="">Select Group</option>
            {groups.map(g=> (<option key={g.id} value={g.id}>{g.group_name}{g.rh_factor||''}</option>))}
          </select>
          <Input placeholder="Units (e.g., 1.0)" value={form.units} onChange={(e)=>setForm({...form,units:e.target.value})} />
          <Input placeholder="Issued To (name)" value={form.issued_to_name} onChange={(e)=>setForm({...form,issued_to_name:e.target.value})} />
          <Input placeholder="Contact" value={form.issued_to_contact} onChange={(e)=>setForm({...form,issued_to_contact:e.target.value})} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd}>Record Issue</Button>
      </Card>

      <div className="mt-4 space-y-3">
        {items.map(it=> (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">{it.group_name || 'Group'} {it.rh_factor||''} • {it.units} units</div>
            <div className="text-sm text-emerald-700">To: {it.issued_to_name} {it.issued_to_contact} • {it.issued_at}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}
