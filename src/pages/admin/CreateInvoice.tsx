import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function CreateInvoice(){
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [items, setItems] = useState([{description:'Consultation', quantity:1, unit_price:0}]);
  const navigate = useNavigate();

  const addItem = ()=> setItems([...items, {description:'', quantity:1, unit_price:0}]);
  const updateItem = (i, key, val)=>{ const copy = [...items]; copy[i][key]=val; setItems(copy); }
  const removeItem = (i)=>{ const copy=[...items]; copy.splice(i,1); setItems(copy); }

  const handleCreate = async()=>{
    if(!invoiceNumber) return toast.error('Invoice number required');
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/billing/invoices`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ invoice_number: invoiceNumber, patient_name: patientName, items }) });
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      toast.success('Invoice created'); navigate('/admin/billing');
    }catch(err){ const e = err as Error; toast.error('Error creating invoice: '+e.message); }
  }

  return (
    <ConsoleShell>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Create Invoice</h1>
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Invoice Number" value={invoiceNumber} onChange={(e:any)=>setInvoiceNumber(e.target.value)} />
            <Input placeholder="Patient Name / Email" value={patientName} onChange={(e:any)=>setPatientName(e.target.value)} />
          </div>

          <div className="mt-4 space-y-2">
            {items.map((it, idx)=> (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-6 border rounded p-2" placeholder="Description" value={it.description} onChange={(e:any)=>updateItem(idx,'description',e.target.value)} />
                <input type="number" className="col-span-2 border rounded p-2" value={it.quantity} onChange={(e:any)=>updateItem(idx,'quantity',e.target.value)} />
                <input type="number" className="col-span-2 border rounded p-2" value={it.unit_price} onChange={(e:any)=>updateItem(idx,'unit_price',e.target.value)} />
                <div className="col-span-2 flex gap-2"><Button onClick={()=>removeItem(idx)}>Remove</Button></div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={addItem}>Add Item</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </Card>
      </div>
    </ConsoleShell>
  );
}
