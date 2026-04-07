import { describe, expect, it, vi } from 'vitest';
import type { AffiliateRepository } from '../repositories/affiliate.repository.js';
import { AffiliateMatchingService } from './affiliate-matching.service.js';

describe('AffiliateMatchingService', () => {
  it('returns no_affiliate when count is 0', async () => {
    const repo = {
      countByPostcode: vi.fn().mockResolvedValue(0),
      findBestMatchForPostcode: vi.fn(),
    } as unknown as AffiliateRepository;
    const s = new AffiliateMatchingService(repo);
    expect(await s.matchPostcode('SW9 9AB')).toEqual({ type: 'no_affiliate' });
  });

  it('returns at_capacity when affiliates exist but none have capacity', async () => {
    const repo = {
      countByPostcode: vi.fn().mockResolvedValue(2),
      findBestMatchForPostcode: vi.fn().mockResolvedValue(null),
    } as unknown as AffiliateRepository;
    const s = new AffiliateMatchingService(repo);
    expect(await s.matchPostcode('E1 6AN')).toEqual({ type: 'at_capacity' });
  });

  it('returns matched with affiliate id', async () => {
    const repo = {
      countByPostcode: vi.fn().mockResolvedValue(1),
      findBestMatchForPostcode: vi.fn().mockResolvedValue({ id: 'aff-1' }),
    } as unknown as AffiliateRepository;
    const s = new AffiliateMatchingService(repo);
    expect(await s.matchPostcode('SW9 9AB')).toEqual({
      type: 'matched',
      affiliateId: 'aff-1',
    });
  });
});
