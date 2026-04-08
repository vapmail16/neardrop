import { describe, expect, it } from 'vitest';
import { isPasswordAcceptableForAuth } from '../utils/password.js';
import { DEMO_PORTAL_TEST_ACCOUNTS } from './portal-test-accounts.js';

describe('DEMO_PORTAL_TEST_ACCOUNTS', () => {
  it('emails and passwords meet handoff / auth policy expectations', () => {
    for (const key of ['carrier', 'customer', 'affiliate', 'ops'] as const) {
      const { email, password } = DEMO_PORTAL_TEST_ACCOUNTS[key];
      expect(email).toMatch(/^testmail[1-4]@example\.com$/);
      expect(isPasswordAcceptableForAuth(password), key).toBe(true);
    }
  });
});
