import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerRegisterForm } from './CustomerRegisterForm';

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

describe.sequential('CustomerRegisterForm', () => {
  it(
    'submits customer registration with postcode',
    async () => {
      const user = userEvent.setup();
      registerAccount.mockResolvedValue(undefined);
      render(<CustomerRegisterForm />);
      await user.type(screen.getByLabelText(/first name/i), 'A');
      await user.type(screen.getByLabelText(/last name/i), 'B');
      await user.type(screen.getByLabelText(/^email$/i), 'c@example.com');
      await user.type(screen.getByLabelText(/uk postcode/i), 'SW1A1AA');
      await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
      await user.click(screen.getByRole('button', { name: /register/i }));
      await waitFor(() => expect(registerAccount).toHaveBeenCalled());
      expect(registerAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'customer',
          postcode: expect.any(String),
        }),
      );
      expect(push).toHaveBeenCalledWith('/customer/dashboard');
    },
    15_000,
  );
});
