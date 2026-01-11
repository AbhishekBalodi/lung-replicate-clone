import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function InvoiceDetail(){
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [amount, setAmount] = useState('');

  const load = async()=>{
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/billing/invoices/${id}`);
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      setInvoice(js);
    }catch(err){ const e = err as Error; toast.error('Failed to load invoice: '+e.message); }
  }

  useEffect(()=>{ if(id) load(); },[id]);

  const pay = async()=>{
    if(!amount) return toast.error('Enter amount');
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/billing/payments`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ invoice_id: id, amount: parseFloat(amount) }) });
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      toast.success('Payment recorded'); load(); setAmount('');
    }catch(err){ const e = err as Error; toast.error('Payment failed: '+e.message); }
  }

  if(!invoice) return <div className="p-6">Loading...</div>;

  return (
    <ConsoleShell>
      <div className="p-6">
        <h1 className="text-xl font-bold">Invoice {invoice.invoice.invoice_number}</h1>
        <Card className="p-4 mt-4">
          <div>Patient: {invoice.invoice.patient_name || invoice.invoice.patient_email}</div>
          <div>Total: ₹{invoice.invoice.total}</div>
          <div>Status: {invoice.invoice.status}</div>
          <div className="mt-3">Items:
            <ul className="mt-2 list-disc pl-6">
              {invoice.items.map((it:any)=>(<li key={it.id}>{it.description} — {it.quantity} x {it.unit_price} = {it.line_total}</li>))}
            </ul>
          </div>
          <div className="mt-4">
            <input type="number" placeholder="Amount" value={amount} onChange={(e:any)=>setAmount(e.target.value)} className="border p-2 mr-2" />
            <Button onClick={pay}>Record Payment</Button>
          </div>
          <div className="mt-4">Payments:
            <ul className="mt-2 list-disc pl-6">
              {invoice.payments.map((p:any)=>(<li key={p.id}>₹{p.amount} at {p.paid_at}</li>))}
            </ul>
          </div>
        </Card>
      </div>
    </ConsoleShell>
  );
}
