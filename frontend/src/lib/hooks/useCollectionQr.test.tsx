import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCollectionQr } from './useCollectionQr';

const getCollectionQr = vi.fn();

vi.mock('@/lib/api/parcels', () => ({
  getCollectionQr: (...a: unknown[]) => getCollectionQr(...a),
}));

function Probe({ id, enabled }: { id: string; enabled: boolean }) {
  const { data, loading, error } = useCollectionQr(id, enabled);
  if (!enabled) return <p>off</p>;
  if (loading) return <p>loading</p>;
  if (error) return <p>{error}</p>;
  return <p>{data?.qrToken ?? 'none'}</p>;
}

afterEach(() => {
  getCollectionQr.mockReset();
});

describe('useCollectionQr', () => {
  it('skips fetch when disabled', () => {
    render(<Probe id="p1" enabled={false} />);
    expect(screen.getByText('off')).toBeInTheDocument();
    expect(getCollectionQr).not.toHaveBeenCalled();
  });

  it('fetches when enabled', async () => {
    getCollectionQr.mockResolvedValue({ qrToken: 'tok', expiresAt: '2026-01-01T00:00:00.000Z' });
    render(<Probe id="p1" enabled />);
    await waitFor(() => expect(screen.getByText('tok')).toBeInTheDocument());
    expect(getCollectionQr).toHaveBeenCalledWith('p1');
  });
});
