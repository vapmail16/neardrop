import { render, screen } from '@testing-library/react';
import type { OpsAffiliateMapPinPublic } from '@neardrop/shared';
import { describe, expect, it } from 'vitest';
import { OpsAffiliateMap } from './OpsAffiliateMap';

describe('OpsAffiliateMap', () => {
  it('renders empty message', () => {
    render(<OpsAffiliateMap items={[]} />);
    expect(screen.getByText(/no affiliate hubs yet/i)).toBeInTheDocument();
  });

  it('renders pins with status badge', () => {
    const items: OpsAffiliateMapPinPublic[] = [
      {
        id: 'a1',
        displayName: 'Hub One',
        postcode: 'E1 1AA',
        verificationStatus: 'verified',
        isAvailable: true,
        latitude: null,
        longitude: null,
      },
    ];
    render(<OpsAffiliateMap items={items} />);
    expect(screen.getByTestId('ops-map-pin-a1')).toBeInTheDocument();
    expect(screen.getByTestId('ops-pin-status-a1')).toHaveTextContent('verified');
  });

  it('shows rejected status with error styling', () => {
    const items: OpsAffiliateMapPinPublic[] = [
      {
        id: 'a2',
        displayName: 'Bad Hub',
        postcode: 'SW9 9AA',
        verificationStatus: 'rejected',
        isAvailable: false,
        latitude: null,
        longitude: null,
      },
    ];
    render(<OpsAffiliateMap items={items} />);
    const badge = screen.getByTestId('ops-pin-status-a2');
    expect(badge).toHaveTextContent('rejected');
    expect(badge.className).toMatch(/bg-red-100/);
  });
});
