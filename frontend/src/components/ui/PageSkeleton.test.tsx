import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageSkeleton } from './PageSkeleton';

describe('PageSkeleton', () => {
  it('exposes busy state for a11y', () => {
    render(<PageSkeleton title="Test" subtitle="Sub" />);
    const root = screen.getByTestId('page-skeleton');
    expect(root).toHaveAttribute('aria-busy', 'true');
  });
});
