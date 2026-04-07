import { getSignalStats, getTrendStats, getSignals, getTrends } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { DashboardTabs } from '@/components/dashboard-tabs';
import { DashboardFilters } from '@/components/filters';

// Country code to short label mapping
const countryLabels: Record<string, string> = {
  uk: 'UK', france: 'FR', germany: 'DE', netherlands: 'NL', ireland: 'IE',
  switzerland: 'CH', spain: 'ES', italy: 'IT', sweden: 'SE',
  us: 'US', canada: 'CA', mexico: 'MX',
  australia: 'AU', japan: 'JP', singapore: 'SG', india: 'IN',
};

// Countries by region for filtering stats display
const regionCountries: Record<string, string[]> = {
  emea: ['uk', 'france', 'germany', 'netherlands', 'ireland', 'switzerland', 'spain', 'italy', 'sweden'],
  namer: ['us', 'canada', 'mexico'],
  apj: ['australia', 'japan', 'singapore', 'india'],
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function formatCountryStats(stats: Record<string, number> | undefined, region: string): string {
  if (!stats) return 'No data';

  // Get countries for this region (or all if 'all')
  const countries = region === 'all'
    ? Object.keys(stats)
    : regionCountries[region] || Object.keys(stats);

  // Filter to countries that have signals and are in the region
  const relevantStats = countries
    .filter(country => stats[country] && stats[country] > 0)
    .map(country => `${countryLabels[country] || country.toUpperCase()}: ${stats[country]}`)
    .slice(0, 4); // Max 4 countries to fit

  return relevantStats.length > 0 ? relevantStats.join(' | ') : 'No signals';
}

function sumStats(stats: Record<string, number> | undefined, region: string): number {
  if (!stats) return 0;

  if (region === 'all') {
    return Object.values(stats).reduce((a, b) => a + b, 0);
  }

  const countries = regionCountries[region] || [];
  return countries.reduce((sum, country) => sum + (stats[country] || 0), 0);
}

interface SearchParams {
  region?: string;
  vertical?: string;
  geography?: string;
  status?: string;
  timing?: string;
  dateRange?: string;
}

function getDateRangeFilter(dateRange: string): Date | undefined {
  const now = new Date();
  switch (dateRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return undefined;
  }
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedRegion = params.region || 'all';
  const selectedVertical = params.vertical || 'all';
  const selectedGeography = params.geography || 'all';
  const selectedStatus = params.status || 'all';
  const selectedTiming = params.timing || 'all';
  const selectedDateRange = params.dateRange || 'all';

  const [signalStats, trendStats, signalsData, trendsData] = await Promise.all([
    getSignalStats(),
    getTrendStats(),
    getSignals({ limit: 100 }),
    getTrends(),
  ]);

  // Get most recent signal timestamp for "Last updated"
  const mostRecentSignal = signalsData.signals.length > 0
    ? signalsData.signals.reduce((latest, signal) =>
        new Date(signal.timestamp) > new Date(latest.timestamp) ? signal : latest
      )
    : null;
  const lastUpdated = mostRecentSignal ? mostRecentSignal.timestamp : null;

  const dateFilter = getDateRangeFilter(selectedDateRange);

  // Filter signals
  let filteredSignals = signalsData.signals;

  // Region filter
  if (selectedRegion !== 'all') {
    filteredSignals = filteredSignals.filter(s => (s.region || 'emea') === selectedRegion);
  }

  // Vertical filter
  if (selectedVertical !== 'all') {
    filteredSignals = filteredSignals.filter(s => s.vertical === selectedVertical);
  }

  // Geography filter (supports both individual countries and region: prefix)
  if (selectedGeography !== 'all') {
    if (selectedGeography.startsWith('region:')) {
      const filterRegion = selectedGeography.replace('region:', '');
      const regionGeos = regionCountries[filterRegion] || [];
      filteredSignals = filteredSignals.filter(s => regionGeos.includes(s.geography));
    } else {
      filteredSignals = filteredSignals.filter(s => s.geography === selectedGeography);
    }
  }

  // Date range filter
  if (dateFilter) {
    filteredSignals = filteredSignals.filter(s => new Date(s.timestamp) >= dateFilter);
  }

  // Filter trends
  let filteredTrends = trendsData.trends;

  // Region filter
  if (selectedRegion !== 'all') {
    filteredTrends = filteredTrends.filter(t => (t.region || 'emea') === selectedRegion || t.crossRegion);
  }

  // Vertical filter
  if (selectedVertical !== 'all') {
    filteredTrends = filteredTrends.filter(t => t.vertical === selectedVertical);
  }

  // Geography filter (supports both individual countries and region: prefix)
  if (selectedGeography !== 'all') {
    if (selectedGeography.startsWith('region:')) {
      const filterRegion = selectedGeography.replace('region:', '');
      const regionGeos = regionCountries[filterRegion] || [];
      filteredTrends = filteredTrends.filter(t => regionGeos.includes(t.geography));
    } else {
      filteredTrends = filteredTrends.filter(t => t.geography === selectedGeography);
    }
  }

  // Status filter
  if (selectedStatus !== 'all') {
    filteredTrends = filteredTrends.filter(t => t.status === selectedStatus);
  }

  // Timing filter
  if (selectedTiming !== 'all') {
    filteredTrends = filteredTrends.filter(t => t.timingAssessment === selectedTiming);
  }

  // Date range filter
  if (dateFilter) {
    filteredTrends = filteredTrends.filter(t => new Date(t.detectedAt) >= dateFilter);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Cairn Intelligence</h1>
              <span className="text-gray-300">|</span>
              <p className="text-gray-600 text-sm">
                {selectedRegion === 'all'
                  ? 'Global View'
                  : `${selectedRegion.toUpperCase()} Region`}
              </p>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-gray-500">Updated {formatRelativeTime(lastUpdated)}</span>
              </div>
            )}
          </div>

          {/* Region Selector - prominent row */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 mr-1">Region:</span>
            <Link
              href="?region=all"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRegion === 'all'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {'\u{1F30D}'} All Regions
            </Link>
            <Link
              href="?region=emea"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRegion === 'emea'
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {'\u{1F1EA}\u{1F1FA}'} EMEA
            </Link>
            <Link
              href="?region=namer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRegion === 'namer'
                  ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-300'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              {'\u{1F1FA}\u{1F1F8}'} NAMER
            </Link>
            <Link
              href="?region=apj"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRegion === 'apj'
                  ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-300'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              {'\u{1F30F}'} APJ
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <DashboardFilters selectedRegion={selectedRegion} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Signals</CardDescription>
              <CardTitle className="text-3xl">{signalStats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>FinServ Signals</CardDescription>
              <CardTitle className="text-3xl">
                {sumStats(signalStats.stats.finserv, selectedRegion)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-500">
              {formatCountryStats(signalStats.stats.finserv, selectedRegion)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Healthcare Signals</CardDescription>
              <CardTitle className="text-3xl">
                {sumStats(signalStats.stats.healthcare, selectedRegion)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-500">
              {formatCountryStats(signalStats.stats.healthcare, selectedRegion)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Retail Signals</CardDescription>
              <CardTitle className="text-3xl">
                {sumStats(signalStats.stats.retail, selectedRegion)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-500">
              {formatCountryStats(signalStats.stats.retail, selectedRegion)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Trends</CardDescription>
              <CardTitle className="text-3xl">{trendStats.confirmed + trendStats.weakened}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-500">
              <span className="text-green-600">{trendStats.confirmed} Confirmed</span>
              {' | '}
              <span className="text-amber-600">{trendStats.weakened} Under Review</span>
            </CardContent>
          </Card>
        </div>

        {/* Tabs with Digest, Trends, and Signals */}
        <DashboardTabs
          signals={filteredSignals}
          trends={filteredTrends}
          selectedRegion={selectedRegion}
        />
      </main>
    </div>
  );
}
