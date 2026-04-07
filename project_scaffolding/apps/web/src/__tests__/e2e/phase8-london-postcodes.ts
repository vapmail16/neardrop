/**
 * London demo postcodes for Phase 8 Playwright seeds only.
 * Playwright runs these files with Node and cannot resolve `@neardrop/shared` exports
 * (see `src/meta/playwright-e2e-scope.contract.test.ts`). Keep in sync with
 * `packages/shared/src/demo/london-demo-postcodes.ts`.
 */
const LONDON = [
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

export function pickPhase8LondonPostcode(index: number): string {
  const n = LONDON.length;
  const i = ((index % n) + n) % n;
  return LONDON[i]!;
}
