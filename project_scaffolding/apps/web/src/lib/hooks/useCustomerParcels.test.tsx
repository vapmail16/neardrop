import type { ParcelListQuery } from '@neardrop/shared';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCustomerParcels } from './useCustomerParcels';

const refetch = vi.fn();
const mockUseParcels = vi.fn((query: ParcelListQuery) => {
  void query;
  return {
    data: { items: [], total: 0, page: 1, limit: 20 },
    loading: false,
    error: null,
    refetch,
  };
});

vi.mock('@/lib/hooks/useParcels', () => ({
  useParcels: (q: ParcelListQuery) => mockUseParcels(q),
}));

function Probe() {
  useCustomerParcels({ page: 1, limit: 20 });
  return null;
}

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('useCustomerParcels', () => {
  it('polls refetch every 30s', async () => {
    vi.useFakeTimers();
    render(<Probe />);
    expect(mockUseParcels).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(refetch).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(refetch).toHaveBeenCalled();
  });
});
