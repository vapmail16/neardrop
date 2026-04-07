'use client';

import type { ParcelStatus } from '@neardrop/shared';
import { useMemo, useState } from 'react';
import { CustomerParcelCard } from '@/components/customer/CustomerParcelCard';
import { DsEmptyState } from '@/components/ds/DsEmptyState';
import { DsPageHeader } from '@/components/ds/DsPageHeader';
import { useCustomerParcels } from '@/lib/hooks/useCustomerParcels';
import { sortParcelsByUpdatedDesc } from '@/lib/hooks/useParcels';

const statusOptions: Array<{ value: '' | ParcelStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'manifest_received', label: 'Manifest received' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'dropped_at_affiliate', label: 'At affiliate' },
  { value: 'ready_to_collect', label: 'Ready to collect' },
  { value: 'collected', label: 'Collected' },
  { value: 'exception', label: 'Exception' },
];

export function CustomerParcelsClient() {
  const [status, setStatus] = useState<ParcelStatus | ''>('');
  const query = useMemo(
    () => ({
      page: 1,
      limit: 50,
      ...(status ? { status } : {}),
    }),
    [status],
  );
  const { data, loading, error, refetch } = useCustomerParcels(query);

  return (
    <div className="space-y-8">
      <DsPageHeader
        title="Your parcels"
        description="Status updates refresh about every 30 seconds."
        action={
          <div className="w-full sm:w-auto">
            <label htmlFor="cust-status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="cust-status-filter"
              value={status}
              onChange={(e) => setStatus((e.target.value as ParcelStatus | '') || '')}
              className="nd-select min-w-[12rem]"
              data-testid="customer-parcel-status-filter"
            >
              {statusOptions.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-neutral-500" data-testid="customer-parcels-loading">
          Loading parcels…
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}{' '}
          <button
            type="button"
            className="ml-1 inline rounded-lg px-2 py-1 text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </p>
      ) : null}
      {!loading && !error && data ? (
        <>
          <p className="text-sm text-neutral-600">
            {data.total} parcel{data.total === 1 ? '' : 's'}.
          </p>
          {data.items.length === 0 ? (
            <DsEmptyState
              title="No parcels yet"
              description="Check back after your carrier dispatches a parcel to your postcode."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {sortParcelsByUpdatedDesc(data.items).map((p) => (
                <li key={p.id}>
                  <CustomerParcelCard parcel={p} />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}
