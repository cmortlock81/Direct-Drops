'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function ControllerDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  const load = () => api<any[]>('/jobs').then(setJobs);
  useEffect(() => { load(); const s = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'); s.on('connect', ()=>setConnected(true)); ['job.created','job.updated','job.assigned','job.status_changed'].forEach(e=>s.on(e, load)); return ()=>s.close(); }, []);

  const kpi = (status: string) => jobs.filter((j) => j.status === status).length;

  return <Shell title="Controller Dashboard"><div className="mb-3 text-sm">Realtime: {connected ? 'Connected' : 'Disconnected'}</div><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{['NEW','ASSIGNED','OUT_FOR_DELIVERY','DELIVERED','FAILED'].map(s=><div key={s} className="card"><p className="text-xs">{s}</p><p className="text-2xl font-bold">{kpi(s)}</p></div>)}</div><div className="my-4"><Link className="btn" href="/controller/jobs/new">Create Job</Link></div><table className="w-full overflow-hidden rounded border bg-white text-sm"><thead><tr className="bg-slate-100"><th>Job ID</th><th>Customer</th><th>Phone</th><th>Postcode</th><th>Priority</th><th>Status</th><th>Assigned</th><th></th></tr></thead><tbody>{jobs.map(j=><tr key={j.id} className="border-t"><td>{j.id.slice(0,8)}</td><td>{j.customerName}</td><td>{j.customerPhone}</td><td>{j.deliveryPostcode}</td><td>{j.priority}</td><td>{j.status}</td><td>{j.assignedCourier?.user?.name ?? '-'}</td><td><Link href={`/controller/jobs/${j.id}`}>View</Link></td></tr>)}</tbody></table></Shell>;
}
