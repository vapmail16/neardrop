import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from '@/lib/api/client';
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
    const form = screen.getByRole('button', { name: /^login$/i }).closest('form');
    expect(form).toBeTruthy();
    expect(form).toHaveAttribute('method', 'post');
  });

  it('renders role selector buttons, back to home, and seeded credentials panel with fill actions', () => {
    render(<LoginForm />);
    expect(screen.getByRole('navigation', { name: /login secondary navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: /^carrier$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^customer$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^affiliate$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ops$/i })).toBeInTheDocument();
    expect(screen.getByText(/demo seeded login/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /fill .+ demo credentials/i })).toHaveLength(1);
  });

  it('fill button for carrier populates email and password fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByText(/demo seeded login/i));
    await user.click(screen.getByRole('button', { name: /fill carrier demo credentials/i }));
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('testmail1@example.com');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('ZRqA8b_G!v7mt9A');
  });

  it('shows only ops demo row when Ops portal is selected', async () => {
    const user = userEvent.setup();
    navState.qs = 'portal=ops';
    render(<LoginForm />);
    await user.click(screen.getByText(/demo seeded login/i));
    expect(screen.getByText(/testmail4@example.com/i)).toBeInTheDocument();
    expect(screen.queryByText(/testmail1@example.com/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /fill ops demo credentials/i }));
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('testmail4@example.com');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('Demo8Ops!ViewAll99');
  });

  it('replaces demo credentials in the open panel when switching portal', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByText(/demo seeded login/i));
    expect(screen.getByText(/testmail1@example.com/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^ops$/i }));
    expect(screen.queryByText(/testmail1@example.com/i)).not.toBeInTheDocument();
    expect(screen.getByText(/testmail4@example.com/i)).toBeInTheDocument();
  });

  it('clears typed email and password when switching portal', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/^email$/i), 'someone@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'SecretSecret1!');
    await user.click(screen.getByRole('button', { name: /^affiliate$/i }));
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
  });

  it('clears email, password, and prior login error when switching portal', async () => {
    const user = userEvent.setup();
    login.mockRejectedValue(
      new ApiRequestError(401, {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      }),
    );
    render(<LoginForm />);
    await user.click(screen.getByText(/demo seeded login/i));
    await user.click(screen.getByRole('button', { name: /fill carrier demo credentials/i }));
    await user.click(screen.getByRole('button', { name: /^login$/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid email or password/i);
    });

    await user.click(screen.getByRole('button', { name: /^ops$/i }));
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
    await user.type(screen.getByLabelText(/^email$/i), 'a@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /^login$/i }));
    await waitFor(() => expect(login).toHaveBeenCalled());
    expect(push).toHaveBeenCalledWith('/carrier/parcels');
  });

  it('redirects customer role to customer dashboard when returnTo is absent', async () => {
    const user = userEvent.setup();
    navState.qs = 'portal=carrier';
    login.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        role: 'customer',
        phone: null,
        postcode: 'E1 6AN',
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/^email$/i), 'cust@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /^login$/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/customer/dashboard'));
  });

  it('redirects affiliate role to affiliate dashboard', async () => {
    const user = userEvent.setup();
    navState.qs = '';
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
    await user.click(screen.getByRole('button', { name: /^affiliate$/i }));
    await user.type(screen.getByLabelText(/^email$/i), 'aff@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /^login$/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/affiliate/dashboard'));
  });

  it('redirects ops role to ops dashboard', async () => {
    const user = userEvent.setup();
    navState.qs = '';
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
    await user.click(screen.getByRole('button', { name: /^ops$/i }));
    await user.type(screen.getByLabelText(/^email$/i), 'ops@b.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
    await user.click(screen.getByRole('button', { name: /^login$/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/ops/dashboard'));
  });
});
