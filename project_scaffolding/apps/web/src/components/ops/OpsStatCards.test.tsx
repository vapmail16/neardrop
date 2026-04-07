import { render, screen } from '@testing-library/react';
import type { OpsStatsPublic } from '@neardrop/shared';
import { describe, expect, it } from 'vitest';
import { OpsStatCards } from './OpsStatCards';

const sample: OpsStatsPublic = {
  totalParcels: 5,
  totalAffiliates: 3,
  parcelCountsByStatus: [
    { status: 'manifest_received', count: 2 },
    { status: 'in_transit', count: 1 },
    { status: 'dropped_at_affiliate', count: 1 },
    { status: 'ready_to_collect', count: 1 },
    { status: 'collected', count: 0 },
    { status: 'exception', count: 0 },
  ],
};

describe('OpsStatCards', () => {
  it('renders totals and status rows', () => {
    render(<OpsStatCards data={sample} />);
    expect(screen.getByTestId('ops-total-parcels')).toHaveTextContent('5');
    expect(screen.getByTestId('ops-total-affiliates')).toHaveTextContent('3');
    expect(screen.getByTestId('ops-count-manifest_received')).toHaveTextContent('2');
  });

  it('renders zero totals and full status breakdown', () => {
    const empty: typeof sample = {
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
    };
    render(<OpsStatCards data={empty} />);
    expect(screen.getByTestId('ops-total-parcels')).toHaveTextContent('0');
    expect(screen.getByTestId('ops-status-breakdown').querySelectorAll('li')).toHaveLength(6);
  });
});
