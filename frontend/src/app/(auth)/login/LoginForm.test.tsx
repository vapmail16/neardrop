import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

const push = vi.fn();
const refresh = vi.fn();

const navState = { qs: 'returnTo=%2Fcarrier%2Fparcels' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => new URLSearchParams(navState.qs),
}));

const login = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  login: (...a: unknown[]) => login(...a),
}));

afterEach(() => {
  push.mockClear();
  refresh.mockClear();
  login.mockReset();
  navState.qs = 'returnTo=%2Fcarrier%2Fparcels';
});

describe.sequential('LoginForm', { timeout: 10_000 }, () => {
  it('uses post + client handler so native submit never leaks credentials via GET query', () => {
    render(<LoginForm />);
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
    expect(form).toBeTruthy();
    expect(form).toHaveAttribute('method', 'post');
  });

  it('submits and redirects carrier to returnTo', async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        role: 'carrier',
        phone: null,
        postcode: null,
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(login).toHaveBeenCalled());
    expect(push).toHaveBeenCalledWith('/carrier/parcels');
  });

  it('blocks non-carrier role on carrier portal', async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        role: 'customer',
        phone: null,
        postcode: null,
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/carrier accounts only/i);
    expect(push).not.toHaveBeenCalled();
  });

  it('blocks carrier role on customer portal', async () => {
    navState.qs = 'portal=customer';
    const user = userEvent.setup();
    login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'carrier@b.com',
        firstName: 'C',
        lastName: 'R',
        role: 'carrier',
        phone: null,
        postcode: null,
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'carrier@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/customer accounts only/i);
    expect(push).not.toHaveBeenCalled();
  });

  it('accepts customer when portal=customer', async () => {
    navState.qs = 'portal=customer&returnTo=%2Fcustomer%2Fparcels';
    const user = userEvent.setup();
    login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'c@b.com',
        firstName: 'C',
        lastName: 'D',
        role: 'customer',
        phone: null,
        postcode: 'E1 6AN',
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'c@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/customer/parcels'));
  });

  it('blocks customer role on affiliate portal', async () => {
    navState.qs = 'portal=affiliate';
    const user = userEvent.setup();
    login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'c@b.com',
        firstName: 'C',
        lastName: 'U',
        role: 'customer',
        phone: null,
        postcode: 'E1 6AN',
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'c@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/affiliate accounts only/i);
    expect(push).not.toHaveBeenCalled();
  });

  it('accepts affiliate when portal=affiliate', async () => {
    navState.qs = 'portal=affiliate&returnTo=%2Faffiliate%2Fparcels';
    const user = userEvent.setup();
    login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'aff@b.com',
        firstName: 'A',
        lastName: 'F',
        role: 'affiliate',
        phone: null,
        postcode: 'E1 6AN',
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'aff@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/affiliate/parcels'));
  });

  it('blocks affiliate role on ops portal', async () => {
    navState.qs = 'portal=ops';
    const user = userEvent.setup();
    login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'aff@b.com',
        firstName: 'A',
        lastName: 'F',
        role: 'affiliate',
        phone: null,
        postcode: 'E1 6AN',
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'aff@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/operations accounts only/i);
    expect(push).not.toHaveBeenCalled();
  });

  it('accepts ops when portal=ops', async () => {
    navState.qs = 'portal=ops&returnTo=%2Fops%2Fdashboard';
    const user = userEvent.setup();
    login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'ops@b.com',
        firstName: 'O',
        lastName: 'P',
        role: 'ops',
        phone: null,
        postcode: null,
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'ops@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/ops/dashboard'));
  });
});
