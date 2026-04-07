import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAffiliateSummary } from './useAffiliateSummary';

const getAffiliateSummary = vi.fn();

vi.mock('@/lib/api/affiliates', () => ({
  getAffiliateSummary: (...a: unknown[]) => getAffiliateSummary(...a),
}));

function Probe({ id }: { id: string | null }) {
  const { affiliate, loading } = useAffiliateSummary(id);
  if (!id) return <p>no-id</p>;
  if (loading) return <p>loading</p>;
  return <p>{affiliate?.postcode ?? 'none'}</p>;
}

afterEach(() => {
  getAffiliateSummary.mockReset();
});

describe('useAffiliateSummary', () => {
  it('loads summary for affiliate id', async () => {
    getAffiliateSummary.mockResolvedValue({
      id: 'a1',
      displayName: 'H',
      addressLine1: '1',
      addressLine2: null,
      city: 'London',
      postcode: 'E1 6AN',
      verificationStatus: 'verified',
      latitude: null,
      longitude: null,
    });
    render(<Probe id="a1" />);
    await waitFor(() => expect(screen.getByText('E1 6AN')).toBeInTheDocument());
  });
});
