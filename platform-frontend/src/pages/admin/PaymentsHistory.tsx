import { useEffect, useState } from 'react';
import ConsoleShell from '@/layouts/ConsoleShell';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

export default function PaymentsHistory(){
  const [payments, setPayments] = useState<any[]>([]);
  const load = async()=>{
    try{ const res = await apiFetch('/api/billing/payments'); const js = await res.json(); if(!res.ok) throw new Error(js?.error||'Failed'); setPayments(js.payments || []); }catch(err){ const e = err as Error; toast.error('Failed to load payments: '+e.message); }
  }
  useEffect(()=>{ load(); },[]);

  return (
    <ConsoleShell>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Payments</h1>
        <Card className="p-4">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(p=> (
                  <TableRow key={p.id}>
                    <TableCell>{p.invoice_id}</TableCell>
                    <TableCell>₹{p.amount}</TableCell>
                    <TableCell>{p.payment_method || '—'}</TableCell>
                    <TableCell>{new Date(p.paid_at).toLocaleString()}</TableCell>
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