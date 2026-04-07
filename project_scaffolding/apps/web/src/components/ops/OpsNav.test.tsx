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

  it('links to ops dashboard, map, and parcels', () => {
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
    expect(screen.getByRole('link', { name: /^dashboard$/i })).toHaveAttribute('href', '/ops/dashboard');
    expect(screen.getByRole('link', { name: /^map$/i })).toHaveAttribute('href', '/ops/map');
    expect(screen.getByRole('link', { name: /^parcels$/i })).toHaveAttribute('href', '/ops/parcels');
  });
});
