(async ()=>{
  const base = process.env.API_BASE_URL || 'http://localhost:5050';
  const ok = (r)=>{ if(!r.ok) return false; return true };
  try{
    console.log('Fetching tenants...');
    let res = await fetch(`${base}/api/tenants`);
    let js = await res.json();
    if(!res.ok){ console.error('Failed to get tenants', js); process.exit(1); }
    const tenants = js.tenants || js;
    if(!tenants || tenants.length === 0){ console.error('No tenants found to test'); process.exit(1); }
    console.log('Found tenants:', tenants.slice(0,3).map(t=>({id:t.id,name:t.name,email:t.email,status:t.status})));

    const tenant = tenants[0];
    console.log('\nFetching tenant details for id', tenant.id);
    res = await fetch(`${base}/api/tenants/${tenant.id}`);
    js = await res.json(); if(!res.ok){ console.error('Failed to fetch tenant', js); process.exit(1); }
    console.log('Tenant details:', {tenant: js.tenant.name, users: js.users?.length||0, domains: js.domains?.length||0});

    // PATCH tenant name
    const newName = (tenant.name || 'Tenant') + ' [test]';
    console.log('\nPatching tenant name ->', newName);
    res = await fetch(`${base}/api/tenants/${tenant.id}`, { method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: newName }) });
    js = await res.json(); if(!res.ok) { console.error('PATCH tenant failed', js); } else { console.log('PATCH tenant succeeded', js); }

    // Re-fetch to confirm
    res = await fetch(`${base}/api/tenants/${tenant.id}`); js = await res.json(); console.log('Tenant name now:', js.tenant.name);

    // Update a user if present
    if(js.users && js.users.length){
      const user = js.users[0];
      console.log('\nUpdating user', user.id, user.email);
      const newEmail = `test+${user.id}@example.com`;
      res = await fetch(`${base}/api/tenants/${tenant.id}/users/${user.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: newEmail, password: 'NewPass123!' }) });
      let rj = await res.json(); if(!res.ok) console.error('PATCH user failed', rj); else console.log('PATCH user ok', rj);

      // Re-fetch users
      res = await fetch(`${base}/api/tenants/${tenant.id}`); js = await res.json(); const updatedUser = js.users.find(u=>u.id===user.id); console.log('Updated user email:', updatedUser.email);
    } else {
      console.log('No users to update for tenant');
    }

    // Add a domain
    const domain = `test-${Date.now()}.example.com`;
    console.log('\nAdding domain', domain);
    res = await fetch(`${base}/api/tenants/${tenant.id}/domains`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ domain, isPrimary: false }) });
    let addJs = await res.json(); if(!res.ok) { console.error('Add domain failed', addJs); } else { console.log('Add domain ok', addJs); }

    // Re-fetch domains to find id
    res = await fetch(`${base}/api/tenants/${tenant.id}`); js = await res.json(); const found = js.domains.find(d=>d.domain===domain);
    if(found){ console.log('Found added domain id', found.id, 'ver_status', found.verification_status);
      console.log('Verifying domain id', found.id);
      res = await fetch(`${base}/api/tenants/${tenant.id}/domains/${found.id}/verify`, { method:'POST' }); let ver = await res.json(); if(!res.ok) console.error('Verify failed', ver); else console.log('Verify result', ver);
    } else {
      console.error('Could not find added domain in tenant domains');
    }

    // Toggle status
    console.log('\nSuspending tenant...');
    res = await fetch(`${base}/api/tenants/${tenant.id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'suspended' }) }); js = await res.json(); if(!res.ok) console.error('Suspend failed', js); else console.log('Suspend success', js);

    console.log('Re-activating tenant...');
    res = await fetch(`${base}/api/tenants/${tenant.id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'active' }) }); js = await res.json(); if(!res.ok) console.error('Activate failed', js); else console.log('Activate success', js);

    console.log('\nAll checks completed successfully.');
  }catch(err){ console.error('Test script error', err); process.exit(1); }
})();
