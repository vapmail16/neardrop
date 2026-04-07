/**
 * Phase 7 — page integration: `useOpsStats` mocked; asserts wiring and UI states.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpsDashboardClient } from './OpsDashboardClient';

const useOpsStatsMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/hooks/useOpsStats', () => ({
  useOpsStats: () => useOpsStatsMock(),
}));

vi.mock('@/components/ops/OpsStatCards', () => ({
  OpsStatCards: () => <div data-testid="ops-stat-cards-stub">cards</div>,
}));

describe('OpsDashboardClient (integration)', () => {
  beforeEach(() => {
    useOpsStatsMock.mockReset();
  });

  it('calls useOpsStats', () => {
    useOpsStatsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<OpsDashboardClient />);
    expect(useOpsStatsMock).toHaveBeenCalled();
  });

  it('shows loading', () => {
    useOpsStatsMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<OpsDashboardClient />);
    expect(screen.getByTestId('page-skeleton')).toBeInTheDocument();
  });

  it('shows error alert', () => {
    useOpsStatsMock.mockReturnValue({
      data: null,
      loading: false,
      error: 'Stats unavailable',
      refetch: vi.fn(),
    });
    render(<OpsDashboardClient />);
    expect(screen.getByRole('alert')).toHaveTextContent('Stats unavailable');
  });

  it('renders stat cards when data loads', () => {
    useOpsStatsMock.mockReturnValue({
      data: {
        totalParcels: 0,
        totalAffiliates: 0,
        parcelCountsByStatus: [
          { status: 'manifest_received', count: 0 },
          { status: 'in_transit', count: 0 },
          { status: 'dropped_at_affiliate', count: 0 },
          { status: 'ready_to_collect', count: 0 },
          { status: 'collected', count: 0 },
          { status: 'exception', count: 0 },
        ],
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<OpsDashboardClient />);
    expect(screen.getByTestId('ops-stat-cards-stub')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /operations dashboard/i })).toBeInTheDocument();
  });
});
