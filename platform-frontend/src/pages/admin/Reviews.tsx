import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type Review = { id: number; resource_type: string; resource_id: string | number; rating: number; comment?: string | null };

export default function Reviews(){
  const [items,setItems]=useState<Review[]>([]);
  const [form,setForm]=useState<{ resource_type:string; resource_id:string; rating:string; comment:string }>({ resource_type:'doctor', resource_id:'', rating:'5', comment:'' });

  const load = async()=>{ try{ const res = await api.apiGet('/api/reviews'); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); setItems(js.items||[]); } catch (err: unknown) { const e = err as Error; toast.error('Failed to load: '+(e?.message ?? String(err))); } }
  const handleAdd = async()=>{ if(!form.resource_type||!form.resource_id) return toast.error('resource required'); try{ const res = await api.apiPost('/api/reviews',{ ...form, rating: Number(form.rating) }); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); toast.success('Added'); setForm({ resource_type:'doctor', resource_id:'', rating:'5', comment:'' }); load(); } catch (err: unknown) { const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); } }

  useEffect(()=>{ load(); },[]);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Reviews</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input placeholder="Resource Type (doctor/hospital/service)" value={form.resource_type} onChange={(e)=>setForm({...form,resource_type:e.target.value})} />
          <Input placeholder="Resource ID" value={form.resource_id} onChange={(e)=>setForm({...form,resource_id:e.target.value})} />
          <Input placeholder="Rating 1-5" value={form.rating} onChange={(e)=>setForm({...form,rating:e.target.value})} />
          <Input placeholder="Comment" value={form.comment} onChange={(e)=>setForm({...form,comment:e.target.value})} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd}>Add Review</Button>
      </Card>

      <div className="mt-4 space-y-3">
        {items.map(it=> (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">{it.resource_type}#{it.resource_id} • {it.rating}★</div>
            <div className="text-sm text-emerald-700">{it.comment}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}