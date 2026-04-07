/**
 * London-area outward/inward codes for demo data and Phase 8 E2E (Q8 full demo postcode
 * catalogue remains deferred per MVP plan — this list is a fixed, validated subset).
 */
export const LONDON_DEMO_POSTCODES = [
  'E1 6AN',
  'E2 8GX',
  'SW1A 1AA',
  'SW9 9AA',
  'N1 9GU',
  'NW1 6XE',
  'W1D 4FA',
  'SE1 9RT',
  'EC1A 1BB',
  'WC2N 5DU',
  'E14 5AR',
  'W12 7GH',
] as const;

export type LondonDemoPostcode = (typeof LONDON_DEMO_POSTCODES)[number];

export function pickLondonDemoPostcode(index: number): string {
  const list = LONDON_DEMO_POSTCODES;
  const n = list.length;
  const i = ((index % n) + n) % n;
  return list[i]!;
}
