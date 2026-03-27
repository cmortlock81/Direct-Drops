'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({ customerName: '', customerPhone: '', line1: '', line2: '', city: '', postcode: '', notes: '', priority: 'NORMAL' });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const job = await api<any>('/jobs', { method: 'POST', body: JSON.stringify({ customerName: form.customerName, customerPhone: form.customerPhone, deliveryAddress: { line1: form.line1, line2: form.line2, city: form.city, postcode: form.postcode }, notes: form.notes, priority: form.priority }) });
    router.push(`/controller/jobs/${job.id}`);
  }

  return <Shell title="Create Job"><form onSubmit={submit} className="grid gap-3 card md:grid-cols-2">{['customerName','customerPhone','line1','line2','city','postcode','notes'].map(k=><input key={k} className="rounded border p-2" placeholder={k} value={(form as any)[k]} onChange={e=>setForm({ ...form, [k]: e.target.value })} />)}<select className="rounded border p-2" value={form.priority} onChange={e=>setForm({ ...form, priority: e.target.value })}><option>NORMAL</option><option>HIGH</option></select><button className="btn md:col-span-2">Create</button></form></Shell>;
}
