import { describe, expect, it } from 'vitest';
import { isPasswordAcceptableForAuth, ukPostcodeSchema } from '@neardrop/shared';
import { buildDemoManifestCsv, DEMO_PORTAL_TEST_ACCOUNTS } from './seed-demo-london.js';

describe('seed-demo-london helpers', () => {
  it('DEMO_PORTAL_TEST_ACCOUNTS passwords meet auth policy', () => {
    for (const key of ['carrier', 'customer', 'affiliate'] as const) {
      const { email, password } = DEMO_PORTAL_TEST_ACCOUNTS[key];
      expect(email).toMatch(/^testmail[123]@example\.com$/);
      expect(isPasswordAcceptableForAuth(password), `${key}`).toBe(true);
    }
  });
  it('buildDemoManifestCsv produces valid rows and cycles postcodes', () => {
    const csv = buildDemoManifestCsv({
      tag: 't1',
      parcelCount: 5,
      customerEmail: 'c@example.test',
    });
    const rows = csv.split('\n');
    expect(rows[0]).toBe('carrier_ref,recipient_name,recipient_postcode,recipient_email');
    expect(rows).toHaveLength(6);
    const pcs = rows.slice(1).map((r) => r.split(',')[2]!.trim());
    for (const pc of pcs) {
      expect(ukPostcodeSchema.safeParse(pc).success, pc).toBe(true);
    }
    expect(new Set(pcs).size).toBeGreaterThan(1);
  });
});
