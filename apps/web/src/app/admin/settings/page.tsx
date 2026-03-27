'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function AdminSettings() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api<any[]>('/admin/settings').then(setItems); }, []);

  async function save() {
    const payload = Object.fromEntries(items.map((i) => [i.key, i.value]));
    await api('/admin/settings', { method: 'PATCH', body: JSON.stringify(payload) });
  }

  return <Shell title="Operational Settings"><div className="card space-y-2">{items.map((s,idx)=><div key={s.key}><label className="text-sm">{s.key}</label><input className="w-full rounded border p-2" value={String(s.value)} onChange={e=>{const next=[...items]; next[idx].value=e.target.value; setItems(next);}} /></div>)}<button className="btn" onClick={save}>Save settings</button></div></Shell>;
}
