'use client';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function UserDetail() {
  const { userId } = useParams<{userId:string}>();
  return <Shell title="User Actions"><div className="card space-x-2"><button className="btn" onClick={()=>api(`/users/${userId}/activate`,{method:'POST'})}>Activate</button><button className="btn" onClick={()=>api(`/users/${userId}/deactivate`,{method:'POST'})}>Deactivate</button><button className="btn" onClick={()=>api(`/users/${userId}/reset-password`,{method:'POST',body:JSON.stringify({password:'Password123!'})})}>Reset Password</button></div></Shell>;
}
