import type { Knex } from 'knex';
import type { ParcelStatus } from '@neardrop/shared';

export type ParcelRow = {
  id: string;
  carrier_id: string;
  carrier_ref: string | null;
  affiliate_id: string | null;
  customer_id: string | null;
  recipient_name: string;
  recipient_postcode: string;
  recipient_email: string | null;
  status: string;
  estimated_drop_time: Date | string | null;
  actual_drop_time: Date | string | null;
  collection_time: Date | string | null;
  collection_qr_token: string | null;
  qr_token_expires_at: Date | string | null;
  qr_token_used_at: Date | string | null;
  per_parcel_fee: string | number;
  created_at: Date | string;
  updated_at: Date | string;
};

export type ParcelInsert = {
  carrier_id: string;
  carrier_ref: string | null;
  affiliate_id: string | null;
  customer_id: string | null;
  recipient_name: string;
  recipient_postcode: string;
  recipient_email: string | null;
  status: ParcelStatus;
  estimated_drop_time: Date | string | null;
};

export class ParcelRepository {
  constructor(private readonly db: Knex) {}

  async insertParcel(input: ParcelInsert): Promise<ParcelRow> {
    const [row] = await this.db<ParcelRow>('parcels')
      .insert({
        carrier_id: input.carrier_id,
        carrier_ref: input.carrier_ref,
        affiliate_id: input.affiliate_id,
        customer_id: input.customer_id,
        recipient_name: input.recipient_name,
        recipient_postcode: input.recipient_postcode,
        recipient_email: input.recipient_email,
        status: input.status,
        estimated_drop_time: input.estimated_drop_time,
      })
      .returning('*');
    if (!row) throw new Error('insertParcel: no row returned');
    return row;
  }

  async findById(id: string): Promise<ParcelRow | null> {
    const row = await this.db<ParcelRow>('parcels').where({ id }).first();
    return row ?? null;
  }

  async findByCarrierId(
    carrierId: string,
    opts: { limit: number; offset: number; status?: ParcelStatus },
  ): Promise<{ rows: ParcelRow[]; total: number }> {
    let q = this.db<ParcelRow>('parcels').where({ carrier_id: carrierId });
    if (opts.status) q = q.andWhere({ status: opts.status });
    const totalRow = await q.clone().count<{ count: string }>('* as count').first();
    const total = totalRow ? Number(totalRow.count) : 0;
    const rows = await q
      .clone()
      .orderBy('created_at', 'desc')
      .limit(opts.limit)
      .offset(opts.offset);
    return { rows, total };
  }

  async findByAffiliateId(
    affiliateId: string,
    opts: { limit: number; offset: number; status?: ParcelStatus },
  ): Promise<{ rows: ParcelRow[]; total: number }> {
    let q = this.db<ParcelRow>('parcels').where({ affiliate_id: affiliateId });
    if (opts.status) q = q.andWhere({ status: opts.status });
    const totalRow = await q.clone().count<{ count: string }>('* as count').first();
    const total = totalRow ? Number(totalRow.count) : 0;
    const rows = await q
      .clone()
      .orderBy('created_at', 'desc')
      .limit(opts.limit)
      .offset(opts.offset);
    return { rows, total };
  }

  /** True if the customer has at least one parcel assigned to this affiliate (pickup context). */
  async customerHasAffiliateLink(customerUserId: string, affiliateId: string): Promise<boolean> {
    const row = await this.db<ParcelRow>('parcels')
      .where({ customer_id: customerUserId, affiliate_id: affiliateId })
      .first();
    return row != null;
  }

  async findByCustomerId(
    customerId: string,
    opts: { limit: number; offset: number; status?: ParcelStatus },
  ): Promise<{ rows: ParcelRow[]; total: number }> {
    let q = this.db<ParcelRow>('parcels').where({ customer_id: customerId });
    if (opts.status) q = q.andWhere({ status: opts.status });
    const totalRow = await q.clone().count<{ count: string }>('* as count').first();
    const total = totalRow ? Number(totalRow.count) : 0;
    const rows = await q
      .clone()
      .orderBy('created_at', 'desc')
      .limit(opts.limit)
      .offset(opts.offset);
    return { rows, total };
  }

  async findAllForOps(opts: {
    limit: number;
    offset: number;
    status?: ParcelStatus;
  }): Promise<{ rows: ParcelRow[]; total: number }> {
    let q = this.db<ParcelRow>('parcels');
    if (opts.status) q = q.where({ status: opts.status });
    const totalRow = await q.clone().count<{ count: string }>('* as count').first();
    const total = totalRow ? Number(totalRow.count) : 0;
    const rows = await q
      .clone()
      .orderBy('created_at', 'desc')
      .limit(opts.limit)
      .offset(opts.offset);
    return { rows, total };
  }

  async updateAffiliateId(id: string, affiliateId: string | null): Promise<void> {
    await this.db('parcels').where({ id }).update({ affiliate_id: affiliateId });
  }

  async updateStatus(
    id: string,
    status: ParcelStatus,
    timestamps: { actual_drop_time?: Date | null; collection_time?: Date | null },
  ): Promise<void> {
    const patch: Record<string, unknown> = { status };
    if ('actual_drop_time' in timestamps) patch['actual_drop_time'] = timestamps['actual_drop_time'];
    if ('collection_time' in timestamps) patch['collection_time'] = timestamps['collection_time'];
    await this.db('parcels').where({ id }).update(patch);
  }

  async insertHistory(entry: {
    parcel_id: string;
    status: ParcelStatus;
    actor_id: string | null;
    actor_role: string | null;
    note?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const row: Record<string, unknown> = {
      parcel_id: entry.parcel_id,
      status: entry.status,
      actor_id: entry.actor_id,
      actor_role: entry.actor_role,
      note: entry.note ?? null,
    };
    if (entry.metadata !== undefined) {
      row['metadata'] = entry.metadata;
    }
    await this.db('parcel_status_history').insert(row);
  }

  async updateCollectionQr(parcelId: string, token: string, expiresAt: Date): Promise<void> {
    await this.db('parcels').where({ id: parcelId }).update({
      collection_qr_token: token,
      qr_token_expires_at: expiresAt,
      qr_token_used_at: null,
    });
  }

  /** Invalidate stored token after successful handover (single-use). */
  async clearCollectionQr(parcelId: string): Promise<void> {
    await this.db('parcels').where({ id: parcelId }).update({
      collection_qr_token: null,
      qr_token_used_at: this.db.fn.now(),
    });
  }

  async listHistory(parcelId: string): Promise<
    Array<{
      id: string;
      parcel_id: string;
      status: string;
      actor_id: string | null;
      actor_role: string | null;
      note: string | null;
      created_at: Date | string;
    }>
  > {
    return this.db('parcel_status_history')
      .where({ parcel_id: parcelId })
      .orderBy('created_at', 'asc')
      .select('*');
  }
}
