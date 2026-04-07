import { render, screen } from '@testing-library/react';
import type { AffiliateEarningsSummaryPublic } from '@neardrop/shared';
import { describe, expect, it } from 'vitest';
import { EarningsSummary } from './EarningsSummary';

const emptySummary: AffiliateEarningsSummaryPublic = {
  pendingTotal: '0.00',
  paidTotal: '0.00',
  pendingCount: 0,
  recent: [],
};

describe('EarningsSummary', () => {
  it('renders pending, paid totals and pending row count', () => {
    const data: AffiliateEarningsSummaryPublic = {
      pendingTotal: '12.50',
      paidTotal: '3.25',
      pendingCount: 4,
      recent: [],
    };
    render(<EarningsSummary data={data} />);
    expect(screen.getByTestId('earn-pending-total')).toHaveTextContent('£12.50');
    expect(screen.getByText('£3.25')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows empty table message when there are no recent rows', () => {
    render(<EarningsSummary data={emptySummary} />);
    expect(screen.getByText(/no earnings yet/i)).toBeInTheDocument();
  });

  it('renders a row per recent earning', () => {
    const data: AffiliateEarningsSummaryPublic = {
      ...emptySummary,
      recent: [
        {
          id: 'e1',
          parcelId: 'parcel-abc',
          amount: '0.50',
          payoutStatus: 'pending',
          createdAt: '2026-04-01T12:00:00.000Z',
        },
      ],
    };
    render(<EarningsSummary data={data} />);
    expect(screen.getByTestId('earning-row-e1')).toBeInTheDocument();
    expect(screen.getByText('parcel-abc')).toBeInTheDocument();
    expect(screen.getByText('£0.50')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});
