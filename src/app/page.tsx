import { getSignalStats, getTrendStats, getSignals, getTrends } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { DashboardTabs } from '@/components/dashboard-tabs';

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

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const params = await searchParams;
  const selectedRegion = params.region || 'all';

  const [signalStats, trendStats, signalsData, trendsData] = await Promise.all([
    getSignalStats(),
    getTrendStats(),
    getSignals({ limit: 50 }),
    getTrends(),
  ]);

  // Filter data by region if selected (default to emea for legacy signals without region)
  const filteredSignals = selectedRegion === 'all'
    ? signalsData.signals
    : signalsData.signals.filter(s => (s.region || 'emea') === selectedRegion);

  const filteredTrends = selectedRegion === 'all'
    ? trendsData.trends
    : trendsData.trends.filter(t => (t.region || 'emea') === selectedRegion || t.crossRegion);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Region Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Link
              href="?region=all"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRegion === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {'\u{1F30D}'} All Regions
            </Link>
            <Link
              href="?region=emea"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRegion === 'emea'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {'\u{1F1EA}\u{1F1FA}'} EMEA
            </Link>
            <Link
              href="?region=namer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRegion === 'namer'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              {'\u{1F1FA}\u{1F1F8}'} NAMER
            </Link>
            <Link
              href="?region=apj"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRegion === 'apj'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              {'\u{1F30F}'} APJ
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Cairn Intelligence</h1>
          <p className="text-gray-600">
            {selectedRegion === 'all'
              ? 'Global Enterprise Strategy Dashboard'
              : `${selectedRegion.toUpperCase()} Enterprise Strategy Dashboard`}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
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
              Confirmed: {trendStats.confirmed} | Weakened: {trendStats.weakened}
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
