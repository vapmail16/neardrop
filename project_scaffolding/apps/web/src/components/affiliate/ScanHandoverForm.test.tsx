import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScanHandoverForm } from './ScanHandoverForm';

const collectParcel = vi.fn();

vi.mock('@/lib/api/parcels', () => ({
  collectParcel: (...a: unknown[]) => collectParcel(...a),
}));

afterEach(() => {
  collectParcel.mockReset();
});

describe.sequential('ScanHandoverForm', () => {
  it('submits parcel id and token', async () => {
    const user = userEvent.setup();
    collectParcel.mockResolvedValue({
      parcel: {
        id: 'p1',
        status: 'collected',
        carrierId: 'c',
        carrierRef: 'R',
        affiliateId: 'a',
        customerId: 'u',
        recipientName: 'x',
        recipientPostcode: 'E1 1AA',
        recipientEmail: null,
        estimatedDropTime: null,
        actualDropTime: null,
        collectionTime: null,
        createdAt: '',
        updatedAt: '',
      },
    });
    const onSuccess = vi.fn();
    render(<ScanHandoverForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText(/parcel id/i), 'p1');
    await user.type(screen.getByTestId('affiliate-scan-token'), 'jwt-here');
    await user.click(screen.getByRole('button', { name: /complete collection/i }));
    await waitFor(() => expect(collectParcel).toHaveBeenCalledWith('p1', 'jwt-here'));
    expect(onSuccess).toHaveBeenCalled();
  });
});
