'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<any>();
  const [couriers, setCouriers] = useState<any[]>([]);
  const [courierId, setCourierId] = useState('');

  useEffect(() => { api<any>(`/jobs/${jobId}`).then(setJob); api<any[]>('/couriers').then(setCouriers); }, [jobId]);
  if (!job) return <div>Loading...</div>;

  async function assign() { await api(`/jobs/${jobId}/assign`, { method: 'POST', body: JSON.stringify({ courierId }) }); setJob(await api(`/jobs/${jobId}`)); }

  return <Shell title={`Job ${job.id.slice(0,8)}`}><div className="grid gap-4 md:grid-cols-2"><div className="card space-y-2"><p>Status: <b>{job.status}</b></p><p>Customer: {job.customerName}</p><p>Address: {job.deliveryAddressLine1}, {job.deliveryCity}</p><div className="flex gap-2"><select className="rounded border p-2" value={courierId} onChange={e=>setCourierId(e.target.value)}><option value="">Select courier</option>{couriers.filter(c=>c.user?.isActive).map(c=><option key={c.id} value={c.id}>{c.user.name}</option>)}</select><button className="btn" onClick={assign}>Assign</button></div></div><div className="card"><h2 className="mb-2 font-semibold">Event History</h2>{job.events?.map((e:any)=><p key={e.id} className="text-sm">{e.eventType} - {new Date(e.createdAt).toLocaleString()}</p>)}</div><div className="card"><h2 className="mb-2 font-semibold">SMS History</h2>{job.smsMessages?.map((m:any)=><p key={m.id} className="text-sm">{m.templateKey}: {m.status}</p>)}</div></div></Shell>;
}
