import type { ParcelPublic, ParcelStatus } from '@neardrop/shared';
import type { ParcelRow } from './parcel.repository.js';

function iso(d: Date | string | null | undefined): string | null {
  if (d == null) return null;
  if (typeof d === 'string') return d;
  return d.toISOString();
}

export function toParcelPublic(row: ParcelRow): ParcelPublic {
  return {
    id: row.id,
    carrierId: row.carrier_id,
    carrierRef: row.carrier_ref,
    affiliateId: row.affiliate_id,
    customerId: row.customer_id,
    recipientName: row.recipient_name,
    recipientPostcode: row.recipient_postcode,
    recipientEmail: row.recipient_email,
    status: row.status as ParcelStatus,
    estimatedDropTime: iso(row.estimated_drop_time),
    actualDropTime: iso(row.actual_drop_time),
    collectionTime: iso(row.collection_time),
    createdAt: iso(row.created_at) ?? '',
    updatedAt: iso(row.updated_at) ?? '',
  };
}
