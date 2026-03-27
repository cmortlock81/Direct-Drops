'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function SmsTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  useEffect(() => { api<any[]>('/admin/sms-templates').then(setTemplates); }, []);
  return <Shell title="SMS Templates"><div className="space-y-2">{templates.map(t=><Link className="card block" href={`/admin/sms-templates/${t.id}`} key={t.id}>{t.eventKey} - {t.name}</Link>)}</div></Shell>;
}
