import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AffiliateMap } from './AffiliateMap';

const aff = {
  id: 'a1',
  displayName: 'Local Hub',
  addressLine1: '10 Road',
  addressLine2: null,
  city: 'London',
  postcode: 'SW1A 1AA',
  verificationStatus: 'verified',
  latitude: '51.501',
  longitude: '-0.142',
};

describe('AffiliateMap', () => {
  it('shows address and map link', () => {
    render(<AffiliateMap affiliate={aff} />);
    expect(screen.getByTestId('affiliate-map')).toBeInTheDocument();
    expect(screen.getByText('Local Hub')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open area in openstreetmap/i })).toHaveAttribute(
      'href',
      expect.stringContaining('openstreetmap.org'),
    );
  });
});
