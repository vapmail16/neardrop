/**
 * Phase 7 — page integration: parcels list + map pins hooks mocked.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ParcelPublic } from '@neardrop/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpsParcelsClient } from './OpsParcelsClient';

const useParcelsMock = vi.hoisted(() => vi.fn());
const usePinsMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/hooks/useParcels', () => ({
  useParcels: (q: unknown) => useParcelsMock(q),
}));

vi.mock('@/lib/hooks/useOpsAffiliateMapPins', () => ({
  useOpsAffiliateMapPins: () => usePinsMock(),
}));

vi.mock('@/components/ops/OpsParcelPipeline', () => ({
  OpsParcelPipeline: () => <div data-testid="ops-pipeline-stub">pipeline</div>,
}));

const sampleParcel: ParcelPublic = {
  id: 'p1',
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
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('OpsParcelsClient (integration)', () => {
  beforeEach(() => {
    useParcelsMock.mockReset();
    usePinsMock.mockReset();
  });

  it('requests parcels page 1 limit 100', () => {
    useParcelsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    usePinsMock.mockReturnValue({ items: [], loading: true, error: null, refetch: vi.fn() });
    render(<OpsParcelsClient />);
    expect(useParcelsMock).toHaveBeenCalledWith({ page: 1, limit: 100 });
  });

  it('shows combined loading', () => {
    useParcelsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    usePinsMock.mockReturnValue({ items: [], loading: false, error: null, refetch: vi.fn() });
    render(<OpsParcelsClient />);
    expect(screen.getByTestId('page-skeleton')).toBeInTheDocument();
  });

  it('surfaces parcel hook error', () => {
    useParcelsMock.mockReturnValue({
      data: null,
      loading: false,
      error: 'Parcels down',
      refetch: vi.fn(),
    });
    usePinsMock.mockReturnValue({
      items: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<OpsParcelsClient />);
    expect(screen.getByRole('alert')).toHaveTextContent('Parcels down');
  });

  it('renders pipeline when both loads succeed', () => {
    useParcelsMock.mockReturnValue({
      data: { items: [sampleParcel], total: 1, page: 1, limit: 100 },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    usePinsMock.mockReturnValue({
      items: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<OpsParcelsClient />);
    expect(screen.getByTestId('ops-pipeline-stub')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /parcel pipeline/i })).toBeInTheDocument();
  });
});
