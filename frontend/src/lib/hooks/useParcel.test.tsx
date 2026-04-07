import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useParcel } from './useParcel';

const getParcel = vi.fn();

vi.mock('@/lib/api/parcels', () => ({
  getParcel: (...a: unknown[]) => getParcel(...a),
}));

function Probe({ id }: { id: string }) {
  const { parcel, loading, error } = useParcel(id);
  if (loading) return <p>loading</p>;
  if (error) return <p>{error}</p>;
  return <p>{parcel?.carrierRef ?? 'none'}</p>;
}

afterEach(() => {
  getParcel.mockReset();
});

describe('useParcel', () => {
  it('loads parcel by id', async () => {
    getParcel.mockResolvedValue({
      id: 'p1',
      carrierRef: 'R1',
      status: 'in_transit',
      carrierId: 'c',
      affiliateId: null,
      customerId: 'u',
      recipientName: 'n',
      recipientPostcode: 'E1 1AA',
      recipientEmail: null,
      estimatedDropTime: null,
      actualDropTime: null,
      collectionTime: null,
      createdAt: '',
      updatedAt: '',
    });
    render(<Probe id="p1" />);
    expect(screen.getByText('loading')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('R1')).toBeInTheDocument());
    expect(getParcel).toHaveBeenCalledWith('p1');
  });
});
