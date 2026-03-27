'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { api<any[]>('/users').then(setUsers); }, []);
  return <Shell title="Users"><div className="space-y-2">{users.map(u=><Link className="card block" href={`/admin/users/${u.id}`} key={u.id}>{u.name} ({u.role}) - {u.isActive ? 'Active' : 'Inactive'}</Link>)}</div></Shell>;
}
