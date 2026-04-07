'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { DigestCard, RegionDigest, IndustryBriefing, Trend } from '@/lib/api';
import { generateBriefing } from '@/lib/api';

const verticalLabels: Record<string, string> = {
  finserv: 'Financial Services',
  healthcare: 'Healthcare',
  retail: 'Retail & Consumer',
};

const regionLabels: Record<string, string> = {
  emea: 'EMEA',
  namer: 'NAMER',
  apj: 'APJ',
};

const qualityColors: Record<string, string> = {
  strong: 'bg-green-100 text-green-800 border-green-300',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  weak: 'bg-red-100 text-red-800 border-red-300',
};

function SignalQualityBadge({ quality }: { quality: string }) {
  return (
    <Badge variant="outline" className={qualityColors[quality] || ''}>
      {quality.charAt(0).toUpperCase() + quality.slice(1)} Signal
    </Badge>
  );
}

function DigestCardComponent({
  card,
  trends,
}: {
  card: DigestCard;
  trends: Trend[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const underlyingTrends = trends.filter(t => card.underlyingTrendIds.includes(t.id));

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge className="bg-blue-600 text-white">
            {verticalLabels[card.vertical]}
          </Badge>
          <Badge variant="outline">
            {regionLabels[card.region]}
          </Badge>
          <SignalQualityBadge quality={card.signalQuality} />
        </div>
        <CardTitle className="text-lg leading-tight">{card.headline}</CardTitle>
        <CardDescription>
          Synthesized from {card.trendCount} underlying trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Movements */}
        {card.keyMovements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Movements</h4>
            <ul className="space-y-1">
              {card.keyMovements.map((movement, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {movement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skeptic Summary */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h4 className="text-sm font-semibold text-yellow-800 mb-1">Skeptic Assessment</h4>
          <p className="text-sm text-yellow-700">{card.skepticSummary}</p>
        </div>

        {/* Twilio Relevance */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Twilio Relevance</h4>
          <p className="text-sm text-gray-600">{card.twilioRelevance}</p>
        </div>

        {/* Underlying Trends (Collapsible) */}
        {underlyingTrends.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>View {underlyingTrends.length} underlying trends</span>
                <span>{isOpen ? '▲' : '▼'}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {underlyingTrends.map((trend) => (
                <div
                  key={trend.id}
                  className="p-2 bg-white border rounded text-sm"
                >
                  <p className="font-medium text-gray-900">{trend.title}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    <span className={
                      trend.status === 'confirmed' ? 'text-green-600' :
                      trend.status === 'weakened' ? 'text-amber-600' : 'text-red-600'
                    }>
                      {trend.status === 'weakened' ? 'Under Review' : trend.status}
                    </span>
                    {' • '}
                    <span className={
                      trend.confidenceScore >= 0.7 ? 'text-green-600' :
                      trend.confidenceScore >= 0.4 ? 'text-amber-600' : 'text-red-600'
                    }>
                      {(trend.confidenceScore * 100).toFixed(0)}% confidence
                    </span>
                  </p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

function BriefingModal({
  region,
  disabled,
}: {
  region: string;
  disabled: boolean;
}) {
  const [briefing, setBriefing] = useState<IndustryBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'text' | 'markdown' | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const result = await generateBriefing(region);
      setBriefing(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate briefing');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(type: 'text' | 'markdown') {
    if (!briefing) return;
    const content = type === 'markdown' ? briefing.markdown : briefing.content;
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 3000);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="bg-blue-600 hover:bg-blue-700">
          Generate Industry Briefing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Industry Briefing</DialogTitle>
          <DialogDescription>
            A synthesized briefing document ready to paste into Gemini alongside deal context.
          </DialogDescription>
        </DialogHeader>

        {!briefing && !loading && !error && (
          <div className="py-8 text-center">
            <p className="text-gray-600 mb-4">
              Generate a comprehensive industry briefing for {region === 'all' ? 'all regions' : region.toUpperCase()}.
            </p>
            <Button onClick={handleGenerate}>
              Generate Briefing
            </Button>
          </div>
        )}

        {loading && (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating briefing... This may take up to 30 seconds.</p>
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleGenerate} variant="outline">
              Retry
            </Button>
          </div>
        )}

        {briefing && (
          <div className="space-y-4">
            {/* Copy success toast */}
            {copied && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 animate-in fade-in slide-in-from-top-2 duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">
                  {copied === 'text' ? 'Plain text copied to clipboard!' : 'Markdown copied to clipboard!'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {briefing.wordCount} words • Generated {new Date(briefing.generatedAt).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={copied === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => copyToClipboard('text')}
                  className={copied === 'text' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {copied === 'text' ? 'Copied!' : 'Copy Plain Text'}
                </Button>
                <Button
                  variant={copied === 'markdown' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => copyToClipboard('markdown')}
                  className={copied === 'markdown' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {copied === 'markdown' ? 'Copied!' : 'Copy Markdown'}
                </Button>
              </div>
            </div>
            <pre className="bg-gray-50 border rounded-lg p-4 text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
              {briefing.content}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function DigestTab({
  digest,
  trends,
  selectedRegion,
  loading,
  onRefresh,
}: {
  digest: RegionDigest | null;
  trends: Trend[];
  selectedRegion: string;
  loading: boolean;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Loading indicator */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-blue-700 font-medium">Generating analysis...</p>
            </div>
            <p className="text-sm text-blue-600">Synthesizing trends using AI. This may take 15-30 seconds.</p>
          </CardContent>
        </Card>

        {/* Card skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2 border-dashed border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex gap-2 mb-2">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-16 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!digest || digest.cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Digest Available</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {trends.length === 0
              ? 'Cairn is still gathering signals for this region. A digest will be generated once trend analysis is complete.'
              : 'Generate a synthesized analysis of the current trends and signals.'}
          </p>
          <Button onClick={onRefresh} className="bg-blue-600 hover:bg-blue-700">
            Generate Digest
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group cards by region if viewing "all"
  const cardsByRegion = new Map<string, DigestCard[]>();
  for (const card of digest.cards) {
    const region = card.region;
    const existing = cardsByRegion.get(region) || [];
    existing.push(card);
    cardsByRegion.set(region, existing);
  }

  const regions = selectedRegion === 'all' ? ['emea', 'namer', 'apj'] : [selectedRegion];

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Synthesized Analysis</h3>
          <p className="text-sm text-gray-500">
            AI-generated digest of {trends.length} trends •
            Last updated {new Date(digest.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
          <BriefingModal region={selectedRegion} disabled={!digest} />
        </div>
      </div>

      {/* Digest cards by region */}
      {regions.map((region) => {
        const regionCards = cardsByRegion.get(region) || [];
        if (regionCards.length === 0) return null;

        return (
          <div key={region}>
            {selectedRegion === 'all' && (
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Badge variant="outline" className={
                  region === 'emea' ? 'bg-indigo-100 text-indigo-800' :
                  region === 'namer' ? 'bg-orange-100 text-orange-800' :
                  'bg-teal-100 text-teal-800'
                }>
                  {regionLabels[region]}
                </Badge>
              </h4>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {regionCards.map((card, i) => (
                <DigestCardComponent
                  key={`${card.region}-${card.vertical}-${i}`}
                  card={card}
                  trends={trends}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Cross-region patterns */}
      {digest.crossRegionPatterns && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Cross-Region Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{digest.crossRegionPatterns}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
