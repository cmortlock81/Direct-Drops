const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers || {}) }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
