'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function CourierJobDetail() {
  const { jobId } = useParams<{jobId:string}>();
  const [job, setJob] = useState<any>();
  const [reasonText, setReasonText] = useState('');
  useEffect(() => { api<any>(`/jobs/${jobId}`).then(setJob); }, [jobId]);
  if (!job) return <div>Loading...</div>;

  async function setStatus(status: string, reasonCode?: string) {
    await api(`/jobs/${jobId}/status`, { method: 'POST', body: JSON.stringify({ status, reasonCode, reasonText }) });
    setJob(await api(`/jobs/${jobId}`));
  }

  const navLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${job.deliveryAddressLine1}, ${job.deliveryCity}`)}`;
  return <Shell title="Active Job"><div className="card space-y-3"><p>{job.customerName}</p><p>{job.deliveryAddressLine1}</p><a className="btn inline-block" href={navLink} target="_blank">Navigate</a><div className="flex flex-wrap gap-2"><button className="btn" onClick={()=>setStatus('OUT_FOR_DELIVERY')}>Start delivery</button><button className="btn" onClick={()=>setStatus('DELIVERED')}>Mark delivered</button></div><div className="space-y-2"><input className="w-full rounded border p-2" placeholder="Failure note" value={reasonText} onChange={e=>setReasonText(e.target.value)} /><button className="btn" onClick={()=>setStatus('FAILED','CUSTOMER_UNAVAILABLE')}>Mark failed</button></div></div></Shell>;
}
