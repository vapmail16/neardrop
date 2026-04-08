/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserPublic } from '@neardrop/shared';
import { describe, expect, it, vi } from 'vitest';
import { OpsNav } from './OpsNav';

const push = vi.fn();
const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => '/ops/dashboard',
}));

const logout = vi.fn();
vi.mock('@/lib/api/auth', () => ({
  logout: () => logout(),
}));

describe('OpsNav', () => {
  it('shows user name and signs out to ops login', async () => {
    const user = userEvent.setup();
    logout.mockResolvedValue(undefined);
    const u: UserPublic = {
      id: '1',
      email: 'o@example.com',
      firstName: 'Ops',
      lastName: 'User',
      role: 'ops',
      phone: null,
      postcode: null,
      emailVerified: true,
      createdAt: '',
    };
    render(<OpsNav user={u} />);
    expect(screen.getByTestId('ops-nav-user')).toHaveTextContent(/Ops User/);
    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(logout).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/login?portal=ops');
  });

  it('links to ops tools and cross-portal views', () => {
    const u: UserPublic = {
      id: '1',
      email: 'o@example.com',
      firstName: 'Nav',
      lastName: 'Test',
      role: 'ops',
      phone: null,
      postcode: null,
      emailVerified: true,
      createdAt: '',
    };
    render(<OpsNav user={u} />);
    expect(screen.getByRole('link', { name: /^ops$/i })).toHaveAttribute('href', '/ops/dashboard');
    expect(screen.getByRole('link', { name: /^carrier$/i })).toHaveAttribute('href', '/carrier/dashboard');
    expect(screen.getByRole('link', { name: /^customer$/i })).toHaveAttribute('href', '/customer/dashboard');
    expect(screen.getByRole('link', { name: /^affiliate$/i })).toHaveAttribute('href', '/affiliate/dashboard');
    expect(screen.getByRole('link', { name: /^map$/i })).toHaveAttribute('href', '/ops/map');
    expect(screen.getByRole('link', { name: /^parcels$/i })).toHaveAttribute('href', '/ops/parcels');
  });
});
