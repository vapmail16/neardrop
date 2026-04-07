/**
 * Phase 4 — strict TDD: page integration; manifest upload treated as external service (stub).
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CarrierManifestsClient } from './CarrierManifestsClient';

vi.mock('@/components/carrier/ManifestUploadForm', () => ({
  ManifestUploadForm: () => <div data-testid="manifest-upload-stub" />,
}));

vi.mock('next/link', () => ({
  default ({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  },
}));

describe('CarrierManifestsClient (integration)', () => {
  it('renders title and stubbed upload', () => {
    render(<CarrierManifestsClient />);
    expect(screen.getByRole('heading', { name: /manifests/i })).toBeInTheDocument();
    expect(screen.getByTestId('manifest-upload-stub')).toBeInTheDocument();
  });

  it('links to parcels list', () => {
    render(<CarrierManifestsClient />);
    const link = screen.getByRole('link', { name: /view parcels/i });
    expect(link).toHaveAttribute('href', '/carrier/parcels');
  });
});
