import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AffiliateNav } from './AffiliateNav';

const push = vi.fn();
const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/affiliate/dashboard',
  useRouter: () => ({ push, refresh }),
}));

const logout = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  logout: (...a: unknown[]) => logout(...a),
}));

const userPublic = {
  id: 'u1',
  email: 'a@b.com',
  firstName: 'Hub',
  lastName: 'Owner',
  role: 'affiliate' as const,
  phone: null,
  postcode: 'E1 6AN',
  emailVerified: true,
  createdAt: '',
};

afterEach(() => {
  push.mockClear();
  refresh.mockClear();
  logout.mockReset();
});

describe('AffiliateNav', () => {
  it('shows user name and signs out to affiliate login', async () => {
    const user = userEvent.setup();
    logout.mockResolvedValue(undefined);
    render(<AffiliateNav user={userPublic} />);
    expect(screen.getByTestId('affiliate-nav-user')).toHaveTextContent('Hub Owner');
    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(logout).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/login?portal=affiliate');
  });
});
