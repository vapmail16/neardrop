import type { ParcelStatus, UserRole } from '@neardrop/shared';

/** `system` covers automated transitions (e.g. after drop confirm). */
export type TransitionActor = UserRole | 'system';

/**
 * Returns whether `actor` may move a parcel from `from` to `to`.
 * Ref: NEARDROP_MVP_IMPLEMENTATION_PLAN.md § Phase 2 state machine.
 */
export function canTransition(
  from: ParcelStatus,
  to: ParcelStatus,
  actor: TransitionActor,
): boolean {
  if (from === to) return false;

  if (to === 'exception') {
    return actor === 'affiliate' || actor === 'ops';
  }

  if (from === 'exception' && to === 'ready_to_collect') {
    return actor === 'ops';
  }

  if (from === 'manifest_received' && to === 'in_transit') {
    return actor === 'carrier';
  }

  if (from === 'in_transit' && to === 'dropped_at_affiliate') {
    return actor === 'carrier' || actor === 'affiliate';
  }

  if (from === 'dropped_at_affiliate' && to === 'ready_to_collect') {
    return actor === 'carrier' || actor === 'ops' || actor === 'system';
  }

  /** Collected is applied via `POST /api/v1/parcels/:id/collect` (QR + earning). Ops may force status for support. */
  if (from === 'ready_to_collect' && to === 'collected') {
    return actor === 'ops';
  }

  return false;
}

export function transitionDeniedReason(
  from: ParcelStatus,
  to: ParcelStatus,
  actor: TransitionActor,
): string | null {
  if (canTransition(from, to, actor)) return null;
  if (from === to) return 'Parcel is already in this status';
  return `Cannot transition from "${from}" to "${to}" for this role`;
}
