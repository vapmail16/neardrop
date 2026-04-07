'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DsButton } from '@/components/ds/DsButton';
import { DsPageHeader } from '@/components/ds/DsPageHeader';
import { login } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portalParam = searchParams.get('portal');
  const portal =
    portalParam === 'customer'
      ? 'customer'
      : portalParam === 'affiliate'
        ? 'affiliate'
        : portalParam === 'ops'
          ? 'ops'
          : 'carrier';
  const defaultHome =
    portal === 'customer'
      ? '/customer/dashboard'
      : portal === 'affiliate'
        ? '/affiliate/dashboard'
        : portal === 'ops'
          ? '/ops/dashboard'
          : '/carrier/dashboard';
  const returnToParam = searchParams.get('returnTo');
  const returnTo =
    returnToParam && returnToParam.startsWith('/') ? returnToParam : defaultHome;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Async body only — `preventDefault` must run synchronously on submit so Playwright/dev never falls through to a native GET (credentials in query string). */
  async function submitSignIn() {
    setError(null);
    setPending(true);
    try {
      const { user } = await login({ email, password });
      if (portal === 'carrier' && user.role !== 'carrier') {
        setError('This portal is for carrier accounts only.');
        return;
      }
      if (portal === 'customer' && user.role !== 'customer') {
        setError('This portal is for customer accounts only.');
        return;
      }
      if (portal === 'affiliate' && user.role !== 'affiliate') {
        setError('This portal is for affiliate accounts only.');
        return;
      }
      if (portal === 'ops' && user.role !== 'ops') {
        setError('This portal is for operations accounts only.');
        return;
      }
      router.push(returnTo.startsWith('/') ? returnTo : defaultHome);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Sign in failed';
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  const subtitle =
    portal === 'customer'
      ? 'Customer parcel tracking'
      : portal === 'affiliate'
        ? 'Affiliate pickup point'
        : portal === 'ops'
          ? 'Operations console'
          : 'Carrier portal access';
  const registerHref =
    portal === 'customer'
      ? '/customer/register'
      : portal === 'affiliate'
        ? '/affiliate/register'
        : '/register';
  const registerLabel =
    portal === 'customer'
      ? 'Register as customer'
      : portal === 'affiliate'
        ? 'Register as affiliate'
        : 'Register as carrier';

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-8 sm:px-6">
      <DsPageHeader title="Sign in" description={subtitle} />
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
          {pending ? 'Signing in...' : 'Sign in'}
        </DsButton>
      </form>
      {portal === 'ops' ? (
        <p className="text-sm text-neutral-600">
          Ops accounts are provisioned by your administrator.{' '}
          <Link href="/" className="font-medium text-brand-700 hover:text-brand-800">
            Back to home
          </Link>
        </p>
      ) : (
        <p className="text-sm text-neutral-600">
          Need an account?{' '}
          <Link href={registerHref} className="font-medium text-brand-700 hover:text-brand-800">
            {registerLabel}
          </Link>
        </p>
      )}
    </main>
  );
}
