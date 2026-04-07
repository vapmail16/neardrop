import type { Knex } from 'knex';
import { PARCEL_STATUSES, type OpsAffiliateMapPinPublic, type OpsStatsPublic } from '@neardrop/shared';

type StatusCountRow = { status: string; count: string | number };

type AffiliateMapRow = {
  id: string;
  first_name: string;
  last_name: string;
  postcode: string;
  verification_status: string;
  is_available: boolean;
  latitude: string | number | null;
  longitude: string | number | null;
};

/** Ops console read models (Phase 7). */
export class OpsReadService {
  constructor(private readonly knex: Knex) {}

  async getStats(): Promise<OpsStatsPublic> {
    const statusRows = (await this.knex('parcels')
      .select('status')
      .count<{ count: string }>('* as count')
      .groupBy('status')) as StatusCountRow[];

    const byStatus = new Map<string, number>();
    for (const r of statusRows) {
      byStatus.set(r.status, Number(r.count));
    }

    const parcelCountsByStatus = PARCEL_STATUSES.map((status) => ({
      status,
      count: byStatus.get(status) ?? 0,
    }));

    const totalParcelsRow = await this.knex('parcels').count<{ count: string }>('* as count').first();
    const totalParcels = totalParcelsRow ? Number(totalParcelsRow.count) : 0;

    const affRow = await this.knex('affiliates').count<{ count: string }>('* as count').first();
    const totalAffiliates = affRow ? Number(affRow.count) : 0;

    return { parcelCountsByStatus, totalParcels, totalAffiliates };
  }

  async listAffiliateMapPins(): Promise<OpsAffiliateMapPinPublic[]> {
    const rows = (await this.knex('affiliates as a')
      .join('users as u', 'u.id', 'a.user_id')
      .select(
        'a.id',
        'a.postcode',
        'a.verification_status',
        'a.is_available',
        'a.latitude',
        'a.longitude',
        'u.first_name',
        'u.last_name',
      )
      .orderBy('a.created_at', 'asc')) as AffiliateMapRow[];

    return rows.map((r) => ({
      id: r.id,
      displayName: `${r.first_name} ${r.last_name}`.trim(),
      postcode: r.postcode,
      verificationStatus: r.verification_status,
      isAvailable: r.is_available,
      latitude: r.latitude != null ? String(r.latitude) : null,
      longitude: r.longitude != null ? String(r.longitude) : null,
    }));
  }
}
