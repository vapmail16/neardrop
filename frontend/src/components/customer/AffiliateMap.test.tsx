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
  });

  it('uses coordinate deep-link when lat/lng are available', () => {
    render(<AffiliateMap affiliate={aff} />);
    const link = screen.getByRole('link', { name: /open area in openstreetmap/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('openstreetmap.org/?mlat='));
    expect(link).toHaveAttribute('href', expect.stringContaining('mlat=51.501'));
    expect(link).toHaveAttribute('href', expect.stringContaining('mlon=-0.142'));
    expect(screen.getByTitle(/pickup map/i)).toHaveAttribute(
      'src',
      expect.stringContaining('/export/embed.html?bbox='),
    );
  });

  it('falls back to search query without coordinates', () => {
    render(<AffiliateMap affiliate={{ ...aff, latitude: null, longitude: null }} />);
    const link = screen.getByRole('link', { name: /open area in openstreetmap/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('openstreetmap.org/search?query='));
  });

  it('normalizes comma decimals for map embed and deep-link', () => {
    render(<AffiliateMap affiliate={{ ...aff, latitude: '51,501', longitude: '-0,142' }} />);
    const map = screen.getByTitle(/pickup map/i);
    expect(map).toHaveAttribute('src', expect.not.stringContaining('NaN'));
    const link = screen.getByRole('link', { name: /open area in openstreetmap/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('mlat=51.501'));
    expect(link).toHaveAttribute('href', expect.stringContaining('mlon=-0.142'));
  });

  it('falls back to address search when coords are unusable (0,0)', () => {
    render(<AffiliateMap affiliate={{ ...aff, latitude: '0', longitude: '0' }} />);
    const link = screen.getByRole('link', { name: /open area in openstreetmap/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('openstreetmap.org/search?query='));
  });

  it('uses postcode-first search fallback for better OSM hit-rate', () => {
    render(<AffiliateMap affiliate={{ ...aff, latitude: null, longitude: null }} />);
    const link = screen.getByRole('link', { name: /open area in openstreetmap/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('query=SW1A%201AA'));
  });

  it('falls back to address search when postcode is missing', () => {
    render(
      <AffiliateMap
        affiliate={{ ...aff, postcode: '', latitude: null, longitude: null, addressLine1: 'Buckingham Palace' }}
      />,
    );
    const link = screen.getByRole('link', { name: /open area in openstreetmap/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('query=Buckingham%20Palace%2C%20London'));
  });
});
