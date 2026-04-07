'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
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
    <main className="mx-auto flex max-w-md flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
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
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
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
            className="min-h-11 w-full rounded-md border border-neutral-300 px-3 py-2 text-base shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-700">
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
            className="min-h-11 w-full rounded-md border border-neutral-300 px-3 py-2 text-base shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 sm:text-sm"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 touch-manipulation rounded-md bg-neutral-900 px-4 py-2 text-base font-medium text-white hover:bg-neutral-800 disabled:opacity-50 sm:text-sm"
        >
          {pending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      {portal === 'ops' ? (
        <p className="text-sm text-neutral-600">
          Ops accounts are provisioned by your administrator.{' '}
          <Link href="/" className="font-medium text-neutral-900 underline">
            Back to home
          </Link>
        </p>
      ) : (
        <p className="text-sm text-neutral-600">
          Need an account?{' '}
          <Link href={registerHref} className="font-medium text-neutral-900 underline">
            {registerLabel}
          </Link>
        </p>
      )}
    </main>
  );
}
