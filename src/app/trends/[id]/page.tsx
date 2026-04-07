import { getTrend } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function TrendPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trend = await getTrend(id);

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    weakened: 'bg-amber-100 text-amber-800',
    rejected: 'bg-red-100 text-red-800',
  };
  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmed',
    weakened: 'Under Review',
    rejected: 'Rejected',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Trend Analysis</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {trend.vertical}
              </Badge>
              <Badge variant="secondary">
                {trend.geography.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={statusColors[trend.status]}>
                {statusLabels[trend.status] || trend.status}
              </Badge>
              <Badge
                variant="outline"
                className={
                  trend.confidenceScore >= 0.7
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : trend.confidenceScore >= 0.4
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }
              >
                {(trend.confidenceScore * 100).toFixed(0)}% {
                  trend.confidenceScore >= 0.7 ? 'High' : trend.confidenceScore >= 0.4 ? 'Medium' : 'Low'
                }
              </Badge>
            </div>
            <CardTitle className="text-xl">{trend.title}</CardTitle>
            <CardDescription>
              Theme: {trend.theme} &middot; Detected {new Date(trend.detectedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Narrative</h3>
              <p className="text-gray-600 whitespace-pre-line">{trend.narrative}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Timing Assessment</p>
                <p className="text-sm text-gray-700 capitalize">{trend.timingAssessment}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Evidence Signals</p>
                <p className="text-sm text-gray-700">{trend.evidenceCount} signals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {trend.skepticNotes && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-800">Skeptic Agent Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 whitespace-pre-line">{trend.skepticNotes}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evidence Signals</CardTitle>
            <CardDescription>
              Signals that contributed to this trend detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trend.evidenceSignals && trend.evidenceSignals.length > 0 ? (
              <div className="space-y-3">
                {trend.evidenceSignals.map((signal) => (
                  <Link
                    key={signal.id}
                    href={`/signals/${signal.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900 line-clamp-1">{signal.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {signal.sourceName} &middot; {new Date(signal.timestamp).toLocaleDateString('en-GB')}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No evidence signals available</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
