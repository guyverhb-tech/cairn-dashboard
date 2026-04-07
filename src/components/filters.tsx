'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const verticals = [
  { value: 'all', label: 'All Verticals' },
  { value: 'finserv', label: 'Financial Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail' },
];

const geographiesByRegion: Record<string, { value: string; label: string; isRegion?: boolean }[]> = {
  all: [
    { value: 'all', label: 'All Countries' },
    // Regions
    { value: 'region:emea', label: 'EMEA (All)', isRegion: true },
    { value: 'region:namer', label: 'NAMER (All)', isRegion: true },
    { value: 'region:apj', label: 'APJ (All)', isRegion: true },
    // EMEA Countries
    { value: 'uk', label: 'UK' },
    { value: 'france', label: 'France' },
    { value: 'germany', label: 'Germany' },
    { value: 'netherlands', label: 'Netherlands' },
    { value: 'ireland', label: 'Ireland' },
    { value: 'switzerland', label: 'Switzerland' },
    { value: 'spain', label: 'Spain' },
    { value: 'italy', label: 'Italy' },
    { value: 'sweden', label: 'Sweden' },
    // NAMER Countries
    { value: 'us', label: 'United States' },
    { value: 'canada', label: 'Canada' },
    { value: 'mexico', label: 'Mexico' },
    // APJ Countries
    { value: 'australia', label: 'Australia' },
    { value: 'japan', label: 'Japan' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'india', label: 'India' },
  ],
  emea: [
    { value: 'all', label: 'All EMEA' },
    { value: 'uk', label: 'UK' },
    { value: 'france', label: 'France' },
    { value: 'germany', label: 'Germany' },
    { value: 'netherlands', label: 'Netherlands' },
    { value: 'ireland', label: 'Ireland' },
    { value: 'switzerland', label: 'Switzerland' },
    { value: 'spain', label: 'Spain' },
    { value: 'italy', label: 'Italy' },
    { value: 'sweden', label: 'Sweden' },
  ],
  namer: [
    { value: 'all', label: 'All NAMER' },
    { value: 'us', label: 'United States' },
    { value: 'canada', label: 'Canada' },
    { value: 'mexico', label: 'Mexico' },
  ],
  apj: [
    { value: 'all', label: 'All APJ' },
    { value: 'australia', label: 'Australia' },
    { value: 'japan', label: 'Japan' },
    { value: 'singapore', label: 'Singapore' },
    { value: 'india', label: 'India' },
  ],
};

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'weakened', label: 'Weakened' },
];

const timingOptions = [
  { value: 'all', label: 'All Timing' },
  { value: 'early', label: 'Early' },
  { value: 'accelerating', label: 'Accelerating' },
  { value: 'plateau', label: 'Plateau' },
  { value: 'declining', label: 'Declining' },
];

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

export function DashboardFilters({ selectedRegion }: { selectedRegion: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentVertical = searchParams.get('vertical') ?? 'all';
  const currentGeography = searchParams.get('geography') ?? 'all';
  const currentStatus = searchParams.get('status') ?? 'all';
  const currentTiming = searchParams.get('timing') ?? 'all';
  const currentDateRange = searchParams.get('dateRange') ?? 'all';

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      if (selectedRegion !== 'all') {
        params.set('region', selectedRegion);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, selectedRegion]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedRegion !== 'all') {
      params.set('region', selectedRegion);
    }
    router.push(`?${params.toString()}`);
  }, [router, selectedRegion]);

  const hasActiveFilters =
    currentVertical !== 'all' ||
    currentGeography !== 'all' ||
    currentStatus !== 'all' ||
    currentTiming !== 'all' ||
    currentDateRange !== 'all';

  const geographies = geographiesByRegion[selectedRegion] || geographiesByRegion.all;

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Vertical</label>
          <Select value={currentVertical} onValueChange={(v) => updateFilter('vertical', v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Verticals" />
            </SelectTrigger>
            <SelectContent>
              {verticals.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Region / Country</label>
          <Select value={currentGeography} onValueChange={(v) => updateFilter('geography', v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              {geographies.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Trend Status</label>
          <Select value={currentStatus} onValueChange={(v) => updateFilter('status', v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Timing</label>
          <Select value={currentTiming} onValueChange={(v) => updateFilter('timing', v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Timing" />
            </SelectTrigger>
            <SelectContent>
              {timingOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
          <Select value={currentDateRange} onValueChange={(v) => updateFilter('dateRange', v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-0.5">
            Clear All
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
          {currentVertical !== 'all' && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('vertical', 'all')}>
              {verticals.find((v) => v.value === currentVertical)?.label} x
            </Badge>
          )}
          {currentGeography !== 'all' && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('geography', 'all')}>
              {geographies.find((g) => g.value === currentGeography)?.label} x
            </Badge>
          )}
          {currentStatus !== 'all' && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('status', 'all')}>
              {statusOptions.find((s) => s.value === currentStatus)?.label} x
            </Badge>
          )}
          {currentTiming !== 'all' && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('timing', 'all')}>
              {timingOptions.find((t) => t.value === currentTiming)?.label} x
            </Badge>
          )}
          {currentDateRange !== 'all' && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('dateRange', 'all')}>
              {dateRangeOptions.find((d) => d.value === currentDateRange)?.label} x
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
