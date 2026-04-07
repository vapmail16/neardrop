import type { Knex } from 'knex';

export type CarrierRow = {
  id: string;
  user_id: string;
  company_name: string;
  api_tier: string;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

export class CarrierRepository {
  constructor(private readonly db: Knex) {}

  async findByUserId(userId: string): Promise<CarrierRow | null> {
    const row = await this.db<CarrierRow>('carriers').where({ user_id: userId }).first();
    return row ?? null;
  }

  async findById(id: string): Promise<CarrierRow | null> {
    const row = await this.db<CarrierRow>('carriers').where({ id }).first();
    return row ?? null;
  }
}
