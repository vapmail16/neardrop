import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DsSection } from './DsSection';

describe('DsSection', () => {
  it('associates heading with section for a11y', () => {
    render(
      <DsSection title="Pickup" sectionId="pickup-section">
        <p>Content</p>
      </DsSection>,
    );
    const region = screen.getByRole('region', { name: /pickup/i });
    expect(region).toBeInTheDocument();
    expect(region).toContainHTML('Content');
  });
});
