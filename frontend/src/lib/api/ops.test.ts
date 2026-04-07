import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from './client';
import { assignParcelAffiliate, fetchOpsAffiliateMapPins, fetchOpsStats } from './ops';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ops API client', () => {
  it('fetchOpsStats calls GET /api/v1/ops/stats', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            totalParcels: 3,
            totalAffiliates: 2,
            parcelCountsByStatus: [
              { status: 'manifest_received', count: 2 },
              { status: 'in_transit', count: 1 },
              { status: 'dropped_at_affiliate', count: 0 },
              { status: 'ready_to_collect', count: 0 },
              { status: 'collected', count: 0 },
              { status: 'exception', count: 0 },
            ],
          },
        }),
      }),
    );
    const s = await fetchOpsStats();
    expect(s.totalParcels).toBe(3);
    expect(s.totalAffiliates).toBe(2);
  });

  it('fetchOpsAffiliateMapPins unwraps items', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: [
              {
                id: 'a1',
                displayName: 'H1',
                postcode: 'E1 1AA',
                verificationStatus: 'verified',
                isAvailable: true,
                latitude: null,
                longitude: null,
              },
            ],
          },
        }),
      }),
    );
    const items = await fetchOpsAffiliateMapPins();
    expect(items).toHaveLength(1);
    expect(items[0]!.displayName).toBe('H1');
  });

  it('assignParcelAffiliate PATCHes body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            parcel: {
              id: 'p1',
              carrierId: 'c',
              carrierRef: 'R',
              affiliateId: 'a1',
              customerId: null,
              recipientName: 'X',
              recipientPostcode: 'E1 1AA',
              recipientEmail: null,
              status: 'manifest_received',
              estimatedDropTime: null,
              actualDropTime: null,
              collectionTime: null,
              createdAt: '',
              updatedAt: '',
            },
          },
        }),
      }),
    );
    const p = await assignParcelAffiliate('p1', 'a1');
    expect(p.affiliateId).toBe('a1');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/ops/parcels/p1/affiliate'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ affiliateId: 'a1' }),
      }),
    );
  });

  it('fetchOpsStats throws ApiRequestError on HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Ops only' },
        }),
      }),
    );
    await expect(fetchOpsStats()).rejects.toThrow('Ops only');
  });

  it('fetchOpsAffiliateMapPins throws when success false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: false,
          error: { code: 'BAD', message: 'Bad response' },
        }),
      }),
    );
    await expect(fetchOpsAffiliateMapPins()).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('assignParcelAffiliate sends null affiliateId in JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            parcel: {
              id: 'p1',
              carrierId: 'c',
              carrierRef: 'R',
              affiliateId: null,
              customerId: null,
              recipientName: 'X',
              recipientPostcode: 'E1 1AA',
              recipientEmail: null,
              status: 'manifest_received',
              estimatedDropTime: null,
              actualDropTime: null,
              collectionTime: null,
              createdAt: '',
              updatedAt: '',
            },
          },
        }),
      }),
    );
    await assignParcelAffiliate('p1', null);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/ops/parcels/p1/affiliate'),
      expect.objectContaining({
        body: JSON.stringify({ affiliateId: null }),
      }),
    );
  });
});
