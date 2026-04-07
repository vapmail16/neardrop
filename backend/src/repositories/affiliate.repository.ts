import type { Knex } from 'knex';

export type AffiliateRow = {
  id: string;
  user_id: string;
  postcode: string;
  address_line_1: string;
  max_daily_capacity: number;
  current_load: number;
  is_available: boolean;
  verification_status: string;
  created_at: Date | string;
};

export class AffiliateRepository {
  constructor(private readonly db: Knex) {}

  /**
   * Exact normalised postcode; prefers lowest load among available, verified/pending affiliates.
   */
  async findBestMatchForPostcode(normalizedPostcode: string): Promise<AffiliateRow | null> {
    const row = await this.db<AffiliateRow>('affiliates')
      .where({ postcode: normalizedPostcode })
      .where('is_available', true)
      .whereIn('verification_status', ['pending', 'verified'])
      .whereRaw('current_load < max_daily_capacity')
      .orderBy('current_load', 'asc')
      .orderBy('created_at', 'asc')
      .first();
    return row ?? null;
  }

  async countByPostcode(normalizedPostcode: string): Promise<number> {
    const r = await this.db('affiliates')
      .where({ postcode: normalizedPostcode })
      .count<{ count: string }>('* as count')
      .first();
    return r ? Number(r.count) : 0;
  }

  async findByUserId(userId: string): Promise<AffiliateRow | null> {
    const row = await this.db<AffiliateRow>('affiliates').where({ user_id: userId }).first();
    return row ?? null;
  }

  async findById(id: string): Promise<AffiliateRow | null> {
    const row = await this.db<AffiliateRow>('affiliates').where({ id }).first();
    return row ?? null;
  }
}
