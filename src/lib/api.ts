const API_URL = process.env.NEXT_PUBLIC_CAIRN_API_URL || 'http://178.104.117.204:3001';
const API_KEY = process.env.CAIRN_API_KEY || '';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export interface Signal {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  timestamp: string;
  vertical: 'finserv' | 'healthcare' | 'retail';
  geography: 'uk' | 'france' | 'germany' | 'netherlands' | 'ireland' | 'switzerland' | 'spain' | 'italy' | 'sweden';
  signalType: string;
  title: string;
  summary?: string;
  relevanceScore?: number;
  frameworkMapping?: {
    goal?: string;
    blocker?: string;
    solutionApproach?: string;
    twilioCapability?: string;
  };
}

export interface Trend {
  id: string;
  vertical: 'finserv' | 'healthcare' | 'retail';
  geography: 'uk' | 'france' | 'germany' | 'netherlands' | 'ireland' | 'switzerland' | 'spain' | 'italy' | 'sweden';
  title: string;
  narrative: string;
  theme: string;
  evidenceSignalIds: string[];
  evidenceCount: number;
  confidenceScore: number;
  timingAssessment: 'early' | 'accelerating' | 'plateau' | 'declining';
  status: 'confirmed' | 'weakened' | 'rejected';
  skepticNotes?: string;
  detectedAt: string;
}

export interface StatsOverview {
  stats: Record<string, Record<string, number>>;
  total: number;
}

export interface TrendStats {
  confirmed: number;
  weakened: number;
  rejected: number;
  total: number;
}

export async function getSignals(params?: {
  vertical?: string;
  geography?: string;
  limit?: number;
}): Promise<{ signals: Signal[]; count: number }> {
  const searchParams = new URLSearchParams();
  if (params?.vertical) searchParams.set('vertical', params.vertical);
  if (params?.geography) searchParams.set('geography', params.geography);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return fetchAPI(`/api/signals${query ? `?${query}` : ''}`);
}

export async function getSignal(id: string): Promise<Signal> {
  return fetchAPI(`/api/signals/${id}`);
}

export async function getSignalStats(): Promise<StatsOverview> {
  return fetchAPI('/api/signals/stats/overview');
}

export async function getTrends(params?: {
  vertical?: string;
  geography?: string;
  status?: string;
}): Promise<{ trends: Trend[]; count: number }> {
  const searchParams = new URLSearchParams();
  if (params?.vertical) searchParams.set('vertical', params.vertical);
  if (params?.geography) searchParams.set('geography', params.geography);
  if (params?.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  return fetchAPI(`/api/trends${query ? `?${query}` : ''}`);
}

export async function getTrend(id: string): Promise<Trend & { evidenceSignals: Signal[] }> {
  return fetchAPI(`/api/trends/${id}`);
}

export async function getTrendStats(): Promise<TrendStats> {
  return fetchAPI('/api/trends/stats/overview');
}

export async function searchSignals(query: string, params?: {
  vertical?: string;
  geography?: string;
}): Promise<{ signals: Signal[]; count: number; query: string }> {
  const searchParams = new URLSearchParams({ q: query });
  if (params?.vertical) searchParams.set('vertical', params.vertical);
  if (params?.geography) searchParams.set('geography', params.geography);

  return fetchAPI(`/api/search?${searchParams.toString()}`);
}
