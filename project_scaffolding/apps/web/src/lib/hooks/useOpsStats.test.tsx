import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOpsStats } from './useOpsStats';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useOpsStats', () => {
  it('loads stats', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            totalParcels: 1,
            totalAffiliates: 2,
            parcelCountsByStatus: [
              { status: 'manifest_received', count: 1 },
              { status: 'in_transit', count: 0 },
              { status: 'dropped_at_affiliate', count: 0 },
              { status: 'ready_to_collect', count: 0 },
              { status: 'collected', count: 0 },
              { status: 'exception', count: 0 },
            ],
          },
        }),
      }),
    );

    const { result } = renderHook(() => useOpsStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data?.totalParcels).toBe(1);
  });

  it('sets error when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Server error' },
        }),
      }),
    );
    const { result } = renderHook(() => useOpsStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Server error');
  });

  it('refetch clears prior error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: { code: 'X', message: 'First fail' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            totalParcels: 2,
            totalAffiliates: 0,
            parcelCountsByStatus: [
              { status: 'manifest_received', count: 2 },
              { status: 'in_transit', count: 0 },
              { status: 'dropped_at_affiliate', count: 0 },
              { status: 'ready_to_collect', count: 0 },
              { status: 'collected', count: 0 },
              { status: 'exception', count: 0 },
            ],
          },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useOpsStats());
    await waitFor(() => expect(result.current.error).toBe('First fail'));
    await result.current.refetch();
    await waitFor(() => expect(result.current.data?.totalParcels).toBe(2));
    expect(result.current.error).toBeNull();
  });
});
