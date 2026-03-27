'use client';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function SyncPage() {
  const [status, setStatus] = useState('Ready');
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (!navigator.onLine) return setStatus('Offline - queued updates will retry');
      setStatus('Online - syncing');
      for (const item of queue) {
        await api(item.path, { method: 'POST', body: JSON.stringify(item.body) });
      }
      setQueue([]);
      setStatus('Synced');
    }, 5000);
    return () => clearInterval(timer);
  }, [queue]);

  return <Shell title="Sync Status"><div className="card"><p>{status}</p><p>Queued updates: {queue.length}</p><p className="text-sm text-slate-600">GPS permission denied will disable tracking and show warnings in active job view.</p></div></Shell>;
}
