const PB_URL = (process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8095').trim();

export function getPocketBaseUrl(): string {
  return PB_URL;
}

export async function pbFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = isFormData
    ? { ...((options?.headers as Record<string, string>) || {}) }
    : { 'Content-Type': 'application/json', ...((options?.headers as Record<string, string>) || {}) };
  const res = await fetch(`${PB_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PocketBase error: ${res.status} ${error}`);
  }
  return res.json();
}

export async function pbAuthFetch<T = any>(path: string, token?: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${PB_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers as Record<string, string> },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PocketBase error: ${res.status} ${error}`);
  }
  return res.json();
}
