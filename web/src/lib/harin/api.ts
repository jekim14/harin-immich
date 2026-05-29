// 하린이 도메인 API 클라이언트 — Immich 세션 쿠키 사용
const BASE = '/api/harin';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Diary {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  assetIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const diaryApi = {
  list: (params?: { search?: string; month?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.month) qs.set('month', params.month);
    const tail = qs.toString() ? `?${qs}` : '';
    return req<Diary[]>('GET', `/diary${tail}`);
  },
  get: (id: string) => req<Diary>('GET', `/diary/${id}`),
  create: (data: Pick<Diary, 'date' | 'title' | 'content' | 'mood' | 'assetIds'>) =>
    req<Diary>('POST', '/diary', data),
  update: (id: string, data: Partial<Pick<Diary, 'date' | 'title' | 'content' | 'mood' | 'assetIds'>>) =>
    req<Diary>('PUT', `/diary/${id}`, data),
  remove: (id: string) => req<void>('DELETE', `/diary/${id}`),
};

export interface Growth {
  id: string;
  userId: string;
  date: string;
  heightCm: number | null;
  weightKg: number | null;
  headCircCm: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export const growthApi = {
  list: () => req<Growth[]>('GET', '/growth'),
  get: (id: string) => req<Growth>('GET', `/growth/${id}`),
  create: (data: Pick<Growth, 'date' | 'heightCm' | 'weightKg' | 'headCircCm' | 'note'>) =>
    req<Growth>('POST', '/growth', data),
  update: (id: string, data: Partial<Pick<Growth, 'date' | 'heightCm' | 'weightKg' | 'headCircCm' | 'note'>>) =>
    req<Growth>('PUT', `/growth/${id}`, data),
  remove: (id: string) => req<void>('DELETE', `/growth/${id}`),
};
