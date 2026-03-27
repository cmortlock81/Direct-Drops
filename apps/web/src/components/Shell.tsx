'use client';
import Link from 'next/link';

export function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-4">
      <header className="mb-4 flex items-center justify-between rounded border bg-white p-3">
        <h1 className="text-lg font-semibold">{title}</h1>
        <nav className="flex gap-2 text-sm">
          <Link href="/controller/dashboard">Controller</Link>
          <Link href="/courier/jobs">Courier</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
