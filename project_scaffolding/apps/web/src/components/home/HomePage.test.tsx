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

  it('shows role menu for carrier, customer, affiliate', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 2, name: /choose your role/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /^carrier$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /^customer$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /^affiliate$/i })).toBeInTheDocument();
  });

  it('links role actions to correct auth pages', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /register \(carrier\)/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /sign in \(carrier\)/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /register \(customer\)/i })).toHaveAttribute(
      'href',
      '/customer/register',
    );
    expect(screen.getByRole('link', { name: /sign in \(customer\)/i })).toHaveAttribute(
      'href',
      '/login?portal=customer',
    );
    expect(screen.getByRole('link', { name: /register \(affiliate\)/i })).toHaveAttribute(
      'href',
      '/affiliate/register',
    );
    expect(screen.getByRole('link', { name: /sign in \(affiliate\)/i })).toHaveAttribute(
      'href',
      '/login?portal=affiliate',
    );
  });
});
