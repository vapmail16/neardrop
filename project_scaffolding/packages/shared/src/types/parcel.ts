import type { ParcelStatus } from '../constants/parcelStatuses.js';

export type { ParcelStatus };

export type ParcelId = string;

export type ParcelPublic = {
  id: string;
  carrierId: string;
  carrierRef: string | null;
  affiliateId: string | null;
  customerId: string | null;
  recipientName: string;
  recipientPostcode: string;
  recipientEmail: string | null;
  status: ParcelStatus;
  estimatedDropTime: string | null;
  actualDropTime: string | null;
  collectionTime: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ParcelStatusHistoryPublic = {
  id: string;
  parcelId: string;
  status: ParcelStatus;
  actorId: string | null;
  actorRole: string | null;
  note: string | null;
  createdAt: string;
};

export type ManifestUploadSummary = {
  total: number;
  matchedAffiliate: number;
  unmatched: number;
  parcelIds: string[];
};
