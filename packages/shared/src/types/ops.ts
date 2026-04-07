import type { ParcelStatus } from './parcel.js';

/** Ops dashboard — parcel volume by status (Phase 7). */
export type OpsParcelStatusCount = {
  status: ParcelStatus;
  count: number;
};

export type OpsStatsPublic = {
  parcelCountsByStatus: OpsParcelStatusCount[];
  totalParcels: number;
  totalAffiliates: number;
};

/** Affiliate pin for ops map (coordinates optional until geocoded). */
export type OpsAffiliateMapPinPublic = {
  id: string;
  displayName: string;
  postcode: string;
  verificationStatus: string;
  isAvailable: boolean;
  latitude: string | null;
  longitude: string | null;
};
