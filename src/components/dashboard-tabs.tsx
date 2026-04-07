'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { DigestTab } from '@/components/digest-tab';
import type { Signal, Trend, RegionDigest } from '@/lib/api';
import { getDigest } from '@/lib/api';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function RegionBadge({ region }: { region?: string }) {
  if (!region) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600">
        EMEA
      </Badge>
    );
  }
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
    uk: '\u{1F1EC}\u{1F1E7}', france: '\u{1F1EB}\u{1F1F7}', germany: '\u{1F1E9}\u{1F1EA}',
    netherlands: '\u{1F1F3}\u{1F1F1}', ireland: '\u{1F1EE}\u{1F1EA}', switzerland: '\u{1F1E8}\u{1F1ED}',
    spain: '\u{1F1EA}\u{1F1F8}', italy: '\u{1F1EE}\u{1F1F9}', sweden: '\u{1F1F8}\u{1F1EA}',
    us: '\u{1F1FA}\u{1F1F8}', canada: '\u{1F1E8}\u{1F1E6}', mexico: '\u{1F1F2}\u{1F1FD}',
    australia: '\u{1F1E6}\u{1F1FA}', japan: '\u{1F1EF}\u{1F1F5}', singapore: '\u{1F1F8}\u{1F1EC}', india: '\u{1F1EE}\u{1F1F3}',
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
      {'\u{1F310}'} Cross-Region
    </Badge>
  );
}

export function DashboardTabs({
  signals,
  trends,
  selectedRegion,
}: {
  signals: Signal[];
  trends: Trend[];
  selectedRegion: string;
}) {
  const [digest, setDigest] = useState<RegionDigest | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestError, setDigestError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('trends');

  async function loadDigest(refresh = false) {
    setDigestLoading(true);
    setDigestError(null);
    try {
      const result = await getDigest(selectedRegion, refresh);
      setDigest(result.digest);
    } catch (err) {
      setDigestError(err instanceof Error ? err.message : 'Failed to load digest');
    } finally {
      setDigestLoading(false);
    }
  }

  // Load digest when tab is selected or region changes
  useEffect(() => {
    if (activeTab === 'digest' && !digest) {
      loadDigest();
    }
  }, [activeTab, selectedRegion]);

  // Reset digest when region changes
  useEffect(() => {
    setDigest(null);
  }, [selectedRegion]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="digest">Digest</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="signals">Recent Signals</TabsTrigger>
      </TabsList>

      <TabsContent value="digest">
        <Card>
          <CardHeader>
            <CardTitle>Intelligence Digest</CardTitle>
            <CardDescription>
              AI-synthesized analysis per vertical, deduplicated and reviewed by Skeptic Agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {digestError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{digestError}</p>
                <button
                  onClick={() => loadDigest(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <DigestTab
                digest={digest}
                trends={trends}
                selectedRegion={selectedRegion}
                loading={digestLoading}
                onRefresh={() => loadDigest(true)}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trends">
        <Card>
          <CardHeader>
            <CardTitle>Detected Trends</CardTitle>
            <CardDescription>
              Cross-market patterns identified by Cairn, reviewed by Skeptic Agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trends.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No trends detected yet</p>
            ) : (
              <div className="space-y-4">
                {trends.map((trend) => (
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
                  {signals.map((signal) => (
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
  );
}
