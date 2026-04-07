import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ParcelStatus } from '@neardrop/shared';
import { StatusBadge } from './StatusBadge';

const statuses: ParcelStatus[] = [
  'manifest_received',
  'in_transit',
  'dropped_at_affiliate',
  'ready_to_collect',
  'collected',
  'exception',
];

describe('StatusBadge', () => {
  it.each(statuses)('renders for %s', (status) => {
    render(<StatusBadge status={status} />);
    const el = screen.getByTestId('parcel-status-badge');
    expect(el).toHaveAttribute('data-status', status);
    expect(el.textContent).toBeTruthy();
  });

  it('exposes status in data attribute', () => {
    render(<StatusBadge status="in_transit" />);
    expect(screen.getByTestId('parcel-status-badge')).toHaveAttribute('data-status', 'in_transit');
  });
});
