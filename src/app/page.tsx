import { getSignalStats, getTrendStats, getSignals, getTrends } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function RegionBadge({ region }: { region: string }) {
  const colors: Record<string, string> = {
    emea: 'bg-indigo-100 text-indigo-800',
    namer: 'bg-orange-100 text-orange-800',
    apj: 'bg-teal-100 text-teal-800',
  };
  const labels: Record<string, string> = {
    emea: 'EMEA',
    namer: 'NAMER',
    apj: 'APJ',
  };
  return (
    <Badge variant="outline" className={colors[region] || ''}>
      {labels[region] || region.toUpperCase()}
    </Badge>
  );
}

function VerticalBadge({ vertical }: { vertical: string }) {
  const colors: Record<string, string> = {
    finserv: 'bg-blue-100 text-blue-800',
    healthcare: 'bg-green-100 text-green-800',
    retail: 'bg-purple-100 text-purple-800',
  };
  return (
    <Badge variant="outline" className={colors[vertical] || ''}>
      {vertical}
    </Badge>
  );
}

function GeographyBadge({ geography }: { geography: string }) {
  const flags: Record<string, string> = {
    // EMEA
    uk: '🇬🇧',
    france: '🇫🇷',
    germany: '🇩🇪',
    netherlands: '🇳🇱',
    ireland: '🇮🇪',
    switzerland: '🇨🇭',
    spain: '🇪🇸',
    italy: '🇮🇹',
    sweden: '🇸🇪',
    // NAMER
    us: '🇺🇸',
    canada: '🇨🇦',
    mexico: '🇲🇽',
    // APJ
    australia: '🇦🇺',
    japan: '🇯🇵',
    singapore: '🇸🇬',
    india: '🇮🇳',
  };
  return (
    <Badge variant="secondary">
      {flags[geography] || ''} {geography.toUpperCase()}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    weakened: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <Badge variant="outline" className={colors[status] || ''}>
      {status}
    </Badge>
  );
}

function CrossRegionBadge() {
  return (
    <Badge variant="outline" className="bg-gradient-to-r from-indigo-100 via-orange-100 to-teal-100 text-gray-800 border-2">
      🌐 Cross-Region
    </Badge>
  );
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
    getSignals({ limit: 20 }),
    getTrends(),
  ]);

  // Filter data by region if selected
  const filteredSignals = selectedRegion === 'all'
    ? signalsData.signals
    : signalsData.signals.filter(s => s.region === selectedRegion);

  const filteredTrends = selectedRegion === 'all'
    ? trendsData.trends
    : trendsData.trends.filter(t => t.region === selectedRegion || t.crossRegion);

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
              🌍 All Regions
            </Link>
            <Link
              href="?region=emea"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRegion === 'emea'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              🇪🇺 EMEA
            </Link>
            <Link
              href="?region=namer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRegion === 'namer'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              🇺🇸 NAMER
            </Link>
            <Link
              href="?region=apj"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedRegion === 'apj'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              🌏 APJ
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
                {Object.values(signalStats.stats.finserv || {}).reduce((a, b) => a + b, 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-500">
              {selectedRegion === 'all' || selectedRegion === 'emea' ? (
                <span>UK: {signalStats.stats.finserv?.uk || 0} | FR: {signalStats.stats.finserv?.france || 0} | DE: {signalStats.stats.finserv?.germany || 0}</span>
              ) : selectedRegion === 'namer' ? (
                <span>US: {signalStats.stats.finserv?.us || 0} | CA: {signalStats.stats.finserv?.canada || 0}</span>
              ) : (
                <span>AU: {signalStats.stats.finserv?.australia || 0} | JP: {signalStats.stats.finserv?.japan || 0}</span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Healthcare Signals</CardDescription>
              <CardTitle className="text-3xl">
                {Object.values(signalStats.stats.healthcare || {}).reduce((a, b) => a + b, 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-500">
              {selectedRegion === 'all' || selectedRegion === 'emea' ? (
                <span>UK: {signalStats.stats.healthcare?.uk || 0}</span>
              ) : selectedRegion === 'namer' ? (
                <span>US: {signalStats.stats.healthcare?.us || 0}</span>
              ) : (
                <span>AU: {signalStats.stats.healthcare?.australia || 0}</span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Retail Signals</CardDescription>
              <CardTitle className="text-3xl">
                {Object.values(signalStats.stats.retail || {}).reduce((a, b) => a + b, 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-500">
              {selectedRegion === 'all' || selectedRegion === 'emea' ? (
                <span>UK: {signalStats.stats.retail?.uk || 0} | DE: {signalStats.stats.retail?.germany || 0}</span>
              ) : selectedRegion === 'namer' ? (
                <span>US: {signalStats.stats.retail?.us || 0}</span>
              ) : (
                <span>AU: {signalStats.stats.retail?.australia || 0}</span>
              )}
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

        {/* Tabs */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="signals">Recent Signals</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Detected Trends</CardTitle>
                <CardDescription>
                  Cross-market patterns identified by Cairn, reviewed by Skeptic Agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTrends.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No trends detected yet</p>
                ) : (
                  <div className="space-y-4">
                    {filteredTrends.map((trend) => (
                      <Link key={trend.id} href={`/trends/${trend.id}`} className="block">
                        <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                          <CardHeader className="pb-2">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {trend.crossRegion ? (
                                <CrossRegionBadge />
                              ) : (
                                <RegionBadge region={trend.region} />
                              )}
                              <VerticalBadge vertical={trend.vertical} />
                              <GeographyBadge geography={trend.geography} />
                              <StatusBadge status={trend.status} />
                              <Badge variant="outline">
                                {(trend.confidenceScore * 100).toFixed(0)}% confidence
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{trend.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm line-clamp-2">{trend.narrative}</p>
                            {trend.skepticNotes && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                                <p className="text-xs font-medium text-yellow-800">Skeptic Notes:</p>
                                <p className="text-xs text-yellow-700 line-clamp-2">{trend.skepticNotes}</p>
                              </div>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <span>{trend.evidenceCount} evidence signals</span>
                              <span>Detected {formatDate(trend.detectedAt)}</span>
                              <span className="capitalize">{trend.timingAssessment} timing</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals">
            <Card>
              <CardHeader>
                <CardTitle>Recent Signals</CardTitle>
                <CardDescription>
                  Latest regulatory and market signals from monitored sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Vertical</TableHead>
                        <TableHead>Geography</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSignals.map((signal) => (
                        <TableRow key={signal.id}>
                          <TableCell>
                            <Link
                              href={`/signals/${signal.id}`}
                              className="font-medium hover:underline line-clamp-1"
                            >
                              {signal.title}
                            </Link>
                            {signal.summary && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                                {signal.summary}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{signal.sourceName}</TableCell>
                          <TableCell>
                            <RegionBadge region={signal.region} />
                          </TableCell>
                          <TableCell>
                            <VerticalBadge vertical={signal.vertical} />
                          </TableCell>
                          <TableCell>
                            <GeographyBadge geography={signal.geography} />
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(signal.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
