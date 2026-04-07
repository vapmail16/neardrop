import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CustomerParcelCard } from './CustomerParcelCard';

const parcel = {
  id: 'p1',
  carrierRef: 'REF-9',
  status: 'in_transit' as const,
  carrierId: 'c',
  affiliateId: 'a',
  customerId: 'u',
  recipientName: 'N',
  recipientPostcode: 'E1 6AN',
  recipientEmail: 'e@e.com',
  estimatedDropTime: null,
  actualDropTime: null,
  collectionTime: null,
  createdAt: '',
  updatedAt: '',
};

describe('CustomerParcelCard', () => {
  it('links to parcel detail with ref', () => {
    render(<CustomerParcelCard parcel={parcel} />);
    const link = screen.getByRole('link', { name: /REF-9/i });
    expect(link).toHaveAttribute('href', '/customer/parcels/p1');
  });
});
