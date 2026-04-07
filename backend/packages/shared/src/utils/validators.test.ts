import { describe, expect, it } from 'vitest';
import { isLikelyUkPostcode, normalizeUkPostcode } from './validators.js';

describe('normalizeUkPostcode', () => {
  it('formats outward and inward', () => {
    expect(normalizeUkPostcode('e16an')).toBe('E1 6AN');
  });
});

describe('isLikelyUkPostcode', () => {
  it('returns true for London style', () => {
    expect(isLikelyUkPostcode('E1 6AN')).toBe(true);
  });

  it('returns false for garbage', () => {
    expect(isLikelyUkPostcode('ABC')).toBe(false);
  });
});
