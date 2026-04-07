import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParcelPublic } from '@neardrop/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ParcelTable } from './ParcelTable';

const patchParcelStatus = vi.fn();

vi.mock('@/lib/api/parcels', () => ({
  patchParcelStatus: (...a: unknown[]) => patchParcelStatus(...a),
}));

afterEach(() => {
  patchParcelStatus.mockReset();
});

const base: ParcelPublic = {
  id: 'p1',
  carrierId: 'c',
  carrierRef: 'REF',
  affiliateId: null,
  customerId: null,
  recipientName: 'Sam',
  recipientPostcode: 'E11AA',
  recipientEmail: null,
  status: 'manifest_received',
  estimatedDropTime: null,
  actualDropTime: null,
  collectionTime: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('ParcelTable', () => {
  it('renders empty state', () => {
    render(<ParcelTable parcels={[]} />);
    expect(screen.getByText(/no parcels yet/i)).toBeInTheDocument();
  });

  it('calls patch when carrier action clicked', async () => {
    const user = userEvent.setup();
    const onUpdated = vi.fn();
    patchParcelStatus.mockResolvedValue({ parcel: { ...base, status: 'in_transit' } });
    render(<ParcelTable parcels={[base]} onUpdated={onUpdated} />);
    await user.click(screen.getByRole('button', { name: /mark in transit/i }));
    await waitFor(() =>
      expect(patchParcelStatus).toHaveBeenCalledWith('p1', { status: 'in_transit' }),
    );
    expect(onUpdated).toHaveBeenCalled();
  });

  it('shows row for each parcel', () => {
    render(<ParcelTable parcels={[base, { ...base, id: 'p2', carrierRef: 'R2' }]} />);
    expect(screen.getByTestId('parcel-row-p1')).toBeInTheDocument();
    expect(screen.getByTestId('parcel-row-p2')).toBeInTheDocument();
  });
});
