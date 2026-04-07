export const PARCEL_STATUSES = [
  'manifest_received',
  'in_transit',
  'dropped_at_affiliate',
  'ready_to_collect',
  'collected',
  'exception',
] as const;

export type ParcelStatus = (typeof PARCEL_STATUSES)[number];
