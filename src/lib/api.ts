// Server-side: call Cairn API directly (no mixed content issue server-to-server)
// Client-side: use proxy to avoid mixed content (HTTPS page -> HTTP API)
const CAIRN_API_URL = process.env.CAIRN_API_URL || 'http://178.104.117.204:3001';
const CAIRN_API_KEY = process.env.CAIRN_API_KEY || '';

function isServer(): boolean {
  return typeof window === 'undefined';
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  let url: string;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (isServer()) {
    // Server-side: call Cairn API directly
    url = `${CAIRN_API_URL}${endpoint}`;
    if (CAIRN_API_KEY) {
      headers['Authorization'] = `Bearer ${CAIRN_API_KEY}`;
    }
  } else {
    // Client-side: use proxy to avoid mixed content
    // /api/signals -> /api/cairn/signals
    url = endpoint.replace(/^\/api/, '/api/cairn');
  }

  const fetchOptions: RequestInit = { headers };

  // Only use next.revalidate on server-side
  if (isServer()) {
    (fetchOptions as any).next = { revalidate: 60 };
  }

  const res = await fetch(url, fetchOptions);

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
  region: 'emea' | 'namer' | 'apj';
  vertical: 'finserv' | 'healthcare' | 'retail';
  geography: 'uk' | 'france' | 'germany' | 'netherlands' | 'ireland' | 'switzerland' | 'spain' | 'italy' | 'sweden' | 'us' | 'canada' | 'mexico' | 'australia' | 'japan' | 'singapore' | 'india';
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
  region: 'emea' | 'namer' | 'apj';
  vertical: 'finserv' | 'healthcare' | 'retail';
  geography: 'uk' | 'france' | 'germany' | 'netherlands' | 'ireland' | 'switzerland' | 'spain' | 'italy' | 'sweden' | 'us' | 'canada' | 'mexico' | 'australia' | 'japan' | 'singapore' | 'india';
  crossRegion?: boolean;
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

// Digest types
export type SignalQuality = 'strong' | 'moderate' | 'weak';

export interface DigestCard {
  vertical: 'finserv' | 'healthcare' | 'retail';
  region: 'emea' | 'namer' | 'apj';
  headline: string;
  keyMovements: string[];
  skepticSummary: string;
  twilioRelevance: string;
  signalQuality: SignalQuality;
  trendCount: number;
  underlyingTrendIds: string[];
  generatedAt: string;
}

export interface RegionDigest {
  region: 'emea' | 'namer' | 'apj';
  cards: DigestCard[];
  crossRegionPatterns?: string;
  generatedAt: string;
  expiresAt: string;
}

export interface IndustryBriefing {
  content: string;
  markdown: string;
  generatedAt: string;
  region: 'emea' | 'namer' | 'apj' | 'all';
  wordCount: number;
}

export async function getDigest(region: string = 'all', refresh: boolean = false): Promise<{ digest: RegionDigest; cached: boolean }> {
  const params = new URLSearchParams({ region });
  if (refresh) params.set('refresh', '1');
  return fetchAPI(`/api/digest?${params.toString()}`);
}

export async function generateBriefing(region: string = 'all'): Promise<IndustryBriefing> {
  let url: string;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (isServer()) {
    url = `${CAIRN_API_URL}/api/briefing`;
    if (CAIRN_API_KEY) {
      headers['Authorization'] = `Bearer ${CAIRN_API_KEY}`;
    }
  } else {
    // Client-side: use proxy
    url = '/api/cairn/briefing';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ region }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
