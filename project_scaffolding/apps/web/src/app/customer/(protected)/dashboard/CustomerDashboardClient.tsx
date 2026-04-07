'use client';

import Link from 'next/link';
import { AffiliateMap } from '@/components/customer/AffiliateMap';
import { useAffiliateMatch } from '@/lib/hooks/useAffiliateMatch';

export function CustomerDashboardClient() {
  const { affiliate, loading, error } = useAffiliateMatch();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Your dashboard</h1>
        <p className="mt-1 text-neutral-600">
          Track parcels headed to you and see your matched pickup hub for your postcode.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">Parcels</h2>
        <p className="mt-2 text-sm text-neutral-600">
          View status updates and collection codes when a parcel is ready.
        </p>
        <Link
          href="/customer/parcels"
          className="mt-4 inline-block text-sm font-medium text-neutral-900 underline"
        >
          Go to parcels
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">Pickup hub for your postcode</h2>
        {loading ? <p className="text-sm text-neutral-500">Loading match…</p> : null}
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && affiliate ? <AffiliateMap affiliate={affiliate} /> : null}
        {!loading && !error && !affiliate ? (
          <p className="text-sm text-neutral-600">
            No pickup hub is available for your postcode yet. We&apos;ll assign one when a carrier
            books your delivery.
          </p>
        ) : null}
      </div>
    </div>
  );
}
