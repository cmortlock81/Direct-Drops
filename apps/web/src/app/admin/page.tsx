import Link from 'next/link';
import { Shell } from '@/components/Shell';

export default function AdminHome() {
  return <Shell title="Admin Dashboard"><div className="grid gap-3 md:grid-cols-3"><Link className="card" href="/admin/users">Users</Link><Link className="card" href="/admin/sms-templates">SMS Templates</Link><Link className="card" href="/admin/settings">Settings</Link></div></Shell>;
}
