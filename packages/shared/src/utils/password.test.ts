import { describe, expect, it } from 'vitest';
import { classifyPassword, isPasswordAcceptableForAuth } from './password.js';

describe('classifyPassword', () => {
  it('rejects short passwords', () => {
    expect(classifyPassword('Short1!')).toBe('reject');
  });

  it('rejects blocklisted substrings', () => {
    expect(classifyPassword('my-password-Very1!Long')).toBe('reject');
  });

  it('rejects when fewer than 3 character classes', () => {
    expect(classifyPassword('alllowerletters!!')).toBe('reject');
  });

  it('accepts good tier when 12+ and 3+ classes', () => {
    expect(classifyPassword('GoodPassw0rd!')).toBe('good');
  });

  it('marks 16+ with all four classes as strong', () => {
    expect(classifyPassword('VeryGoodPassw0rd!X')).toBe('strong');
  });
});

describe('isPasswordAcceptableForAuth', () => {
  it('returns true for good and strong', () => {
    expect(isPasswordAcceptableForAuth('GoodPassw0rd!')).toBe(true);
    expect(isPasswordAcceptableForAuth('VeryGoodPassw0rd!X')).toBe(true);
  });

  it('returns false for reject tier', () => {
    expect(isPasswordAcceptableForAuth('weak')).toBe(false);
  });
});
