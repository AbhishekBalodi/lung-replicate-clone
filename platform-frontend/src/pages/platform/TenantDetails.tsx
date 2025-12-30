import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function TenantDetails(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'' });
  const [editingUserId, setEditingUserId] = useState<number|null>(null);
  const [userForm, setUserForm] = useState({ email:'', name:'', phone:'', password:'' });

  const load = async()=>{
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/tenants/${id}`);
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      setTenant(js);
      setForm({ name: js.tenant.name || '', email: js.tenant.email || '', phone: js.tenant.phone || '', address: js.tenant.address || '' });
    }catch(err){ const e = err as Error; toast.error('Failed to load: '+(e?.message ?? String(err))); }
  }

  useEffect(()=>{ if(id) load(); },[id]);

  const handleSaveTenant = async()=>{
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/tenants/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) });
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      toast.success('Saved'); setEditing(false); load();
    }catch(err){ const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); }
  }

  const startEditUser = (u:any)=>{ setEditingUserId(u.id); setUserForm({ email: u.email || '', name: u.name || '', phone: u.phone || '', password: '' }); }
  const cancelEditUser = ()=>{ setEditingUserId(null); setUserForm({ email:'', name:'', phone:'', password:'' }); }
  const saveUser = async(userId:number)=>{
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/tenants/${id}/users/${userId}`, { method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(userForm) });
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      toast.success('User updated'); cancelEditUser(); load();
    }catch(err){ const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); }
  }

  if(!tenant) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tenant Details</h1>
        <div>
          <Button onClick={()=>navigate('/dashboard')}>Back</Button>
        </div>
      </div>

      <Card className="p-4 mt-4">
        {!editing ? (
          <div>
            <div className="font-semibold text-lg">{tenant.tenant.name}</div>
            <div className="text-sm text-muted-foreground">{tenant.tenant.email}</div>
            <div className="mt-2">Status: <strong>{tenant.tenant.status}</strong></div>
            <div className="mt-2">Primary Domain: {tenant.domains?.find((d:any)=>d.is_primary)?.domain || '—'}</div>
            <div className="mt-3">
              <Button className="mr-2" onClick={()=>setEditing(true)}>Edit Tenant</Button>
              <Button variant="secondary" onClick={()=>navigate(`/tenants/${id}/settings`)}>Settings</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input value={form.name} onChange={(e:any)=>setForm({...form,name:e.target.value})} placeholder="Name" />
            <Input value={form.email} onChange={(e:any)=>setForm({...form,email:e.target.value})} placeholder="Email" />
            <Input value={form.phone||''} onChange={(e:any)=>setForm({...form,phone:e.target.value})} placeholder="Phone" />
            <Input value={form.address||''} onChange={(e:any)=>setForm({...form,address:e.target.value})} placeholder="Address" />
            <div className="col-span-2 mt-2">
              <Button className="mr-2" onClick={handleSaveTenant}>Save</Button>
              <Button variant="ghost" onClick={()=>setEditing(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>

      <h2 className="text-lg font-semibold mt-6">Users</h2>
      <div className="mt-3 space-y-3">
        {tenant.users.map((u:any)=> (
          <Card key={u.id} className="p-3 flex items-start justify-between">
            <div>
              <div className="font-medium">{u.name} <span className="text-sm text-muted-foreground">({u.role})</span></div>
              <div className="text-sm text-muted-foreground">{u.email}</div>
            </div>
            <div>
              {editingUserId === u.id ? (
                <div className="space-y-2">
                  <Input value={userForm.name} onChange={(e:any)=>setUserForm({...userForm,name:e.target.value})} placeholder="Name" />
                  <Input value={userForm.email} onChange={(e:any)=>setUserForm({...userForm,email:e.target.value})} placeholder="Email" />
                  <Input value={userForm.phone||''} onChange={(e:any)=>setUserForm({...userForm,phone:e.target.value})} placeholder="Phone" />
                  <Input type="password" value={userForm.password} onChange={(e:any)=>setUserForm({...userForm,password:e.target.value})} placeholder="New password (leave blank to keep)" />
                  <div className="flex gap-2"><Button onClick={()=>saveUser(u.id)}>Save</Button><Button variant="ghost" onClick={cancelEditUser}>Cancel</Button></div>
                </div>
              ) : (
                <div className="flex gap-2"><Button onClick={()=>startEditUser(u)}>Edit</Button></div>
              )}
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
