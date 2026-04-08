import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegisterForm } from './RegisterForm';

const push = vi.fn();
const refresh = vi.fn();
const navState = { qs: '' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => new URLSearchParams(navState.qs),
}));

const registerAccount = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  registerAccount: (...a: unknown[]) => registerAccount(...a),
}));

afterEach(() => {
  push.mockClear();
  refresh.mockClear();
  registerAccount.mockReset();
  navState.qs = '';
});

describe('RegisterForm', () => {
  it('renders back to home in registration navigation', () => {
    render(<RegisterForm />);
    expect(screen.getByRole('navigation', { name: /registration secondary navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('disables role-specific fields when carrier is selected', () => {
    render(<RegisterForm />);
    expect(screen.getByRole('button', { name: /^carrier$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/uk postcode/i)).toBeDisabled();
    expect(screen.getByLabelText(/pickup address/i)).toBeDisabled();
    expect(screen.getByLabelText(/max parcels per day/i)).toBeDisabled();
  });

  it(
    'submits customer registration and redirects to customer dashboard',
    async () => {
    const user = userEvent.setup();
    registerAccount.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'n@o.com',
        firstName: 'N',
        lastName: 'O',
        role: 'customer',
        phone: null,
        postcode: 'SW1A 1AA',
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<RegisterForm />);
    await user.click(screen.getByRole('button', { name: /^customer$/i }));
    await user.type(screen.getByLabelText(/first name/i), 'N');
    await user.type(screen.getByLabelText(/last name/i), 'O');
    await user.type(screen.getByLabelText(/^email$/i), 'n@o.com');
    await user.type(screen.getByLabelText(/uk postcode/i), 'SW1A 1AA');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPass1!x');
    await user.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() =>
      expect(registerAccount).toHaveBeenCalledWith({
        email: 'n@o.com',
        password: 'GoodPass1!x',
        firstName: 'N',
        lastName: 'O',
        role: 'customer',
        postcode: 'SW1A 1AA',
      }),
    );
    expect(push).toHaveBeenCalledWith('/customer/dashboard');
    },
    10_000,
  );

  it(
    'submits affiliate registration with affiliate-only fields',
    async () => {
      const user = userEvent.setup();
      registerAccount.mockResolvedValue({
        user: {
          id: 'u1',
          email: 'a@o.com',
          firstName: 'A',
          lastName: 'F',
          role: 'affiliate',
          phone: null,
          postcode: 'E1 6AN',
          emailVerified: true,
          createdAt: '',
        },
      });
      render(<RegisterForm />);
      await user.click(screen.getByRole('button', { name: /^affiliate$/i }));
      await user.type(screen.getByLabelText(/first name/i), 'A');
      await user.type(screen.getByLabelText(/last name/i), 'F');
      await user.type(screen.getByLabelText(/^email$/i), 'a@o.com');
      await user.type(screen.getByLabelText(/uk postcode/i), 'E1 6AN');
      await user.type(screen.getByLabelText(/pickup address/i), '88 Demo Street');
      await user.clear(screen.getByLabelText(/max parcels per day/i));
      await user.type(screen.getByLabelText(/max parcels per day/i), '30');
      await user.type(screen.getByLabelText(/^password$/i), 'GoodPass1!x');
      await user.click(screen.getByRole('button', { name: /register/i }));
      await waitFor(() =>
        expect(registerAccount).toHaveBeenCalledWith({
          email: 'a@o.com',
          password: 'GoodPass1!x',
          firstName: 'A',
          lastName: 'F',
          role: 'affiliate',
          postcode: 'E1 6AN',
          addressLine1: '88 Demo Street',
          maxDailyCapacity: 30,
        }),
      );
      expect(push).toHaveBeenCalledWith('/affiliate/dashboard');
    },
    10_000,
  );

  it('shows error on failure', async () => {
    const user = userEvent.setup();
    registerAccount.mockRejectedValue(new Error('Email taken'));
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/first name/i), 'N');
    await user.type(screen.getByLabelText(/last name/i), 'O');
    await user.type(screen.getByLabelText(/^email$/i), 'n@o.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPass1!x');
    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email taken');
  });
});
