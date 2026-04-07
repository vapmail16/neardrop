import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParcelPublic } from '@neardrop/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AffiliateParcelTable } from './AffiliateParcelTable';

const patchParcelStatus = vi.fn();

vi.mock('@/lib/api/parcels', () => ({
  patchParcelStatus: (...a: unknown[]) => patchParcelStatus(...a),
}));

afterEach(() => {
  patchParcelStatus.mockReset();
});

const base: ParcelPublic = {
  id: 'p-aff-1',
  carrierId: 'c1',
  carrierRef: 'C-REF',
  affiliateId: 'aff-1',
  customerId: 'cust-1',
  recipientName: 'Alex',
  recipientPostcode: 'SW1A1AA',
  recipientEmail: null,
  status: 'in_transit',
  estimatedDropTime: null,
  actualDropTime: null,
  collectionTime: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('AffiliateParcelTable', () => {
  it('renders empty state', () => {
    render(<AffiliateParcelTable parcels={[]} />);
    expect(screen.getByText(/no parcels assigned to your hub yet/i)).toBeInTheDocument();
  });

  it('shows a row per parcel', () => {
    render(
      <AffiliateParcelTable
        parcels={[base, { ...base, id: 'p-aff-2', carrierRef: 'C-2' }]}
      />,
    );
    expect(screen.getByTestId('affiliate-parcel-row-p-aff-1')).toBeInTheDocument();
    expect(screen.getByTestId('affiliate-parcel-row-p-aff-2')).toBeInTheDocument();
  });

  it('calls patchParcelStatus when affiliate confirms receipt', async () => {
    const user = userEvent.setup();
    const onUpdated = vi.fn();
    patchParcelStatus.mockResolvedValue({ parcel: { ...base, status: 'dropped_at_affiliate' } });
    render(<AffiliateParcelTable parcels={[base]} onUpdated={onUpdated} />);
    await user.click(screen.getByRole('button', { name: /confirm parcel received/i }));
    await waitFor(() =>
      expect(patchParcelStatus).toHaveBeenCalledWith('p-aff-1', { status: 'dropped_at_affiliate' }),
    );
    expect(onUpdated).toHaveBeenCalled();
  });
});
