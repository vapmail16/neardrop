import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DsButton } from './DsButton';

describe('DsButton', () => {
  it('renders label and applies primary styles by default', () => {
    render(<DsButton type="button">Submit</DsButton>);
    const btn = screen.getByRole('button', { name: /submit/i });
    expect(btn).toHaveClass('bg-brand-700');
  });

  it('supports secondary variant', () => {
    render(
      <DsButton type="button" variant="secondary">
        Cancel
      </DsButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('border-neutral-300');
  });
});
