/**
 * Phase 4 — strict TDD: page integration; `useParcels` mocked; asserts filter drives query.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParcelPublic } from '@neardrop/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CarrierParcelsClient } from './CarrierParcelsClient';

const useParcelsMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/hooks/useParcels', () => ({
  useParcels: (q: unknown) => useParcelsMock(q),
  sortParcelsByUpdatedDesc: (items: ParcelPublic[]) => items,
}));

vi.mock('@/components/carrier/ParcelTable', () => ({
  ParcelTable: () => <div data-testid="parcel-table-stub" />,
}));

describe('CarrierParcelsClient (integration)', () => {
  beforeEach(() => {
    useParcelsMock.mockReset();
    useParcelsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('calls useParcels with page 1 limit 50 and no status initially', () => {
    render(<CarrierParcelsClient />);
    expect(useParcelsMock).toHaveBeenCalledWith({ page: 1, limit: 50 });
  });

  it('passes status filter into useParcels when user selects a status', async () => {
    const user = userEvent.setup();
    render(<CarrierParcelsClient />);
    await user.selectOptions(screen.getByTestId('parcel-status-filter'), 'in_transit');
    expect(useParcelsMock).toHaveBeenLastCalledWith({
      page: 1,
      limit: 50,
      status: 'in_transit',
    });
  });

  it('shows loading then table region when loaded', () => {
    useParcelsMock.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 50 },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<CarrierParcelsClient />);
    expect(screen.getByTestId('parcel-table-stub')).toBeInTheDocument();
    expect(screen.getByText(/0 parcels/i)).toBeInTheDocument();
  });
});
