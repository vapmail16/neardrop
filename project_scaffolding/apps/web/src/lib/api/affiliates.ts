import type { AffiliateSummaryPublic } from '@neardrop/shared';
import { apiFetchJson } from './client';

export async function getMatchedAffiliate(): Promise<AffiliateSummaryPublic | null> {
  const { affiliate } = await apiFetchJson<{ affiliate: AffiliateSummaryPublic | null }>(
    '/api/v1/affiliates/match',
  );
  return affiliate;
}

export async function getAffiliateSummary(affiliateId: string): Promise<AffiliateSummaryPublic> {
  const { affiliate } = await apiFetchJson<{ affiliate: AffiliateSummaryPublic }>(
    `/api/v1/affiliates/${affiliateId}/summary`,
  );
  return affiliate;
}
