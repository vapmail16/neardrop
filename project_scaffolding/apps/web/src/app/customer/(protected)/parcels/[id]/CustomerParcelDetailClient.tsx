'use client';

import Link from 'next/link';
import { AffiliateMap } from '@/components/customer/AffiliateMap';
import { QRDisplay } from '@/components/customer/QRDisplay';
import { StatusBadge } from '@/components/carrier/StatusBadge';
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
        <button type="button" className="underline" onClick={() => void refetch()}>
          Retry
        </button>
      </p>
    );
  }
  if (!parcel) {
    return (
      <div className="space-y-4">
        <p className="text-neutral-600">Parcel not found or not linked to your account.</p>
        <Link href="/customer/parcels" className="text-sm font-medium text-neutral-900 underline">
          Back to parcels
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/customer/parcels" className="text-sm text-neutral-600 underline">
          ← Parcels
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
          {parcel.carrierRef ?? 'Parcel'}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={parcel.status} />
          <span className="text-sm text-neutral-600">{parcel.recipientPostcode}</span>
        </div>
      </div>

      {qrEnabled ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-900">Collect</h2>
          {qrLoading ? <p className="text-sm text-neutral-500">Loading collection code…</p> : null}
          {qrError ? (
            <p className="text-sm text-red-600" role="alert">
              {qrError}
            </p>
          ) : null}
          {qrData ? <QRDisplay token={qrData.qrToken} expiresAt={qrData.expiresAt} /> : null}
        </div>
      ) : (
        <p className="text-sm text-neutral-600">
          Your collection QR will appear here when the parcel is ready to collect.
        </p>
      )}

      {parcel.affiliateId ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">Where to collect</h2>
          {affLoading ? <p className="text-sm text-neutral-500">Loading location…</p> : null}
          {affError ? (
            <p className="text-sm text-red-600" role="alert">
              {affError}
            </p>
          ) : null}
          {affiliate ? <AffiliateMap affiliate={affiliate} /> : null}
        </div>
      ) : null}
    </div>
  );
}
