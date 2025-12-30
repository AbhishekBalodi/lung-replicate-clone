import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function TenantSettings(){
  const { id } = useParams();
  const [tenant,setTenant]=useState<any>(null);
  const [domainVal,setDomainVal]=useState('');

  const load = async()=>{
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/tenants/${id}`);
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      setTenant(js);
    }catch(err){ const e = err as Error; toast.error('Failed to load: '+(e?.message ?? String(err))); }
  }

  useEffect(()=>{ if(id) load(); },[id]);

  const addDomain = async()=>{
    if(!domainVal) return toast.error('Enter domain');
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/tenants/${id}/domains`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ domain: domainVal, isPrimary: false }) });
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      toast.success('Domain added'); setDomainVal(''); load();
    }catch(err){ const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); }
  }

  const verifyDomain = async(domainId:number)=>{
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/tenants/${id}/domains/${domainId}/verify`, { method: 'POST' });
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      toast.success('Domain verified (simulated)'); load();
    }catch(err){ const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); }
  }

  if(!tenant) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Tenant Settings</h1>

      <Card className="p-4 mt-4">
        <div className="mb-3">Primary Domain: <strong>{tenant.domains?.find((d:any)=>d.is_primary)?.domain || '—'}</strong></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input placeholder="Add Domain (e.g. example.com)" value={domainVal} onChange={(e:any)=>setDomainVal(e.target.value)} />
          <div><Button onClick={addDomain}>Add Domain</Button></div>
        </div>
      </Card>

      <h2 className="text-lg font-semibold mt-6">Domains</h2>
      <div className="mt-3 space-y-3">
        {tenant.domains.map((d:any)=> (
          <Card key={d.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{d.domain} {d.is_primary ? <span className="text-sm text-muted-foreground">• primary</span> : null}</div>
              <div className="text-sm text-muted-foreground">Status: {d.verification_status || 'pending'}</div>
            </div>
            <div>
              <Button onClick={()=>verifyDomain(d.id)}>Verify</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
