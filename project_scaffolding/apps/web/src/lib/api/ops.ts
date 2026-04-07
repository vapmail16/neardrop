import type { OpsAffiliateMapPinPublic, OpsStatsPublic, ParcelPublic } from '@neardrop/shared';
import { apiFetchJson } from './client';

export async function fetchOpsStats(): Promise<OpsStatsPublic> {
  return apiFetchJson<OpsStatsPublic>('/api/v1/ops/stats');
}

export async function fetchOpsAffiliateMapPins(): Promise<OpsAffiliateMapPinPublic[]> {
  const res = await apiFetchJson<{ items: OpsAffiliateMapPinPublic[] }>(
    '/api/v1/ops/affiliates/map',
  );
  return res.items;
}

export async function assignParcelAffiliate(
  parcelId: string,
  affiliateId: string | null,
): Promise<ParcelPublic> {
  const res = await apiFetchJson<{ parcel: ParcelPublic }>(
    `/api/v1/ops/parcels/${parcelId}/affiliate`,
    {
      method: 'PATCH',
      body: JSON.stringify({ affiliateId }),
    },
  );
  return res.parcel;
}
