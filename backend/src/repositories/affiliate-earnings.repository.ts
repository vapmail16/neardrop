import type { Knex } from 'knex';

export type AffiliateEarningListRow = {
  id: string;
  parcel_id: string;
  amount: string;
  payout_status: string;
  created_at: Date;
};

export class AffiliateEarningsRepository {
  constructor(private readonly db: Knex) {}

  async insertEarning(params: {
    affiliateId: string;
    parcelId: string;
    amount: number;
  }): Promise<void> {
    await this.db('affiliate_earnings').insert({
      affiliate_id: params.affiliateId,
      parcel_id: params.parcelId,
      amount: params.amount,
      payout_status: 'pending',
    });
  }

  async sumAmountForAffiliate(affiliateId: string, payoutStatus: string): Promise<string> {
    const row = await this.db('affiliate_earnings')
      .where({ affiliate_id: affiliateId, payout_status: payoutStatus })
      .select(this.db.raw('coalesce(sum(amount::numeric), 0)::text as total'))
      .first() as { total: string } | undefined;
    return row?.total ?? '0.00';
  }

  async countPendingForAffiliate(affiliateId: string): Promise<number> {
    const row = await this.db('affiliate_earnings')
      .where({ affiliate_id: affiliateId, payout_status: 'pending' })
      .count<{ count: string }>('* as count')
      .first();
    return row ? Number(row.count) : 0;
  }

  async listRecentForAffiliate(affiliateId: string, limit: number): Promise<AffiliateEarningListRow[]> {
    return this.db<AffiliateEarningListRow>('affiliate_earnings')
      .where({ affiliate_id: affiliateId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .select('id', 'parcel_id', 'amount', 'payout_status', 'created_at');
  }
}
