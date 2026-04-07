import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAffiliateSummary, getMatchedAffiliate } from './affiliates';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const sampleAffiliate = {
  id: 'a1',
  displayName: 'Hub User',
  addressLine1: '1 High St',
  addressLine2: null,
  city: 'London',
  postcode: 'E1 6AN',
  verificationStatus: 'verified',
  latitude: null,
  longitude: null,
};

describe('getMatchedAffiliate', () => {
  it('GETs /api/v1/affiliates/match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { affiliate: sampleAffiliate } }),
      }),
    );
    const a = await getMatchedAffiliate();
    expect(a?.displayName).toBe('Hub User');
    expect(fetch).toHaveBeenCalledWith('/api/v1/affiliates/match', expect.any(Object));
  });

  it('returns null when API returns null affiliate', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { affiliate: null } }),
      }),
    );
    await expect(getMatchedAffiliate()).resolves.toBeNull();
  });
});

describe('getAffiliateSummary', () => {
  it('GETs summary by id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { affiliate: sampleAffiliate } }),
      }),
    );
    const a = await getAffiliateSummary('a1');
    expect(a.id).toBe('a1');
    expect(fetch).toHaveBeenCalledWith('/api/v1/affiliates/a1/summary', expect.any(Object));
  });
});
