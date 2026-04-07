import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerParcelsClient } from './CustomerParcelsClient';

const listParcels = vi.fn();

vi.mock('@/lib/api/parcels', () => ({
  listParcels: (...a: unknown[]) => listParcels(...a),
}));

afterEach(() => {
  listParcels.mockReset();
});

describe('CustomerParcelsClient (integration)', () => {
  it('filters list when status changes', async () => {
    const user = userEvent.setup();
    listParcels
      .mockResolvedValueOnce({
        items: [
          {
            id: 'p1',
            carrierRef: 'R1',
            status: 'in_transit',
            carrierId: 'c',
            affiliateId: 'a',
            customerId: 'u',
            recipientName: 'N',
            recipientPostcode: 'E1 6AN',
            recipientEmail: null,
            estimatedDropTime: null,
            actualDropTime: null,
            collectionTime: null,
            createdAt: '',
            updatedAt: '',
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
      })
      .mockResolvedValueOnce({ items: [], total: 0, page: 1, limit: 50 });

    render(<CustomerParcelsClient />);
    await waitFor(() => expect(screen.getByText('R1')).toBeInTheDocument());
    await user.selectOptions(screen.getByTestId('customer-parcel-status-filter'), 'ready_to_collect');
    await waitFor(() => expect(listParcels).toHaveBeenLastCalledWith({
      page: 1,
      limit: 50,
      status: 'ready_to_collect',
    }));
  });
});
