'use client';

import { DEMO_PORTAL_TEST_ACCOUNTS } from '@neardrop/shared';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DsButton } from '@/components/ds/DsButton';
import { DsPageHeader } from '@/components/ds/DsPageHeader';
import { login } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

type PortalRole = 'carrier' | 'customer' | 'affiliate' | 'ops';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portalParam = searchParams.get('portal');
  const initialPortal: PortalRole =
    portalParam === 'customer'
      ? 'customer'
      : portalParam === 'affiliate'
        ? 'affiliate'
        : portalParam === 'ops'
          ? 'ops'
          : 'carrier';
  const [selectedPortal, setSelectedPortal] = useState<PortalRole>(initialPortal);
  const returnToParam = searchParams.get('returnTo');
  const returnTo = returnToParam && returnToParam.startsWith('/') ? returnToParam : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleMeta: Record<PortalRole, { label: string; subtitle: string; registerHref?: string }> = {
    carrier: {
      label: 'Carrier',
      subtitle: 'Upload manifests and manage parcel status changes.',
      registerHref: '/register',
    },
    customer: {
      label: 'Customer',
      subtitle: 'Track parcels and collect using QR verification.',
      registerHref: '/register?role=customer',
    },
    affiliate: {
      label: 'Affiliate',
      subtitle: 'Run pickup handover and parcel intake at local hubs.',
      registerHref: '/register?role=affiliate',
    },
    ops: {
      label: 'Ops',
      subtitle: 'View operations pipeline and platform-level monitoring.',
    },
  };

  const demoCred = DEMO_PORTAL_TEST_ACCOUNTS[selectedPortal];
  const demoRoleLabel = roleMeta[selectedPortal].label;

  function userDashboardByRole(role: PortalRole): string {
    return role === 'customer'
      ? '/customer/dashboard'
      : role === 'affiliate'
        ? '/affiliate/dashboard'
        : role === 'ops'
          ? '/ops/dashboard'
          : '/carrier/dashboard';
  }

  function selectPortal(portal: PortalRole): void {
    if (portal === selectedPortal) return;
    setSelectedPortal(portal);
    setEmail('');
    setPassword('');
    setError(null);
  }

  function fillDemoRow(emailValue: string, passwordValue: string): void {
    setEmail(emailValue);
    setPassword(passwordValue);
  }

  /** Async body only — `preventDefault` must run synchronously on submit so Playwright/dev never falls through to a native GET (credentials in query string). */
  async function submitSignIn() {
    setError(null);
    setPending(true);
    try {
      const { user } = await login({ email: email.trim(), password });
      const destination = returnTo ?? userDashboardByRole(user.role);
      router.push(destination);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Login failed';
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
      <nav aria-label="Login secondary navigation" className="-mb-2">
        <Link href="/" className="text-sm font-medium text-brand-700 hover:text-brand-800">
          Back to home
        </Link>
      </nav>
      <DsPageHeader title="Login" description={roleMeta[selectedPortal].subtitle} />
      <div className="grid gap-2 rounded-nd border border-neutral-200 bg-surface-card p-2 sm:grid-cols-4">
        {(['carrier', 'customer', 'affiliate', 'ops'] as const).map((portal) => (
          <button
            key={portal}
            type="button"
            onClick={() => selectPortal(portal)}
            className={`min-h-[40px] rounded-md px-3 text-sm font-medium transition-colors ${
              selectedPortal === portal
                ? 'bg-brand-700 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {roleMeta[portal].label}
          </button>
        ))}
      </div>
      <form
        method="post"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submitSignIn();
        }}
      >
        <div>
          <label htmlFor="email" className="nd-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="nd-input text-base sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="nd-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="nd-input text-base sm:text-sm"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <DsButton type="submit" disabled={pending} className="touch-manipulation">
          {pending ? 'Logging in...' : 'Login'}
        </DsButton>
      </form>
      {selectedPortal === 'ops' ? (
        <p className="text-sm text-neutral-600">Ops accounts are provisioned by your administrator.</p>
      ) : (
        <p className="text-sm text-neutral-600">
          Need an account?{' '}
          <Link
            href={roleMeta[selectedPortal].registerHref ?? '/register'}
            className="font-medium text-brand-700 hover:text-brand-800"
          >
            {selectedPortal === 'customer'
              ? 'Register as customer'
              : selectedPortal === 'affiliate'
                ? 'Register as affiliate'
                : 'Register as carrier'}
          </Link>
        </p>
      )}
      <details className="group rounded-nd border border-neutral-200 bg-surface-card shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-neutral-800 marker:content-none">
          <span className="text-left leading-snug">
            Demo seeded login
            <span className="block text-xs font-normal text-neutral-500 sm:inline sm:before:content-['\00a0']">
              ({demoRoleLabel})
            </span>
          </span>
          <span
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-transform group-open:rotate-45"
            aria-hidden
          >
            +
          </span>
        </summary>
        <div className="border-t border-neutral-100 px-4 py-3 sm:py-4">
          <p className="text-xs text-neutral-500">
            Run <code className="text-neutral-700">npm run seed:demo-portals</code> (or full{' '}
            <code className="text-neutral-700">npm run seed:demo</code>) in the backend after migrate.
            Re-seeding resets these portal passwords and revives deactivated demo users.
          </p>
          <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
            <p className="font-semibold text-neutral-900">{demoRoleLabel}</p>
            <p className="mt-1 text-neutral-700">
              <span className="font-medium">Email:</span> <code>{demoCred.email}</code>
            </p>
            <p className="text-neutral-700">
              <span className="font-medium">Password:</span> <code>{demoCred.password}</code>
            </p>
            <button
              type="button"
              onClick={() => fillDemoRow(demoCred.email, demoCred.password)}
              aria-label={`Fill ${demoRoleLabel} demo credentials`}
              className="mt-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50"
            >
              Fill
            </button>
          </div>
        </div>
      </details>
    </main>
  );
}
