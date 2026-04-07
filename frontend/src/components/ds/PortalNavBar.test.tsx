import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PortalNavBar } from './PortalNavBar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/carrier/dashboard',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe('PortalNavBar', () => {
  it('renders role label and links', () => {
    render(
      <PortalNavBar
        roleLabel="Carrier"
        links={[
          { href: '/carrier/dashboard', label: 'Dashboard' },
          { href: '/carrier/parcels', label: 'Parcels' },
        ]}
        userLine="Jane Doe"
        userTestId="carrier-nav-user"
        onSignOut={() => {}}
        signOutPending={false}
      />,
    );
    expect(screen.getByText(/^carrier$/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^dashboard$/i })).toHaveAttribute('href', '/carrier/dashboard');
    expect(screen.getByTestId('carrier-nav-user')).toHaveTextContent('Jane Doe');
  });
});
