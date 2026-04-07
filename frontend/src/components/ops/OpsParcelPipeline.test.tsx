import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorCodes, type OpsAffiliateMapPinPublic, type ParcelPublic } from '@neardrop/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/lib/api/client';
import { OpsParcelPipeline } from './OpsParcelPipeline';

const assignParcelAffiliate = vi.fn();

vi.mock('@/lib/api/ops', () => ({
  assignParcelAffiliate: (...a: unknown[]) => assignParcelAffiliate(...a),
}));

afterEach(() => {
  assignParcelAffiliate.mockReset();
});

const parcel: ParcelPublic = {
  id: 'p1',
  carrierId: 'c',
  carrierRef: 'REF1',
  affiliateId: null,
  customerId: null,
  recipientName: 'Sam',
  recipientPostcode: 'E1 1AA',
  recipientEmail: null,
  status: 'manifest_received',
  estimatedDropTime: null,
  actualDropTime: null,
  collectionTime: null,
  createdAt: '',
  updatedAt: '',
};

const pin: OpsAffiliateMapPinPublic = {
  id: 'a99',
  displayName: 'Other Hub',
  postcode: 'SW1A 1AA',
  verificationStatus: 'pending',
  isAvailable: true,
  latitude: null,
  longitude: null,
};

describe('OpsParcelPipeline', () => {
  it('calls assignParcelAffiliate when Apply clicked', async () => {
    const user = userEvent.setup();
    const onUpdated = vi.fn();
    assignParcelAffiliate.mockResolvedValue({ ...parcel, affiliateId: 'a99' });
    render(
      <OpsParcelPipeline parcels={[parcel]} affiliatePins={[pin]} onUpdated={onUpdated} />,
    );
    await user.selectOptions(screen.getByTestId('ops-assign-select-p1'), 'a99');
    await user.click(screen.getByTestId('ops-assign-apply-p1'));
    await waitFor(() =>
      expect(assignParcelAffiliate).toHaveBeenCalledWith('p1', 'a99'),
    );
    expect(onUpdated).toHaveBeenCalled();
  });

  it('renders empty state when no parcels', () => {
    render(<OpsParcelPipeline parcels={[]} affiliatePins={[pin]} />);
    expect(screen.getByText(/no parcels in the system yet/i)).toBeInTheDocument();
  });

  it('calls assignParcelAffiliate with null when unassigned and Apply', async () => {
    const user = userEvent.setup();
    assignParcelAffiliate.mockResolvedValue({ ...parcel, affiliateId: null });
    render(
      <OpsParcelPipeline parcels={[{ ...parcel, affiliateId: 'a99' }]} affiliatePins={[pin]} />,
    );
    await user.selectOptions(screen.getByTestId('ops-assign-select-p1'), '');
    await user.click(screen.getByTestId('ops-assign-apply-p1'));
    await waitFor(() => expect(assignParcelAffiliate).toHaveBeenCalledWith('p1', null));
  });

  it('shows alert when assign fails', async () => {
    const user = userEvent.setup();
    assignParcelAffiliate.mockRejectedValue(
      new ApiRequestError(400, {
        success: false,
        error: { code: ErrorCodes.VALIDATION_ERROR, message: 'Cannot reassign' },
      }),
    );
    render(<OpsParcelPipeline parcels={[parcel]} affiliatePins={[pin]} />);
    await user.click(screen.getByTestId('ops-assign-apply-p1'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Cannot reassign'));
  });
});
