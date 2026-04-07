/**
 * Phase 4 — API service layer (see `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md`: parcel.service tests / TDD order).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  collectParcel,
  getCollectionQr,
  getParcel,
  listParcels,
  patchParcelStatus,
  uploadManifest,
} from './parcels';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('listParcels', () => {
  it('requests with query string', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { items: [], total: 0, page: 2, limit: 10 },
        }),
      }),
    );
    const r = await listParcels({ page: 2, limit: 10, status: 'in_transit' });
    expect(r.total).toBe(0);
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/parcels?page=2&limit=10&status=in_transit',
      expect.any(Object),
    );
  });

  it('omits status when undefined', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { items: [], total: 0, page: 1, limit: 20 },
        }),
      }),
    );
    await listParcels({ page: 1, limit: 20 });
    expect(fetch).toHaveBeenCalledWith('/api/v1/parcels?page=1&limit=20', expect.any(Object));
  });
});

describe('uploadManifest', () => {
  it('POSTs JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { total: 1, matchedAffiliate: 1, unmatched: 0, parcelIds: ['a'] },
        }),
      }),
    );
    const s = await uploadManifest({ format: 'csv', content: 'h\nr' });
    expect(s.total).toBe(1);
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/parcels/manifest',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ format: 'csv', content: 'h\nr' }),
      }),
    );
  });
});

describe('patchParcelStatus', () => {
  it('PATCHes status endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            parcel: {
              id: 'p1',
              status: 'in_transit',
              carrierId: 'c',
              carrierRef: null,
              affiliateId: null,
              customerId: null,
              recipientName: 'x',
              recipientPostcode: 'E11AA',
              recipientEmail: null,
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
    const r = await patchParcelStatus('p1', { status: 'in_transit' });
    expect(r.parcel.status).toBe('in_transit');
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/parcels/p1/status',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'in_transit' }),
      }),
    );
  });
});

const sampleParcel = {
  id: 'p1',
  status: 'ready_to_collect' as const,
  carrierId: 'c',
  carrierRef: 'REF-1',
  affiliateId: 'a1',
  customerId: 'u1',
  recipientName: 'x',
  recipientPostcode: 'SW1A1AA',
  recipientEmail: 'x@y.com',
  estimatedDropTime: null,
  actualDropTime: null,
  collectionTime: null,
  createdAt: '',
  updatedAt: '',
};

describe('getParcel', () => {
  it('GETs single parcel', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { parcel: sampleParcel } }),
      }),
    );
    const p = await getParcel('p1');
    expect(p.id).toBe('p1');
    expect(fetch).toHaveBeenCalledWith('/api/v1/parcels/p1', expect.any(Object));
  });
});

describe('collectParcel', () => {
  it('POSTs collect with qrToken', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            parcel: {
              ...sampleParcel,
              status: 'collected',
            },
          },
        }),
      }),
    );
    const r = await collectParcel('p1', 'jwt-token');
    expect(r.parcel.status).toBe('collected');
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/parcels/p1/collect',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ qrToken: 'jwt-token' }),
      }),
    );
  });
});

describe('getCollectionQr', () => {
  it('GETs collection-qr endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { qrToken: 'jwt-here', expiresAt: '2026-01-01T00:00:00.000Z' },
        }),
      }),
    );
    const r = await getCollectionQr('p1');
    expect(r.qrToken).toBe('jwt-here');
    expect(fetch).toHaveBeenCalledWith('/api/v1/parcels/p1/collection-qr', expect.any(Object));
  });
});
