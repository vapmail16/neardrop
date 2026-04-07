import type { ParcelStatus } from '@neardrop/shared';

/** Normalised inbound carrier webhook / manifest row (Phase 2+). */
export type NormalisedParcelInbound = {
  carrierRef: string;
  recipientPostcode: string;
  recipientName: string;
  recipientEmail?: string;
  status: ParcelStatus;
};

export interface ICarrierGateway {
  normaliseManifestPayload(raw: unknown): NormalisedParcelInbound[];
}
