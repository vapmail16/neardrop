import type { ParcelStatus } from '@neardrop/shared';

/** Next statuses a carrier may set via PATCH (MVP state machine). */
export function carrierAllowedNextStatuses(current: ParcelStatus): ParcelStatus[] {
  switch (current) {
    case 'manifest_received':
      return ['in_transit'];
    case 'in_transit':
      return ['dropped_at_affiliate'];
    case 'dropped_at_affiliate':
      return ['ready_to_collect'];
    default:
      return [];
  }
}

export function carrierActionLabel(next: ParcelStatus): string {
  switch (next) {
    case 'in_transit':
      return 'Mark in transit';
    case 'dropped_at_affiliate':
      return 'Confirm drop at affiliate';
    case 'ready_to_collect':
      return 'Mark ready to collect';
    default:
      return next;
  }
}
