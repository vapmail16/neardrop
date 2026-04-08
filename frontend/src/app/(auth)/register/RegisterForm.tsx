'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DsButton } from '@/components/ds/DsButton';
import { DsPageHeader } from '@/components/ds/DsPageHeader';
import { dsButtonClassName } from '@/components/ds/button-variants';
import { registerAccount } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

type RegisterRole = 'carrier' | 'customer' | 'affiliate' | 'ops';

const ROLE_LABELS: Record<RegisterRole, string> = {
  carrier: 'Carrier',
  customer: 'Customer',
  affiliate: 'Affiliate',
  ops: 'Ops',
};

function parseRole(value: string | null): RegisterRole {
  if (value === 'customer' || value === 'affiliate' || value === 'ops' || value === 'carrier') {
    return value;
  }
  return 'carrier';
}

function dashboardForRole(role: RegisterRole): string {
  if (role === 'customer') return '/customer/dashboard';
  if (role === 'affiliate') return '/affiliate/dashboard';
  if (role === 'ops') return '/ops/dashboard';
  return '/carrier/dashboard';
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = parseRole(searchParams.get('role'));
  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [maxDailyCapacity, setMaxDailyCapacity] = useState('20');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const basePayload = {
        email,
        password,
        firstName,
        lastName,
        role,
      } as const;

      if (role === 'affiliate') {
        const cap = Number.parseInt(maxDailyCapacity, 10);
        await registerAccount({
          ...basePayload,
          postcode,
          addressLine1,
          maxDailyCapacity: Number.isFinite(cap) ? cap : 20,
        });
      } else if (role === 'customer') {
        await registerAccount({
          ...basePayload,
          postcode,
        });
      } else {
        await registerAccount({
          ...basePayload,
          postcode: null,
        });
      }
      router.push(dashboardForRole(role));
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Registration failed';
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-8 sm:px-6">
      <nav aria-label="Registration secondary navigation" className="-mb-2">
        <Link href="/" className="text-sm font-medium text-brand-700 hover:text-brand-800">
          Back to home
        </Link>
      </nav>
      <DsPageHeader
        title="Create account"
        description="Select your role first. Fields that do not apply to that role are kept disabled."
      />
      <section aria-label="Registration role selector" className="rounded-nd border border-neutral-200 bg-surface-card p-3">
        <p className="mb-2 text-sm font-medium text-neutral-700">Register as</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(['carrier', 'customer', 'affiliate', 'ops'] as const).map((value) => {
            const active = role === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setRole(value)}
                className={
                  active
                    ? dsButtonClassName('primary')
                    : `${dsButtonClassName('secondary')} !min-h-[40px] !py-2`
                }
              >
                {ROLE_LABELS[value]}
              </button>
            );
          })}
        </div>
      </section>
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="nd-label">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="nd-input"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="nd-label">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="nd-input"
            />
          </div>
        </div>
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
            className="nd-input"
          />
        </div>
        <div>
          <label htmlFor="postcode" className="nd-label">
            UK postcode
          </label>
          <input
            id="postcode"
            name="postcode"
            autoComplete="postal-code"
            required={role === 'customer' || role === 'affiliate'}
            disabled={role !== 'customer' && role !== 'affiliate'}
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="nd-input disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
          />
        </div>
        <div>
          <label htmlFor="addressLine1" className="nd-label">
            Pickup address (line 1)
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            required={role === 'affiliate'}
            disabled={role !== 'affiliate'}
            minLength={3}
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            className="nd-input disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
          />
        </div>
        <div>
          <label htmlFor="maxDailyCapacity" className="nd-label">
            Max parcels per day
          </label>
          <input
            id="maxDailyCapacity"
            name="maxDailyCapacity"
            type="number"
            min={1}
            max={500}
            required={role === 'affiliate'}
            disabled={role !== 'affiliate'}
            value={maxDailyCapacity}
            onChange={(e) => setMaxDailyCapacity(e.target.value)}
            className="nd-input disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="nd-input"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <DsButton type="submit" disabled={pending}>
          {pending ? 'Creating account...' : 'Register'}
        </DsButton>
      </form>
      <p className="text-sm text-neutral-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
          Login
        </Link>
      </p>
    </main>
  );
}
