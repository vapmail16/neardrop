'use client';

import type { UserPublic } from '@neardrop/shared';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

const links = [
  { href: '/ops/dashboard', label: 'Dashboard' },
  { href: '/ops/map', label: 'Map' },
  { href: '/ops/parcels', label: 'Parcels' },
] as const;

export function OpsNav({ user }: { user: UserPublic }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogout() {
    setError(null);
    setPending(true);
    try {
      await logout();
      router.push('/login?portal=ops');
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
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 sm:gap-6">
          <span className="shrink-0 font-semibold text-neutral-900">Ops</span>
          <nav className="flex flex-wrap gap-3 text-sm sm:gap-4">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`min-h-11 touch-manipulation content-center py-2 ${
                    active
                      ? 'font-medium text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <span className="text-neutral-600" data-testid="ops-nav-user">
            {user.firstName} {user.lastName}
          </span>
          <button
            type="button"
            onClick={() => void onLogout()}
            disabled={pending}
            className="min-h-11 touch-manipulation text-neutral-600 underline decoration-neutral-400 underline-offset-2 hover:text-neutral-900 disabled:opacity-50"
          >
            {pending ? 'Signing out…' : 'Sign out'}
          </button>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    </header>
  );
}
