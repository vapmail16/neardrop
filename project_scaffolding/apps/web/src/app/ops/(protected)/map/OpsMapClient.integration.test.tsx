/**
 * Phase 7 — page integration: `useOpsAffiliateMapPins` mocked.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpsMapClient } from './OpsMapClient';

const usePinsMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/hooks/useOpsAffiliateMapPins', () => ({
  useOpsAffiliateMapPins: () => usePinsMock(),
}));

vi.mock('@/components/ops/OpsAffiliateMap', () => ({
  OpsAffiliateMap: () => <div data-testid="ops-map-stub">map</div>,
}));

describe('OpsMapClient (integration)', () => {
  beforeEach(() => {
    usePinsMock.mockReset();
  });

  it('shows loading', () => {
    usePinsMock.mockReturnValue({ items: [], loading: true, error: null, refetch: vi.fn() });
    render(<OpsMapClient />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows error', () => {
    usePinsMock.mockReturnValue({
      items: [],
      loading: false,
      error: 'Map failed',
      refetch: vi.fn(),
    });
    render(<OpsMapClient />);
    expect(screen.getByRole('alert')).toHaveTextContent('Map failed');
  });

  it('renders map when pins load', () => {
    usePinsMock.mockReturnValue({
      items: [
        {
          id: 'a1',
          displayName: 'H',
          postcode: 'E1 1AA',
          verificationStatus: 'verified' as const,
          isAvailable: true,
          latitude: null,
          longitude: null,
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<OpsMapClient />);
    expect(screen.getByTestId('ops-map-stub')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /affiliate map/i })).toBeInTheDocument();
  });
});
