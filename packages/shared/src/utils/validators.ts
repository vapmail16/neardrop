/** Normalise UK postcode: uppercase, single space before inward code. */
export function normalizeUkPostcode(input: string): string {
  const s = input.trim().replace(/\s+/g, '').toUpperCase();
  if (s.length < 5) return s;
  const inward = s.slice(-3);
  const outward = s.slice(0, -3);
  return `${outward} ${inward}`;
}

/** Approximate UK postcode pattern (covers common formats). */
export function isLikelyUkPostcode(input: string): boolean {
  const n = normalizeUkPostcode(input).replace(/\s/g, '');
  return /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/.test(n);
}
