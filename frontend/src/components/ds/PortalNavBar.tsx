'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export type PortalNavLink = { href: string; label: string };

export type PortalNavBarProps = {
  roleLabel: string;
  links: readonly PortalNavLink[];
  userLine: string;
  userTestId: string;
  onSignOut: () => void;
  signOutPending: boolean;
  signOutLabel?: string;
  error?: string | null;
  trailing?: ReactNode;
};

export function PortalNavBar({
  roleLabel,
  links,
  userLine,
  userTestId,
  onSignOut,
  signOutPending,
  signOutLabel = 'Sign out',
  error,
  trailing,
}: PortalNavBarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-surface-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface-card/80">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-6">
          <span className="text-sm font-semibold tracking-tight text-brand-800">NearDrop</span>
          <span className="hidden text-neutral-300 sm:inline" aria-hidden>
            |
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{roleLabel}</span>
          <nav className="flex flex-wrap gap-1 text-sm sm:gap-2" aria-label={`${roleLabel} navigation`}>
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? 'rounded-lg bg-brand-50 px-3 py-2 font-medium text-brand-800'
                      : 'min-h-[44px] content-center rounded-lg px-3 py-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:min-h-0'
                  }
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          {trailing}
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <span className="text-neutral-600" data-testid={userTestId}>
            {userLine}
          </span>
          <button
            type="button"
            onClick={onSignOut}
            disabled={signOutPending}
            className="rounded-lg px-2 py-1 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-50"
          >
            {signOutPending ? 'Signing out…' : signOutLabel}
          </button>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    </header>
  );
}
