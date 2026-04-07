import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOpsAffiliateMapPins } from './useOpsAffiliateMapPins';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useOpsAffiliateMapPins', () => {
  it('loads map pins', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: [
              {
                id: 'x',
                displayName: 'Map Hub',
                postcode: 'SW1A 1AA',
                verificationStatus: 'pending',
                isAvailable: true,
                latitude: null,
                longitude: null,
              },
            ],
          },
        }),
      }),
    );

    const { result } = renderHook(() => useOpsAffiliateMapPins());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]!.displayName).toBe('Map Hub');
  });

  it('sets error on failed request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: { code: 'X', message: 'Pins unavailable' },
        }),
      }),
    );
    const { result } = renderHook(() => useOpsAffiliateMapPins());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe('Pins unavailable');
  });

  it('refetch repopulates items', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { items: [] } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: [
              {
                id: 'y',
                displayName: 'Later',
                postcode: 'E2 2AA',
                verificationStatus: 'verified',
                isAvailable: true,
                latitude: null,
                longitude: null,
              },
            ],
          },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useOpsAffiliateMapPins());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(0);
    await result.current.refetch();
    await waitFor(() => expect(result.current.items[0]!.displayName).toBe('Later'));
  });
});
