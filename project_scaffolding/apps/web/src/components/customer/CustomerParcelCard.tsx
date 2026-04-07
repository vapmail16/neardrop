import type { ParcelPublic } from '@neardrop/shared';
import Link from 'next/link';
import { StatusBadge } from '@/components/carrier/StatusBadge';

export function CustomerParcelCard({ parcel }: { parcel: ParcelPublic }) {
  return (
    <Link
      href={`/customer/parcels/${parcel.id}`}
      className="block rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300"
      data-testid="customer-parcel-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-neutral-900">{parcel.carrierRef ?? parcel.id.slice(0, 8)}</p>
        <StatusBadge status={parcel.status} />
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        {parcel.recipientPostcode}
        {parcel.estimatedDropTime ? ` · Est. drop ${new Date(parcel.estimatedDropTime).toLocaleString()}` : null}
      </p>
    </Link>
  );
}
