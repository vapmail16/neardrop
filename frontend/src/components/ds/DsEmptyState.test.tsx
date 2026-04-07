import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DsEmptyState } from './DsEmptyState';

describe('DsEmptyState', () => {
  it('shows title and description', () => {
    render(<DsEmptyState title="No parcels" description="Check back soon." />);
    expect(screen.getByTestId('ds-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no parcels/i)).toBeInTheDocument();
    expect(screen.getByText(/check back soon/i)).toBeInTheDocument();
  });
});
