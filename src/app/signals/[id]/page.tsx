import { getSignal } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function SignalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const signal = await getSignal(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Signal Details</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {signal.vertical}
              </Badge>
              <Badge variant="secondary">
                {signal.geography.toUpperCase()}
              </Badge>
              <Badge variant="outline">{signal.signalType}</Badge>
            </div>
            <CardTitle>{signal.title}</CardTitle>
            <CardDescription>
              {signal.sourceName} &middot; {new Date(signal.timestamp).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {signal.summary && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-600">{signal.summary}</p>
              </div>
            )}

            {signal.frameworkMapping && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Framework Mapping</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {signal.frameworkMapping.goal && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Goal</p>
                      <p className="text-sm text-gray-700">{signal.frameworkMapping.goal}</p>
                    </div>
                  )}
                  {signal.frameworkMapping.blocker && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Blocker</p>
                      <p className="text-sm text-gray-700">{signal.frameworkMapping.blocker}</p>
                    </div>
                  )}
                  {signal.frameworkMapping.solutionApproach && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Solution Approach</p>
                      <p className="text-sm text-gray-700">{signal.frameworkMapping.solutionApproach}</p>
                    </div>
                  )}
                  {signal.frameworkMapping.twilioCapability && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Twilio Capability</p>
                      <p className="text-sm text-gray-700">{signal.frameworkMapping.twilioCapability}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Source</h3>
              <a
                href={signal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {signal.sourceUrl}
              </a>
            </div>

            {signal.relevanceScore !== undefined && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Relevance Score</h3>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${signal.relevanceScore * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {(signal.relevanceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
