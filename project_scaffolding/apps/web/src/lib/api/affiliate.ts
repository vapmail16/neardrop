import type { AffiliateEarningsSummaryPublic } from '@neardrop/shared';
import { apiFetchJson } from './client';

export async function getAffiliateEarnings(): Promise<AffiliateEarningsSummaryPublic> {
  return apiFetchJson<AffiliateEarningsSummaryPublic>('/api/v1/affiliates/me/earnings');
}
