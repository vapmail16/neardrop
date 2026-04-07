import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CustomerDashboardClient } from './CustomerDashboardClient';

vi.mock('@/lib/hooks/useAffiliateMatch', () => ({
  useAffiliateMatch: () => ({
    affiliate: {
      id: 'a1',
      displayName: 'Hub',
      addressLine1: '1 St',
      addressLine2: null,
      city: 'London',
      postcode: 'E1 6AN',
      verificationStatus: 'verified',
      latitude: null,
      longitude: null,
    },
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('CustomerDashboardClient (integration)', () => {
  it('shows matched affiliate map section', async () => {
    render(<CustomerDashboardClient />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /pickup hub for your postcode/i })).toBeInTheDocument(),
    );
    expect(screen.getByTestId('affiliate-map')).toBeInTheDocument();
  });
});
