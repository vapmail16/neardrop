/**
 * Phase 4 — strict TDD: this file was authored before `fetch-me-user.ts`.
 * Red → implement `fetchMeUserFromApi` → green.
 */
import type { UserPublic } from '@neardrop/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchMeUserFromApi } from './fetch-me-user';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const carrierUser: UserPublic = {
  id: 'u1',
  email: 'c@example.com',
  firstName: 'C',
  lastName: 'D',
  role: 'carrier',
  phone: null,
  postcode: null,
  emailVerified: true,
  createdAt: '2026-01-01',
};

describe('fetchMeUserFromApi', () => {
  it('returns unauthorized when cookie header is empty', async () => {
    await expect(fetchMeUserFromApi('http://api.test', '', 'carrier')).resolves.toEqual({
      ok: false,
      kind: 'unauthorized',
    });
    await expect(fetchMeUserFromApi('http://api.test', '   ', 'carrier')).resolves.toEqual({
      ok: false,
      kind: 'unauthorized',
    });
  });

  it('does not call fetch when cookie header is empty', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await fetchMeUserFromApi('http://api.test', '', 'carrier');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('GETs /api/v1/auth/me with Cookie header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { user: carrierUser } }),
      }),
    );
    const r = await fetchMeUserFromApi('http://api.test/', 'nd_access=tok', 'carrier');
    expect(r).toEqual({ ok: true, user: carrierUser });
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/auth/me',
      expect.objectContaining({
        headers: { cookie: 'nd_access=tok' },
        cache: 'no-store',
      }),
    );
  });

  it('strips trailing slash on api origin', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { user: carrierUser } }),
      }),
    );
    await fetchMeUserFromApi('http://api.test', 'x=1', 'carrier');
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/auth/me',
      expect.any(Object),
    );
  });

  it('returns unauthorized when HTTP status is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({}),
      }),
    );
    await expect(fetchMeUserFromApi('http://api.test', 'c=1', 'carrier')).resolves.toEqual({
      ok: false,
      kind: 'unauthorized',
    });
  });

  it('returns invalid_response when JSON is not success with user', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, error: { code: 'X', message: 'm' } }),
      }),
    );
    await expect(fetchMeUserFromApi('http://api.test', 'c=1', 'carrier')).resolves.toEqual({
      ok: false,
      kind: 'invalid_response',
    });
  });

  it('returns invalid_response when JSON parse throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('bad json');
        },
      }),
    );
    await expect(fetchMeUserFromApi('http://api.test', 'c=1', 'carrier')).resolves.toEqual({
      ok: false,
      kind: 'invalid_response',
    });
  });

  it('returns wrong_role when user role does not match expectedRole', async () => {
    const customer: UserPublic = { ...carrierUser, role: 'customer' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { user: customer } }),
      }),
    );
    await expect(fetchMeUserFromApi('http://api.test', 'c=1', 'carrier')).resolves.toEqual({
      ok: false,
      kind: 'wrong_role',
    });
  });

  it('returns ok for customer when expectedRole is customer', async () => {
    const customer: UserPublic = { ...carrierUser, role: 'customer' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { user: customer } }),
      }),
    );
    await expect(fetchMeUserFromApi('http://api.test', 'c=1', 'customer')).resolves.toEqual({
      ok: true,
      user: customer,
    });
  });
});
