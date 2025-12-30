import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type FeedbackItem = { id: number; patient_user_id?: number | null; subject?: string | null; message?: string | null; status?: string };

export default function Feedback(){
  const [items,setItems]=useState<FeedbackItem[]>([]);
  const [form,setForm]=useState<{ patient_user_id:string; subject:string; message:string }>({ patient_user_id:'', subject:'', message:'' });

  const load = async()=>{ try{ const res = await api.apiGet('/api/feedback'); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); setItems(js.items||[]); } catch (err: unknown) { const e = err as Error; toast.error('Failed to load: '+(e?.message ?? String(err))); } }
  const handleAdd = async()=>{ try{ const body = { patient_user_id: form.patient_user_id ? Number(form.patient_user_id) : null, subject: form.subject, message: form.message }; const res = await api.apiPost('/api/feedback', body); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); toast.success('Added'); setForm({ patient_user_id:'', subject:'', message:'' }); load(); } catch (err: unknown) { const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); } }

  useEffect(()=>{ load(); },[]);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Feedback</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input placeholder="Patient User ID (optional)" value={form.patient_user_id} onChange={(e)=>setForm({...form,patient_user_id:e.target.value})} />
          <Input placeholder="Subject" value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})} />
          <Textarea placeholder="Message" value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} />
        </div>
        <Button className="bg-emerald-700" onClick={handleAdd}>Add Feedback</Button>
      </Card>

      <div className="mt-4 space-y-3">
        {items.map(it=> (
          <Card key={it.id} className="p-3">
            <div className="font-medium text-emerald-900">{it.subject || 'No subject'} • {it.status}</div>
            <div className="text-sm text-emerald-700">{it.message}</div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}
