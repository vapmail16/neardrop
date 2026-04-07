import type {
  ManifestUploadBody,
  ManifestUploadSummary,
  ParcelListQuery,
  ParcelPublic,
  ParcelStatus,
  ParcelStatusPatchBody,
} from '@neardrop/shared';
import { apiFetchJson } from './client';

export type ParcelListResult = {
  items: ParcelPublic[];
  total: number;
  page: number;
  limit: number;
};

function toQuery(q: ParcelListQuery): string {
  const p = new URLSearchParams();
  p.set('page', String(q.page));
  p.set('limit', String(q.limit));
  if (q.status) p.set('status', q.status);
  return p.toString();
}

export async function listParcels(query: ParcelListQuery): Promise<ParcelListResult> {
  const qs = toQuery(query);
  return apiFetchJson<ParcelListResult>(`/api/v1/parcels?${qs}`);
}

export async function uploadManifest(body: ManifestUploadBody): Promise<ManifestUploadSummary> {
  return apiFetchJson<ManifestUploadSummary>('/api/v1/parcels/manifest', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function patchParcelStatus(
  parcelId: string,
  body: ParcelStatusPatchBody,
): Promise<{ parcel: ParcelPublic }> {
  return apiFetchJson<{ parcel: ParcelPublic }>(`/api/v1/parcels/${parcelId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function setParcelStatus(
  parcelId: string,
  status: ParcelStatus,
): Promise<{ parcel: ParcelPublic }> {
  return patchParcelStatus(parcelId, { status });
}

export async function getParcel(parcelId: string): Promise<ParcelPublic> {
  const { parcel } = await apiFetchJson<{ parcel: ParcelPublic }>(`/api/v1/parcels/${parcelId}`);
  return parcel;
}

export type CollectionQrResponse = { qrToken: string; expiresAt: string };

export async function getCollectionQr(parcelId: string): Promise<CollectionQrResponse> {
  return apiFetchJson<CollectionQrResponse>(`/api/v1/parcels/${parcelId}/collection-qr`);
}

export async function collectParcel(
  parcelId: string,
  qrToken: string,
): Promise<{ parcel: ParcelPublic }> {
  return apiFetchJson<{ parcel: ParcelPublic }>(`/api/v1/parcels/${parcelId}/collect`, {
    method: 'POST',
    body: JSON.stringify({ qrToken }),
  });
}
