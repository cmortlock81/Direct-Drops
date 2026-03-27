'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function CourierJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  useEffect(() => { api<any[]>('/jobs?status=ASSIGNED').then(setJobs); }, []);
  return <Shell title="Today's Jobs"><div className="space-y-3">{jobs.map(job=><Link href={`/courier/jobs/${job.id}`} key={job.id} className="card block"><p className="font-medium">{job.customerName}</p><p>{job.deliveryAddressLine1}</p><p className="text-sm">{job.status}</p></Link>)}</div></Shell>;
}
