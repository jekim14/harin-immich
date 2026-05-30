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
  isCheckup: boolean;
  examRound: number | null;
  examPlace: string;
  assetIds: string[];
  createdAt: string;
  updatedAt: string;
}

type GrowthInput = Pick<
  Growth,
  'date' | 'heightCm' | 'weightKg' | 'headCircCm' | 'note' | 'isCheckup' | 'examRound' | 'examPlace' | 'assetIds'
>;

export const growthApi = {
  list: () => req<Growth[]>('GET', '/growth'),
  get: (id: string) => req<Growth>('GET', `/growth/${id}`),
  create: (data: GrowthInput) => req<Growth>('POST', '/growth', data),
  update: (id: string, data: Partial<GrowthInput>) => req<Growth>('PUT', `/growth/${id}`, data),
  remove: (id: string) => req<void>('DELETE', `/growth/${id}`),
};

export type HealthType = 'vaccination' | 'hospital' | 'allergy';
export interface HealthRecord {
  id: string;
  userId: string;
  type: HealthType;
  date: string | null;
  title: string;
  note: string;
  extra: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const healthApi = {
  list: (type?: HealthType) => {
    const qs = type ? `?type=${type}` : '';
    return req<HealthRecord[]>('GET', `/health${qs}`);
  },
  get: (id: string) => req<HealthRecord>('GET', `/health/${id}`),
  create: (data: Pick<HealthRecord, 'type' | 'date' | 'title' | 'note' | 'extra'>) =>
    req<HealthRecord>('POST', '/health', data),
  update: (id: string, data: Partial<Pick<HealthRecord, 'type' | 'date' | 'title' | 'note' | 'extra'>>) =>
    req<HealthRecord>('PUT', `/health/${id}`, data),
  remove: (id: string) => req<void>('DELETE', `/health/${id}`),
};

export type MilestoneCategory = 'physical' | 'language' | 'social' | 'cognitive';
export interface Milestone {
  id: string;
  userId: string;
  category: MilestoneCategory;
  title: string;
  emoji: string;
  achievedDate: string | null;
  note: string;
  assetIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const milestoneApi = {
  list: (category?: MilestoneCategory) => {
    const qs = category ? `?category=${category}` : '';
    return req<Milestone[]>('GET', `/milestone${qs}`);
  },
  get: (id: string) => req<Milestone>('GET', `/milestone/${id}`),
  create: (data: Pick<Milestone, 'category' | 'title' | 'emoji' | 'achievedDate' | 'note' | 'assetIds'>) =>
    req<Milestone>('POST', '/milestone', data),
  update: (id: string, data: Partial<Pick<Milestone, 'category' | 'title' | 'emoji' | 'achievedDate' | 'note' | 'assetIds'>>) =>
    req<Milestone>('PUT', `/milestone/${id}`, data),
  remove: (id: string) => req<void>('DELETE', `/milestone/${id}`),
};

export interface Video {
  id: string;
  userId: string;
  videoId: string;
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  duration: string;
  date: string | null;
  note: string;
  source: 'imported' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export const videoApi = {
  list: () => req<Video[]>('GET', '/video'),
  get: (id: string) => req<Video>('GET', `/video/${id}`),
  create: (data: Pick<Video, 'videoId' | 'channelId' | 'title' | 'description' | 'thumbnailUrl' | 'publishedAt' | 'duration' | 'date' | 'note' | 'source'>) =>
    req<Video>('POST', '/video', data),
  update: (id: string, data: Partial<Pick<Video, 'title' | 'description' | 'date' | 'note'>>) =>
    req<Video>('PUT', `/video/${id}`, data),
  remove: (id: string) => req<void>('DELETE', `/video/${id}`),
  syncChannel: (body: { channelUrl?: string; channelId?: string; apiKey?: string }) =>
    req<{ channelId: string; importedCount: number }>('POST', '/video/sync-channel', body),
};

// YouTube URL에서 videoId 11자 추출
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
