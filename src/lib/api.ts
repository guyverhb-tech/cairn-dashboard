// Use local proxy to avoid mixed content issues (HTTPS dashboard -> HTTP API)
// The proxy at /api/cairn forwards to the actual Cairn API server
const API_BASE = '/api/cairn';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  // endpoint comes as /api/signals, we need /api/cairn/signals
  const proxyPath = endpoint.replace(/^\/api/, API_BASE);

  const res = await fetch(proxyPath, {
    headers: {
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
  const res = await fetch(`${API_BASE}/briefing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ region }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
