import { LONDON_DEMO_POSTCODES } from '@neardrop/shared';
import { describe, expect, it } from 'vitest';
import { pickPhase8LondonPostcode } from '../__tests__/e2e/phase8-london-postcodes';

describe('Phase 8 E2E London postcodes stay aligned with @neardrop/shared', () => {
  it('matches shared list order and length', () => {
    expect(LONDON_DEMO_POSTCODES.length).toBeGreaterThan(0);
    for (let i = 0; i < LONDON_DEMO_POSTCODES.length; i++) {
      expect(pickPhase8LondonPostcode(i)).toBe(LONDON_DEMO_POSTCODES[i]);
    }
  });
});
