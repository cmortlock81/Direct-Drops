'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Shell } from '@/components/Shell';
import { api } from '@/lib/api';

export default function TemplateEditor() {
  const { templateId } = useParams<{templateId:string}>();
  const [body, setBody] = useState('');
  return <Shell title="Template Editor"><div className="card space-y-2"><textarea className="h-40 w-full rounded border p-2" value={body} onChange={e=>setBody(e.target.value)} /><button className="btn" onClick={()=>api(`/admin/sms-templates/${templateId}`,{method:'PATCH',body:JSON.stringify({body})})}>Save</button><p className="text-xs">Preview: {body.replace('{{customerName}}','Jane')}</p></div></Shell>;
}
