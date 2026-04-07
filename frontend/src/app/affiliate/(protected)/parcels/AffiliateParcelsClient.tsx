'use client';

import type { ParcelStatus } from '@neardrop/shared';
import { useMemo, useState } from 'react';
import { AffiliateParcelTable } from '@/components/affiliate/AffiliateParcelTable';
import { useParcels, sortParcelsByUpdatedDesc } from '@/lib/hooks/useParcels';

const statusOptions: Array<{ value: '' | ParcelStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'manifest_received', label: 'Manifest received' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'dropped_at_affiliate', label: 'At affiliate' },
  { value: 'ready_to_collect', label: 'Ready to collect' },
  { value: 'collected', label: 'Collected' },
  { value: 'exception', label: 'Exception' },
];

export function AffiliateParcelsClient() {
  const [status, setStatus] = useState<ParcelStatus | ''>('');
  const query = useMemo(
    () => ({
      page: 1,
      limit: 50,
      ...(status ? { status } : {}),
    }),
    [status],
  );
  const { data, loading, error, refetch } = useParcels(query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Parcels</h1>
          <p className="mt-1 text-neutral-600">Confirm receipt when parcels arrive at your hub.</p>
        </div>
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus((e.target.value as ParcelStatus | '') || '')}
            className="min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 sm:w-auto sm:text-sm"
            data-testid="affiliate-parcel-status-filter"
          >
            {statusOptions.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500" data-testid="parcels-loading">
          Loading parcels...
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && data ? (
        <>
          <p className="text-sm text-neutral-600">
            {data.total} parcel{data.total === 1 ? '' : 's'} (page {data.page}).
          </p>
          <AffiliateParcelTable parcels={sortParcelsByUpdatedDesc(data.items)} onUpdated={refetch} />
        </>
      ) : null}
    </div>
  );
}
