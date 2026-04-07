import type { AffiliateSummaryPublic } from '@neardrop/shared';
import { ErrorCodes } from '@neardrop/shared';
import type { Knex } from 'knex';
import { AppError } from '../errors/AppError.js';
import { AffiliateRepository } from '../repositories/affiliate.repository.js';
import { ParcelRepository } from '../repositories/parcel.repository.js';
import { UserRepository } from '../repositories/user.repository.js';

type AffiliateJoinRow = {
  id: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  postcode: string;
  verification_status: string;
  latitude: string | number | null;
  longitude: string | number | null;
  first_name: string;
  last_name: string;
};

export class AffiliateReadService {
  constructor(private readonly knex: Knex) {}

  /** Best affiliate match for the customer's registered postcode (onboarding / dashboard). */
  async getMatchForCustomerUserId(userId: string): Promise<AffiliateSummaryPublic | null> {
    const ur = new UserRepository(this.knex);
    const u = await ur.findById(userId);
    if (!u?.postcode) return null;
    const ar = new AffiliateRepository(this.knex);
    const aff = await ar.findBestMatchForPostcode(u.postcode);
    if (!aff) return null;
    const summary = await this.summaryByAffiliateId(aff.id);
    return summary;
  }

  /** Affiliate pickup location when the customer has a parcel with that affiliate. */
  async getSummaryForLinkedCustomer(
    customerUserId: string,
    affiliateId: string,
  ): Promise<AffiliateSummaryPublic> {
    const pr = new ParcelRepository(this.knex);
    const linked = await pr.customerHasAffiliateLink(customerUserId, affiliateId);
    if (!linked) {
      throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
    }
    const summary = await this.summaryByAffiliateId(affiliateId);
    if (!summary) {
      throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);
    }
    return summary;
  }

  private async summaryByAffiliateId(affiliateId: string): Promise<AffiliateSummaryPublic | null> {
    const row = (await this.knex('affiliates as a')
      .join('users as u', 'u.id', 'a.user_id')
      .where('a.id', affiliateId)
      .select(
        'a.id',
        'a.address_line_1',
        'a.address_line_2',
        'a.city',
        'a.postcode',
        'a.verification_status',
        'a.latitude',
        'a.longitude',
        'u.first_name',
        'u.last_name',
      )
      .first()) as AffiliateJoinRow | undefined;
    if (!row) return null;
    return {
      id: row.id,
      displayName: `${row.first_name} ${row.last_name}`.trim(),
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2 ?? null,
      city: row.city,
      postcode: row.postcode,
      verificationStatus: row.verification_status,
      latitude: row.latitude != null ? String(row.latitude) : null,
      longitude: row.longitude != null ? String(row.longitude) : null,
    };
  }
}
