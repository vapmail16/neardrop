import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAffiliateEarnings } from './useAffiliateEarnings';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useAffiliateEarnings', () => {
  it('loads earnings summary', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            pendingTotal: '2.00',
            paidTotal: '0.00',
            pendingCount: 2,
            recent: [],
          },
        }),
      }),
    );

    const { result } = renderHook(() => useAffiliateEarnings());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data?.pendingTotal).toBe('2.00');
    expect(result.current.data?.pendingCount).toBe(2);
  });
});
