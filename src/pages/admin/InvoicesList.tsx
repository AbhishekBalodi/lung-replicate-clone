import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function InvoicesList(){
  const [invoices, setInvoices] = useState<any[]>([]);
  const navigate = useNavigate();

  const load = async()=>{
    try{
      const res = await fetch(`${api.getApiBaseUrl()}/api/billing/invoices`);
      const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed');
      setInvoices(js.invoices || []);
    }catch(err){ const e = err as Error; toast.error('Failed to load invoices: '+e.message); }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <ConsoleShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4"><h1 className="text-xl font-bold">Invoices</h1><Button onClick={()=>navigate('/admin/billing/new')}>Create Invoice</Button></div>
        <Card className="p-4">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(inv=> (
                  <TableRow key={inv.id} onClick={()=>navigate(`/admin/billing/invoices/${inv.id}`)} className="cursor-pointer">
                    <TableCell>{inv.invoice_number}</TableCell>
                    <TableCell>{inv.patient_name || inv.patient_email || '—'}</TableCell>
                    <TableCell>₹{inv.total}</TableCell>
                    <TableCell>{inv.status}</TableCell>
                    <TableCell>{inv.issued_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </ConsoleShell>
  );
}
