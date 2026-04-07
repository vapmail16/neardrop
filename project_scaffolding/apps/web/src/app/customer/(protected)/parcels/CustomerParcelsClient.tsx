'use client';

import type { ParcelStatus } from '@neardrop/shared';
import { useMemo, useState } from 'react';
import { CustomerParcelCard } from '@/components/customer/CustomerParcelCard';
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Your parcels</h1>
          <p className="mt-1 text-neutral-600">Status updates refresh about every 30 seconds.</p>
        </div>
        <div>
          <label htmlFor="cust-status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="cust-status-filter"
            value={status}
            onChange={(e) => setStatus((e.target.value as ParcelStatus | '') || '')}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            data-testid="customer-parcel-status-filter"
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
        <p className="text-sm text-neutral-500" data-testid="customer-parcels-loading">
          Loading parcels…
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Retry
          </button>
        </p>
      ) : null}
      {!loading && !error && data ? (
        <>
          <p className="text-sm text-neutral-600">
            {data.total} parcel{data.total === 1 ? '' : 's'}.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {sortParcelsByUpdatedDesc(data.items).map((p) => (
              <li key={p.id}>
                <CustomerParcelCard parcel={p} />
              </li>
            ))}
          </ul>
          {data.items.length === 0 ? (
            <p className="text-sm text-neutral-600">No parcels yet — check back after dispatch.</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
