'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api<any>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      localStorage.setItem('token', res.accessToken);
      if (res.user.role === 'COURIER') router.push('/courier/jobs');
      else if (res.user.role === 'ADMIN') router.push('/admin');
      else router.push('/controller/dashboard');
    } catch (e: any) { setError(e.message); }
  }

  return <main className="mx-auto mt-20 max-w-sm card"><h1 className="mb-4 text-xl">Login</h1><form onSubmit={onSubmit} className="space-y-3"><input className="w-full rounded border p-2" value={username} onChange={e=>setUsername(e.target.value)} /><input type="password" className="w-full rounded border p-2" value={password} onChange={e=>setPassword(e.target.value)} /><button className="btn w-full">Sign in</button>{error && <p className="text-sm text-red-700">{error}</p>}</form></main>;
}
