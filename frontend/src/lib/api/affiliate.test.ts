import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAffiliateEarnings } from './affiliate';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('getAffiliateEarnings', () => {
  it('GETs /api/v1/affiliates/me/earnings', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            pendingTotal: '1.50',
            paidTotal: '0.00',
            pendingCount: 1,
            recent: [
              {
                id: 'e1',
                parcelId: 'p1',
                amount: '1.50',
                payoutStatus: 'pending',
                createdAt: '2026-01-01T00:00:00.000Z',
              },
            ],
          },
        }),
      }),
    );
    const r = await getAffiliateEarnings();
    expect(r.pendingTotal).toBe('1.50');
    expect(r.recent).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith('/api/v1/affiliates/me/earnings', expect.any(Object));
  });
});
