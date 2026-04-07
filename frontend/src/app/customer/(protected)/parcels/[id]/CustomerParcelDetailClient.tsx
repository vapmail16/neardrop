'use client';

import Link from 'next/link';
import { AffiliateMap } from '@/components/customer/AffiliateMap';
import { QRDisplay } from '@/components/customer/QRDisplay';
import { StatusBadge } from '@/components/carrier/StatusBadge';
import { DsCard } from '@/components/ds/DsCard';
import { DsPageHeader } from '@/components/ds/DsPageHeader';
import { DsSection } from '@/components/ds/DsSection';
import { dsButtonClassName } from '@/components/ds/button-variants';
import { useAffiliateSummary } from '@/lib/hooks/useAffiliateSummary';
import { useCollectionQr } from '@/lib/hooks/useCollectionQr';
import { useParcel } from '@/lib/hooks/useParcel';

export function CustomerParcelDetailClient({ parcelId }: { parcelId: string }) {
  const { parcel, loading, error, refetch } = useParcel(parcelId);

  const qrEnabled = parcel?.status === 'ready_to_collect';
  const { data: qrData, loading: qrLoading, error: qrError } = useCollectionQr(parcelId, qrEnabled);

  const { affiliate, loading: affLoading, error: affError } = useAffiliateSummary(
    parcel?.affiliateId ?? null,
  );

  if (loading && !parcel) {
    return <p className="text-sm text-neutral-500">Loading…</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {error}{' '}
        <button type="button" className="font-medium text-brand-700 underline" onClick={() => void refetch()}>
          Retry
        </button>
      </p>
    );
  }
  if (!parcel) {
    return (
      <div className="space-y-4">
        <p className="text-neutral-600">Parcel not found or not linked to your account.</p>
        <Link href="/customer/parcels" className={`${dsButtonClassName('secondary')} inline-flex`}>
          Back to parcels
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/customer/parcels"
          className="text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          ← Parcels
        </Link>
        <DsPageHeader
          title={parcel.carrierRef ?? 'Parcel'}
          description={parcel.recipientPostcode}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={parcel.status} />
            </div>
          }
        />
      </div>

      <DsSection title="Collect" sectionId="customer-parcel-collect">
        {qrEnabled ? (
          <>
            {qrLoading ? <p className="text-sm text-neutral-500">Loading collection code…</p> : null}
            {qrError ? (
              <p className="text-sm text-red-600" role="alert">
                {qrError}
              </p>
            ) : null}
            {qrData ? (
              <DsCard padding="lg">
                <QRDisplay token={qrData.qrToken} expiresAt={qrData.expiresAt} />
              </DsCard>
            ) : null}
          </>
        ) : (
          <p className="text-sm leading-relaxed text-neutral-600">
            Your collection QR will appear here when the parcel is ready to collect.
          </p>
        )}
      </DsSection>

      {parcel.affiliateId ? (
        <DsSection title="Where to collect" sectionId="customer-parcel-location">
          {affLoading ? <p className="text-sm text-neutral-500">Loading location…</p> : null}
          {affError ? (
            <p className="text-sm text-red-600" role="alert">
              {affError}
            </p>
          ) : null}
          {affiliate ? <AffiliateMap affiliate={affiliate} /> : null}
        </DsSection>
      ) : null}
    </div>
  );
}
