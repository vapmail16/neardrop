/** Affiliate portal API payloads (Phase 6). */

export type AffiliateEarningRowPublic = {
  id: string;
  parcelId: string;
  amount: string;
  payoutStatus: string;
  createdAt: string;
};

export type AffiliateEarningsSummaryPublic = {
  pendingTotal: string;
  paidTotal: string;
  pendingCount: number;
  recent: AffiliateEarningRowPublic[];
};
