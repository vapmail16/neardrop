'use client';

import type { UserPublic } from '@neardrop/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PortalNavBar } from '@/components/ds/PortalNavBar';
import { logout } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

const links = [
  { href: '/customer/dashboard', label: 'Dashboard' },
  { href: '/customer/parcels', label: 'Parcels' },
] as const;

export function CustomerNav({ user }: { user: UserPublic }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogout() {
    setError(null);
    setPending(true);
    try {
      await logout();
      router.push('/login?portal=customer');
      router.refresh();
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Logout failed';
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <PortalNavBar
      roleLabel={user.role === 'ops' ? 'Ops · Customer view' : 'Customer'}
      links={links}
      userLine={`${user.firstName} ${user.lastName}`}
      userTestId="customer-nav-user"
      onSignOut={() => void onLogout()}
      signOutPending={pending}
      error={error}
    />
  );
}
