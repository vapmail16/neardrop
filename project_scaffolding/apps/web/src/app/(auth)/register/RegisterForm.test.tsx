import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegisterForm } from './RegisterForm';

const push = vi.fn();
const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}));

const registerAccount = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  registerAccount: (...a: unknown[]) => registerAccount(...a),
}));

afterEach(() => {
  push.mockClear();
  refresh.mockClear();
  registerAccount.mockReset();
});

describe('RegisterForm', () => {
  it(
    'submits carrier registration',
    async () => {
    const user = userEvent.setup();
    registerAccount.mockResolvedValue({
      user: {
        id: 'u1',
        email: 'n@o.com',
        firstName: 'N',
        lastName: 'O',
        role: 'carrier',
        phone: null,
        postcode: null,
        emailVerified: true,
        createdAt: '',
      },
    });
    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/first name/i), 'N');
    await user.type(screen.getByLabelText(/last name/i), 'O');
    await user.type(screen.getByLabelText(/^email$/i), 'n@o.com');
    await user.type(screen.getByLabelText(/^password$/i), 'GoodPass1!x');
    await user.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() =>
      expect(registerAccount).toHaveBeenCalledWith({
        email: 'n@o.com',
        password: 'GoodPass1!x',
        firstName: 'N',
        lastName: 'O',
        role: 'carrier',
        postcode: null,
      }),
    );
    expect(push).toHaveBeenCalledWith('/carrier/dashboard');
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
