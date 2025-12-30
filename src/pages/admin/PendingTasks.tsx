import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

type Task = { id:number; title:string; description?:string; due_date?:string|null; priority?:string; status?:string; assigned_to_user_id?:number };

export default function PendingTasks(){
  const [items,setItems]=useState<Task[]>([]);
  const [form,setForm]=useState<{ title:string; description:string; due_date:string; priority:string }>({ title:'', description:'', due_date:'', priority:'medium' });

  const load = async()=>{ try{ const res = await api.apiGet('/api/tasks'); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); setItems(js.items||[]); } catch (err: unknown) { const e = err as Error; toast.error('Failed to load: '+(e?.message ?? String(err))); } }
  const handleAdd = async()=>{ if(!form.title) return toast.error('Title required'); try{ const res = await api.apiPost('/api/tasks', { ...form, due_date: form.due_date || null }); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); toast.success('Added'); setForm({ title:'', description:'', due_date:'', priority:'medium' }); load(); } catch (err: unknown) { const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); } }
  const handleUpdate = async(id:number, update:Partial<Task>)=>{ try{ const res = await api.apiPut(`/api/tasks/${id}`, update); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); toast.success('Updated'); load(); } catch (err: unknown) { const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); } }
  const handleDelete = async(id:number)=>{ if(!confirm('Delete task?')) return; try{ const res = await api.apiDelete(`/api/tasks/${id}`); const js=await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); toast.success('Deleted'); load(); } catch (err: unknown) { const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); } }

  useEffect(()=>{ load(); },[]);

  return (
    <ConsoleShell>
      <h1 className="text-2xl font-semibold text-emerald-900">Pending Tasks</h1>

      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <Input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
          <Input type="datetime-local" placeholder="Due date" value={form.due_date} onChange={(e)=>setForm({...form,due_date:e.target.value})} />
          <select className="p-2 border rounded" value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <Textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
        <div className="mt-3">
          <Button className="bg-emerald-700" onClick={handleAdd}>Add Task</Button>
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        {items.map(it=> (
          <Card key={it.id} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-emerald-900">{it.title} <span className="text-sm text-muted-foreground">• {it.priority}</span></div>
                <div className="text-sm text-emerald-700">{it.description}</div>
                <div className="text-xs text-muted-foreground mt-1">Due: {it.due_date || '—'}</div>
              </div>
              <div className="flex gap-2 items-center">
                <select value={it.status} onChange={(e)=>handleUpdate(it.id,{ status: e.target.value })} className="p-2 border rounded">
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="destructive" onClick={()=>handleDelete(it.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ConsoleShell>
  );
}
