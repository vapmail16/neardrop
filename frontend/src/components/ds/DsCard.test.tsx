import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DsCard } from './DsCard';

describe('DsCard', () => {
  it('renders children with surface card styling', () => {
    render(<DsCard>Inner</DsCard>);
    const el = screen.getByTestId('ds-card');
    expect(el).toHaveTextContent('Inner');
    expect(el).toHaveClass('rounded-nd');
    expect(el).toHaveClass('bg-surface-card');
  });
});
