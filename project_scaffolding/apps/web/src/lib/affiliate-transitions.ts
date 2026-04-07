import type { ParcelStatus } from '@neardrop/shared';

/** Next statuses an affiliate may set via PATCH (confirm receipt at hub). */
export function affiliateAllowedNextStatuses(current: ParcelStatus): ParcelStatus[] {
  if (current === 'in_transit') return ['dropped_at_affiliate'];
  return [];
}

export function affiliateActionLabel(next: ParcelStatus): string {
  if (next === 'dropped_at_affiliate') return 'Confirm parcel received';
  return next;
}
