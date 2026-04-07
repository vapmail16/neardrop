'use client';

import type { UserPublic } from '@neardrop/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PortalNavBar } from '@/components/ds/PortalNavBar';
import { logout } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

const links = [
  { href: '/carrier/dashboard', label: 'Dashboard' },
  { href: '/carrier/manifests', label: 'Manifests' },
  { href: '/carrier/parcels', label: 'Parcels' },
] as const;

export function CarrierNav({ user }: { user: UserPublic }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogout() {
    setError(null);
    setPending(true);
    try {
      await logout();
      router.push('/login');
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
      roleLabel="Carrier"
      links={links}
      userLine={`${user.firstName} ${user.lastName}`}
      userTestId="carrier-nav-user"
      onSignOut={() => void onLogout()}
      signOutPending={pending}
      error={error}
    />
  );
}
