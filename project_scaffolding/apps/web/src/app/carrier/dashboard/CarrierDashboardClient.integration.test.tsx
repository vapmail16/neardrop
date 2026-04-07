/**
 * Phase 4 — strict TDD: page integration; `useParcels` + `ParcelTable` mocked as external services.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ParcelPublic } from '@neardrop/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CarrierDashboardClient } from './CarrierDashboardClient';

const useParcelsMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/hooks/useParcels', () => ({
  useParcels: (q: unknown) => useParcelsMock(q),
  sortParcelsByUpdatedDesc: (items: ParcelPublic[]) => items,
}));

vi.mock('@/components/carrier/ParcelTable', () => ({
  ParcelTable: ({ parcels }: { parcels: ParcelPublic[] }) => (
    <div data-testid="parcel-table-stub">{parcels.map((p) => p.id).join(',')}</div>
  ),
}));

vi.mock('next/link', () => ({
  default ({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  },
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

describe('CarrierDashboardClient (integration)', () => {
  beforeEach(() => {
    useParcelsMock.mockReset();
  });

  it('requests first page of parcels with limit 8', () => {
    useParcelsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<CarrierDashboardClient />);
    expect(useParcelsMock).toHaveBeenCalledWith({ page: 1, limit: 8 });
  });

  it('shows loading state', () => {
    useParcelsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<CarrierDashboardClient />);
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });

  it('shows error alert', () => {
    useParcelsMock.mockReturnValue({
      data: null,
      loading: false,
      error: 'Network down',
      refetch: vi.fn(),
    });
    render(<CarrierDashboardClient />);
    expect(screen.getByRole('alert')).toHaveTextContent('Network down');
  });

  it('renders summary and parcel table stub when data loads', () => {
    useParcelsMock.mockReturnValue({
      data: { items: [sampleParcel], total: 3, page: 1, limit: 8 },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<CarrierDashboardClient />);
    expect(screen.getByText(/showing 1 of 3 parcels/i)).toBeInTheDocument();
    expect(screen.getByTestId('parcel-table-stub')).toHaveTextContent('p1');
  });

  it('links to manifests and parcels', () => {
    useParcelsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<CarrierDashboardClient />);
    expect(screen.getByRole('link', { name: /upload manifest/i })).toHaveAttribute(
      'href',
      '/carrier/manifests',
    );
    expect(screen.getByRole('link', { name: /all parcels/i })).toHaveAttribute('href', '/carrier/parcels');
  });
});
