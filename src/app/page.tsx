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

function VerticalBadge({ vertical }: { vertical: string }) {
  const colors: Record<string, string> = {
    finserv: 'bg-blue-100 text-blue-800',
    healthcare: 'bg-green-100 text-green-800',
  };
  return (
    <Badge variant="outline" className={colors[vertical] || ''}>
      {vertical}
    </Badge>
  );
}

function GeographyBadge({ geography }: { geography: string }) {
  const flags: Record<string, string> = {
    uk: '🇬🇧',
    france: '🇫🇷',
    germany: '🇩🇪',
    netherlands: '🇳🇱',
    ireland: '🇮🇪',
    switzerland: '🇨🇭',
    spain: '🇪🇸',
    italy: '🇮🇹',
    sweden: '🇸🇪',
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

export default async function Dashboard() {
  const [signalStats, trendStats, signalsData, trendsData] = await Promise.all([
    getSignalStats(),
    getTrendStats(),
    getSignals({ limit: 20 }),
    getTrends(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Cairn Intelligence</h1>
          <p className="text-gray-600">EMEA Enterprise Strategy Dashboard</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
            <CardContent className="text-sm text-gray-500">
              UK: {signalStats.stats.finserv?.uk || 0} | FR: {signalStats.stats.finserv?.france || 0} | DE: {signalStats.stats.finserv?.germany || 0}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Healthcare Signals</CardDescription>
              <CardTitle className="text-3xl">
                {Object.values(signalStats.stats.healthcare || {}).reduce((a, b) => a + b, 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-500">
              UK: {signalStats.stats.healthcare?.uk || 0} | FR: {signalStats.stats.healthcare?.france || 0} | DE: {signalStats.stats.healthcare?.germany || 0}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Trends</CardDescription>
              <CardTitle className="text-3xl">{trendStats.confirmed + trendStats.weakened}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-500">
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
                {trendsData.trends.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No trends detected yet</p>
                ) : (
                  <div className="space-y-4">
                    {trendsData.trends.map((trend) => (
                      <Link key={trend.id} href={`/trends/${trend.id}`} className="block">
                        <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 mb-2">
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
                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Vertical</TableHead>
                      <TableHead>Geography</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signalsData.signals.map((signal) => (
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
