/**
 * TDD contract: Playwright ops seed must use postcodes that pass shared UK validation
 * (affiliate registration + manifest). Prevents flaky E2E from invalid random hubs.
 */
import { isLikelyUkPostcode } from '@neardrop/shared';
import { describe, expect, it } from 'vitest';
import { e2eRandomAffiliatePostcode } from './ops-seed';

describe('ops-seed postcodes (E2E contract)', () => {
  it('e2eRandomAffiliatePostcode passes isLikelyUkPostcode across samples', () => {
    for (let i = 0; i < 300; i++) {
      const pc = e2eRandomAffiliatePostcode();
      expect(isLikelyUkPostcode(pc), `invalid: ${pc}`).toBe(true);
    }
  });
});
