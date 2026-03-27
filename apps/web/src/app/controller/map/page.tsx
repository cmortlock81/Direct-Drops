'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function ControllerMap() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api<any[]>('/couriers/locations/latest').then(setItems); }, []);
  return <Shell title="Live Map"><div className="card"><p>Google Maps API key configured: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Yes' : 'No'}</p>{items.map(i=>{ const loc=i.locations?.[0]; const stale=!loc || Date.now()-new Date(loc.capturedAt).getTime()>120000; return <p key={i.id}>{i.user.name}: {loc?`${loc.lat}, ${loc.lng}`:'No data'} {stale && '⚠️ stale'}</p>; })}</div></Shell>;
}
