import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAffiliateMatch } from './useAffiliateMatch';

const getMatchedAffiliate = vi.fn();

vi.mock('@/lib/api/affiliates', () => ({
  getMatchedAffiliate: (...a: unknown[]) => getMatchedAffiliate(...a),
}));

function Probe() {
  const { affiliate, loading, error } = useAffiliateMatch();
  if (loading) return <p>loading</p>;
  if (error) return <p>{error}</p>;
  return <p>{affiliate?.displayName ?? 'none'}</p>;
}

afterEach(() => {
  getMatchedAffiliate.mockReset();
});

describe('useAffiliateMatch', () => {
  it('loads matched affiliate', async () => {
    getMatchedAffiliate.mockResolvedValue({
      id: 'a1',
      displayName: 'Test Hub',
      addressLine1: '1 St',
      addressLine2: null,
      city: 'London',
      postcode: 'E1 6AN',
      verificationStatus: 'verified',
      latitude: null,
      longitude: null,
    });
    render(<Probe />);
    await waitFor(() => expect(screen.getByText('Test Hub')).toBeInTheDocument());
  });
});
