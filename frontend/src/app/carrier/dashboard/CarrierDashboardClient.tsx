'use client';

import Link from 'next/link';
import { ParcelTable } from '@/components/carrier/ParcelTable';
import { sortParcelsByUpdatedDesc, useParcels } from '@/lib/hooks/useParcels';

export function CarrierDashboardClient() {
  const { data, loading, error, refetch } = useParcels({ page: 1, limit: 8 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-neutral-600">Recent parcels and quick links.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/carrier/manifests"
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-300"
        >
          <h2 className="font-medium text-neutral-900">Upload manifest</h2>
          <p className="mt-1 text-sm text-neutral-600">Add parcels from a CSV file.</p>
        </Link>
        <Link
          href="/carrier/parcels"
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-300"
        >
          <h2 className="font-medium text-neutral-900">All parcels</h2>
          <p className="mt-1 text-sm text-neutral-600">Filter, update status, confirm drops.</p>
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium text-neutral-900">Recent parcels</h2>
        {loading ? (
          <p className="text-sm text-neutral-500" data-testid="dashboard-loading">
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
            <p className="mb-3 text-sm text-neutral-600">
              Showing {data.items.length} of {data.total} parcel{data.total === 1 ? '' : 's'}.
            </p>
            <ParcelTable parcels={sortParcelsByUpdatedDesc(data.items)} onUpdated={refetch} />
          </>
        ) : null}
      </section>
    </div>
  );
}
