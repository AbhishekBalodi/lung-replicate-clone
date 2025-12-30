(async ()=>{
  const base = 'http://localhost:5050';
  try{
    console.log('Listing invoices (should auto-create billing tables)');
    let res = await fetch(`${base}/api/billing/invoices`);
    let js = await res.json(); if(!res.ok){ console.error('list invoices failed', js); process.exit(1); }
    console.log('Invoices returned:', js.invoices?.length || 0);

    const invoiceNumber = 'INV-' + Date.now();
    console.log('Creating invoice', invoiceNumber);
    res = await fetch(`${base}/api/billing/invoices`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ invoice_number: invoiceNumber, patient_name: 'Test Patient', items: [{description:'Consultation', quantity:1, unit_price:500}] }) });
    js = await res.json(); if(!res.ok){ console.error('create invoice failed', js); process.exit(1); }
    console.log('Created invoice id', js.id);

    const invoiceId = js.id;
    console.log('Fetching invoice detail');
    res = await fetch(`${base}/api/billing/invoices/${invoiceId}`); js = await res.json(); if(!res.ok) { console.error('fetch invoice failed', js); process.exit(1); }
    console.log('Invoice total:', js.invoice.total, 'status:', js.invoice.status);

    console.log('Recording payment partial...');
    res = await fetch(`${base}/api/billing/payments`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ invoice_id: invoiceId, amount: 200 }) }); js = await res.json(); if(!res.ok){ console.error('partial payment failed', js); process.exit(1); } else console.log('partial payment recorded');

    res = await fetch(`${base}/api/billing/invoices/${invoiceId}`); js = await res.json(); console.log('After partial paid, status:', js.invoice.status);

    console.log('Recording remaining payment...');
    res = await fetch(`${base}/api/billing/payments`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ invoice_id: invoiceId, amount: Number(js.invoice.total) - 200 }) }); js = await res.json(); if(!res.ok){ console.error('final payment failed', js); process.exit(1); } else console.log('final payment recorded');

    res = await fetch(`${base}/api/billing/invoices/${invoiceId}`); js = await res.json(); console.log('After full payment, status:', js.invoice.status);

    console.log('Listing payments:');
    res = await fetch(`${base}/api/billing/payments`); js = await res.json(); console.log('Payments count:', js.payments?.length || 0);

    console.log('Billing API tests completed successfully');
  }catch(err){ console.error('billing test error', err); process.exit(1); }
})();