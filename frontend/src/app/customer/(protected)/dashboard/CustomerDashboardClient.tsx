'use client';

import Link from 'next/link';
import { AffiliateMap } from '@/components/customer/AffiliateMap';
import { DsCard } from '@/components/ds/DsCard';
import { DsPageHeader } from '@/components/ds/DsPageHeader';
import { DsSection } from '@/components/ds/DsSection';
import { dsButtonClassName } from '@/components/ds/button-variants';
import { useAffiliateMatch } from '@/lib/hooks/useAffiliateMatch';

export function CustomerDashboardClient() {
  const { affiliate, loading, error } = useAffiliateMatch();

  return (
    <div className="space-y-10">
      <DsPageHeader
        title="Your dashboard"
        description="Track parcels headed to you and see your matched pickup hub for your postcode."
      />

      <DsCard>
        <h2 className="text-lg font-semibold text-neutral-900">Parcels</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          View status updates and collection codes when a parcel is ready.
        </p>
        <Link
          href="/customer/parcels"
          className={`${dsButtonClassName('primary')} mt-5 inline-flex w-full justify-center sm:w-auto`}
        >
          Go to parcels
        </Link>
      </DsCard>

      <DsSection title="Pickup hub for your postcode" sectionId="customer-dashboard-hub">
        {loading ? <p className="text-sm text-neutral-500">Loading match…</p> : null}
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && affiliate ? <AffiliateMap affiliate={affiliate} /> : null}
        {!loading && !error && !affiliate ? (
          <p className="text-sm leading-relaxed text-neutral-600">
            No pickup hub is available for your postcode yet. We&apos;ll assign one when a carrier books
            your delivery.
          </p>
        ) : null}
      </DsSection>
    </div>
  );
}
