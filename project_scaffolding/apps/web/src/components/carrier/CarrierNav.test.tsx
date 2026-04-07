import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CarrierNav } from './CarrierNav';

const push = vi.fn();
const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/carrier/dashboard',
  useRouter: () => ({ push, refresh }),
}));

const logout = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  logout: (...a: unknown[]) => logout(...a),
}));

const userFixture = {
  id: 'u1',
  email: 'c@d.com',
  firstName: 'Car',
  lastName: 'Rier',
  role: 'carrier' as const,
  phone: null,
  postcode: null,
  emailVerified: true,
  createdAt: '',
};

afterEach(() => {
  push.mockClear();
  refresh.mockClear();
  logout.mockReset();
});

describe('CarrierNav', () => {
  it('shows user name', () => {
    render(<CarrierNav user={userFixture} />);
    expect(screen.getByTestId('carrier-nav-user')).toHaveTextContent('Car Rier');
  });

  it('logs out and navigates to login', async () => {
    const user = userEvent.setup();
    logout.mockResolvedValue(undefined);
    render(<CarrierNav user={userFixture} />);
    await user.click(screen.getByRole('button', { name: /sign out/i }));
    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(push).toHaveBeenCalledWith('/login');
  });
});
