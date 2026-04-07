import type { AffiliateRepository } from '../repositories/affiliate.repository.js';

export type PostcodeMatchResult =
  | { type: 'matched'; affiliateId: string }
  | { type: 'no_affiliate' }
  | { type: 'at_capacity' };

export class AffiliateMatchingService {
  constructor(private readonly affiliates: AffiliateRepository) {}

  async matchPostcode(normalizedPostcode: string): Promise<PostcodeMatchResult> {
    const total = await this.affiliates.countByPostcode(normalizedPostcode);
    if (total === 0) return { type: 'no_affiliate' };
    const best = await this.affiliates.findBestMatchForPostcode(normalizedPostcode);
    if (!best) return { type: 'at_capacity' };
    return { type: 'matched', affiliateId: best.id };
  }
}
