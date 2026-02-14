import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

export default function TenantSettings(){
  const { id } = useParams();
  const [tenant,setTenant]=useState<any>(null);
  const [domainVal,setDomainVal]=useState('');

  const load = async()=>{
    try{
      const res = await apiFetch(`/api/tenants/${id}`);
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      setTenant(js);
    }catch(err){ const e = err as Error; toast.error('Failed to load: '+(e?.message ?? String(err))); }
  }

  useEffect(()=>{ if(id) load(); },[id]);

  const addDomain = async()=>{
    if(!domainVal) return toast.error('Enter domain');
    try{
      const res = await apiFetch(`/api/tenants/${id}/domains`, { method:'POST', body: JSON.stringify({ domain: domainVal, isPrimary: false }) });
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      toast.success('Domain added'); setDomainVal(''); load();
    }catch(err){ const e = err as Error; toast.error('Error: '+(e?.message ?? String(err))); }
  }

  const verifyDomain = async(domainId:number)=>{
    try{
      const res = await apiFetch(`/api/tenants/${id}/domains/${domainId}/verify`, { method: 'POST' });
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

      <h2 className="text-lg font-semibold mt-6">Assets</h2>
      <Card className="p-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Logo */}
          <div className="space-y-2">
            <div className="font-medium">Logo</div>
            {tenant.tenant.logo_url ? (
              <img src={tenant.tenant.logo_url} alt="logo" className="w-32 h-20 object-contain border" />
            ) : (
              <div className="w-32 h-20 border flex items-center justify-center text-sm text-muted-foreground">No logo</div>
            )}
            <input type="file" accept="image/*" onChange={async (e:any)=>{
              const f = e.target.files && e.target.files[0]; if(!f) return;
              const fd = new FormData(); fd.append('file', f); fd.append('assetType', 'logo');
              try{
                const res = await apiFetch(`/api/tenants/${id}/assets`, { method: 'POST', body: fd, headers: {} });
                const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Upload failed');
                toast.success('Logo uploaded'); load();
              }catch(err){ const eerr = err as Error; toast.error('Upload failed: '+(eerr?.message||String(err))); }
            }} />
          </div>

          {/* Doctor photo */}
          <div className="space-y-2">
            <div className="font-medium">Doctor photo</div>
            {tenant.tenant.doctor_photo_url ? (
              <img src={tenant.tenant.doctor_photo_url} alt="doctor" className="w-32 h-32 object-cover border" />
            ) : (
              <div className="w-32 h-32 border flex items-center justify-center text-sm text-muted-foreground">No photo</div>
            )}
            <input type="file" accept="image/*" onChange={async (e:any)=>{
              const f = e.target.files && e.target.files[0]; if(!f) return;
              const fd = new FormData(); fd.append('file', f); fd.append('assetType', 'doctor_photo');
              try{
                const res = await apiFetch(`/api/tenants/${id}/assets`, { method: 'POST', body: fd, headers: {} });
                const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Upload failed');
                toast.success('Doctor photo uploaded'); load();
              }catch(err){ const eerr = err as Error; toast.error('Upload failed: '+(eerr?.message||String(err))); }
            }} />
          </div>

          {/* Hero image */}
          <div className="space-y-2">
            <div className="font-medium">Hero image</div>
            {tenant.tenant.hero_image_url ? (
              <img src={tenant.tenant.hero_image_url} alt="hero" className="w-full h-28 object-cover border" />
            ) : (
              <div className="w-full h-28 border flex items-center justify-center text-sm text-muted-foreground">No hero</div>
            )}
            <input type="file" accept="image/*" onChange={async (e:any)=>{
              const f = e.target.files && e.target.files[0]; if(!f) return;
              const fd = new FormData(); fd.append('file', f); fd.append('assetType', 'hero');
              try{
                const res = await apiFetch(`/api/tenants/${id}/assets`, { method: 'POST', body: fd, headers: {} });
                const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Upload failed');
                toast.success('Hero uploaded'); load();
              }catch(err){ const eerr = err as Error; toast.error('Upload failed: '+(eerr?.message||String(err))); }
            }} />
          </div>
        </div>
      </Card>
    </div>
  );
}