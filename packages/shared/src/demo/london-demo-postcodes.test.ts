import { describe, expect, it } from 'vitest';
import { ukPostcodeSchema } from '../validation/schemas.js';
import { LONDON_DEMO_POSTCODES, pickLondonDemoPostcode } from './london-demo-postcodes.js';

describe('LONDON_DEMO_POSTCODES', () => {
  it('has enough variety for multi-hub demo / E2E', () => {
    expect(LONDON_DEMO_POSTCODES.length).toBeGreaterThanOrEqual(8);
  });

  it('normalises every entry through ukPostcodeSchema', () => {
    for (const pc of LONDON_DEMO_POSTCODES) {
      const parsed = ukPostcodeSchema.safeParse(pc);
      expect(parsed.success, pc).toBe(true);
    }
  });

  it('pickLondonDemoPostcode wraps indices', () => {
    expect(pickLondonDemoPostcode(0)).toBe(LONDON_DEMO_POSTCODES[0]);
    expect(pickLondonDemoPostcode(LONDON_DEMO_POSTCODES.length)).toBe(LONDON_DEMO_POSTCODES[0]);
    expect(pickLondonDemoPostcode(-1)).toBe(
      LONDON_DEMO_POSTCODES[LONDON_DEMO_POSTCODES.length - 1],
    );
  });
});
