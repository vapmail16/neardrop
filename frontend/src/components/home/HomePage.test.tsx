import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders NearDrop title for root route', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: /NearDrop/i })).toBeInTheDocument();
  });

  it('exposes stable root landmark for smoke / E2E', () => {
    render(<HomePage />);
    expect(screen.getByTestId('home-root')).toBeInTheDocument();
  });

  it('renders dark hero with positioning line', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/Coordinating carriers, customers, and local pickup partners/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Neighbourhood last-mile delivery/i)).toBeInTheDocument();
  });

  it('shows hero callout and short product description', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 2, name: /delivery made simple/i })).toBeInTheDocument();
    expect(
      screen.getByText(/one platform for carriers, affiliates, customers, and ops/i),
    ).toBeInTheDocument();
  });

  it('keeps top navigation with single login and unified register', () => {
    render(<HomePage />);
    const nav = screen.getByRole('navigation', { name: /home top navigation/i });
    expect(within(nav).getByRole('link', { name: /^login$/i })).toHaveAttribute('href', '/login');
    expect(within(nav).getByRole('link', { name: /^register$/i })).toHaveAttribute('href', '/register');
  });

  it('exposes only one login link on the whole home page', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('link', { name: /^login$/i })).toHaveLength(1);
  });

  it('exposes only one register link on the whole home page (top nav)', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('link', { name: /^register$/i })).toHaveLength(1);
    const nav = screen.getByRole('navigation', { name: /home top navigation/i });
    expect(within(nav).getByRole('link', { name: /^register$/i })).toHaveAttribute('href', '/register');
  });

  it('renders How it works steps', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /how it works/i })).toBeInTheDocument();
    expect(screen.getByText(/The carrier uploads a manifest and delivers parcels to a local affiliate/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The pickup point confirms receipt and the parcel is ready for collection/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The customer visits the affiliate, scans their QR code, and picks up the parcel/i),
    ).toBeInTheDocument();
  });

  it('renders footer with copyright only', () => {
    render(<HomePage />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(within(footer).queryByRole('link', { name: /^login$/i })).not.toBeInTheDocument();
    expect(screen.getByText(/©\s*2026\s*NearDrop/i)).toBeInTheDocument();
  });

  it('does not render quick dashboard links in footer', () => {
    render(<HomePage />);
    expect(screen.queryByRole('navigation', { name: /quick dashboard links/i })).not.toBeInTheDocument();
  });

  it('does not render seeded credentials section on home page', () => {
    render(<HomePage />);
    expect(screen.queryByText(/demo seeded login/i)).not.toBeInTheDocument();
  });
});
