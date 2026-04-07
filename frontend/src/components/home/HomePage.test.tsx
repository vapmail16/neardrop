import { render, screen } from '@testing-library/react';
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

  it('shows role section heading and subheading', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 2, name: /choose your role/i })).toBeInTheDocument();
    expect(
      screen.getByText(/NearDrop connects three sides of every delivery/i),
    ).toBeInTheDocument();
  });

  it('shows role cards for carrier, customer, affiliate with updated copy', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 3, name: /^carrier$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /^customer$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /^affiliate$/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Upload manifests, manage parcel status, and coordinate deliveries/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Track your parcels, view your collection QR code, and find your nearest/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Receive parcels at your location and complete handover to customers/i),
    ).toBeInTheDocument();
  });

  it('links role actions to correct auth pages (accessible names)', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /register as carrier/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /sign in as carrier/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /register as customer/i })).toHaveAttribute(
      'href',
      '/customer/register',
    );
    expect(screen.getByRole('link', { name: /sign in as customer/i })).toHaveAttribute(
      'href',
      '/login?portal=customer',
    );
    expect(screen.getByRole('link', { name: /register as affiliate/i })).toHaveAttribute(
      'href',
      '/affiliate/register',
    );
    expect(screen.getByRole('link', { name: /sign in as affiliate/i })).toHaveAttribute(
      'href',
      '/login?portal=affiliate',
    );
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

  it('renders footer with operations link and copyright', () => {
    render(<HomePage />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /operations sign in/i })).toHaveAttribute(
      'href',
      '/login?portal=ops',
    );
    expect(screen.getByText(/©\s*2026\s*NearDrop/i)).toBeInTheDocument();
  });

  it('keeps quick dashboard links for navigation', () => {
    render(<HomePage />);
    const nav = screen.getByRole('navigation', { name: /quick dashboard links/i });
    expect(nav).toBeInTheDocument();
    expect(nav.querySelector('a[href="/carrier/dashboard"]')).toBeTruthy();
    expect(nav.querySelector('a[href="/customer/dashboard"]')).toBeTruthy();
    expect(nav.querySelector('a[href="/affiliate/dashboard"]')).toBeTruthy();
    expect(nav.querySelector('a[href="/ops/dashboard"]')).toBeTruthy();
  });
});
