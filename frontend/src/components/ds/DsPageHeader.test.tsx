import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DsPageHeader } from './DsPageHeader';

describe('DsPageHeader', () => {
  it('renders title and optional description', () => {
    render(<DsPageHeader title="Parcels" description="Track status" />);
    expect(screen.getByRole('heading', { level: 1, name: /parcels/i })).toBeInTheDocument();
    expect(screen.getByText(/track status/i)).toBeInTheDocument();
  });

  it('renders action slot', () => {
    render(<DsPageHeader title="List" action={<button type="button">Filter</button>} />);
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
  });
});
