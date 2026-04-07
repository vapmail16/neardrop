import type { Knex } from 'knex';
import type { AffiliateEarningsSummaryPublic } from '@neardrop/shared';
import { AffiliateEarningsRepository } from '../repositories/affiliate-earnings.repository.js';
import { AffiliateRepository } from '../repositories/affiliate.repository.js';

export class AffiliateEarningsReadService {
  constructor(private readonly knex: Knex) {}

  async getSummaryForAffiliateUser(userId: string): Promise<AffiliateEarningsSummaryPublic> {
    const aff = await new AffiliateRepository(this.knex).findByUserId(userId);
    if (!aff) {
      return {
        pendingTotal: '0.00',
        paidTotal: '0.00',
        pendingCount: 0,
        recent: [],
      };
    }
    const er = new AffiliateEarningsRepository(this.knex);
    const [pendingTotal, paidTotal, pendingCount, rows] = await Promise.all([
      er.sumAmountForAffiliate(aff.id, 'pending'),
      er.sumAmountForAffiliate(aff.id, 'paid'),
      er.countPendingForAffiliate(aff.id),
      er.listRecentForAffiliate(aff.id, 25),
    ]);
    return {
      pendingTotal,
      paidTotal,
      pendingCount,
      recent: rows.map((r) => ({
        id: r.id,
        parcelId: r.parcel_id,
        amount: String(r.amount),
        payoutStatus: r.payout_status,
        createdAt:
          r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      })),
    };
  }
}
