import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AffiliateRegisterForm } from './AffiliateRegisterForm';

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

describe('AffiliateRegisterForm', () => {
  it(
    'submits affiliate registration with postcode address and capacity',
    async () => {
      const user = userEvent.setup();
      registerAccount.mockResolvedValue(undefined);
      render(<AffiliateRegisterForm />);
      await user.type(screen.getByLabelText(/first name/i), 'Hub');
      await user.type(screen.getByLabelText(/last name/i), 'Owner');
      await user.type(screen.getByLabelText(/^email$/i), 'hub@example.com');
      await user.type(screen.getByLabelText(/uk postcode/i), 'SW1A1AA');
      await user.type(screen.getByLabelText(/pickup address/i), '10 High Street');
      await user.type(screen.getByLabelText(/^password$/i), 'GoodPassw0rd!');
      await user.click(screen.getByRole('button', { name: /register/i }));
      await waitFor(() => expect(registerAccount).toHaveBeenCalled());
      expect(registerAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'affiliate',
          addressLine1: '10 High Street',
          maxDailyCapacity: 20,
        }),
      );
      expect(push).toHaveBeenCalledWith('/affiliate/dashboard');
    },
    15_000,
  );
});
