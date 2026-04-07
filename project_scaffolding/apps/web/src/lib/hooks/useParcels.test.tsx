import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sortParcelsByUpdatedDesc, useParcels } from './useParcels';
import type { ParcelPublic } from '@neardrop/shared';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useParcels', () => {
  it('loads and exposes parcel list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: [
              {
                id: '1',
                carrierId: 'c',
                carrierRef: 'R1',
                affiliateId: null,
                customerId: null,
                recipientName: 'A',
                recipientPostcode: 'SW1A1AA',
                recipientEmail: null,
                status: 'manifest_received',
                estimatedDropTime: null,
                actualDropTime: null,
                collectionTime: null,
                createdAt: '2026-01-02',
                updatedAt: '2026-01-02',
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
          },
        }),
      }),
    );

    const { result } = renderHook(() => useParcels({ page: 1, limit: 20 }));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.data?.items[0].carrierRef).toBe('R1');
  });

  it('surfaces error message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No' },
        }),
      }),
    );

    const { result } = renderHook(() => useParcels({ page: 1, limit: 20 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('No');
    expect(result.current.data).toBeNull();
  });

  it('refetch reloads data', async () => {
    let n = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        n += 1;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { items: [], total: n, page: 1, limit: 20 },
          }),
        });
      }),
    );

    const { result } = renderHook(() => useParcels({ page: 1, limit: 20 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.total).toBe(1);
    await result.current.refetch();
    await waitFor(() => expect(result.current.data?.total).toBe(2));
  });
});

describe('sortParcelsByUpdatedDesc', () => {
  it('orders by updatedAt descending', () => {
    const a: ParcelPublic = {
      id: 'a',
      carrierId: 'c',
      carrierRef: null,
      affiliateId: null,
      customerId: null,
      recipientName: 'x',
      recipientPostcode: 'E11AA',
      recipientEmail: null,
      status: 'in_transit',
      estimatedDropTime: null,
      actualDropTime: null,
      collectionTime: null,
      createdAt: '1',
      updatedAt: '2026-01-01',
    };
    const b = { ...a, id: 'b', updatedAt: '2026-01-03' };
    const c = { ...a, id: 'c', updatedAt: '2026-01-02' };
    expect(sortParcelsByUpdatedDesc([a, b, c]).map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });
});
