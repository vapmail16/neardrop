'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerAccount } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

export function AffiliateRegisterForm() {
  const router = useRouter();
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
      const cap = Number.parseInt(maxDailyCapacity, 10);
      await registerAccount({
        email,
        password,
        firstName,
        lastName,
        role: 'affiliate',
        postcode,
        addressLine1,
        maxDailyCapacity: Number.isFinite(cap) ? cap : 20,
      });
      router.push('/affiliate/dashboard');
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
    <main className="mx-auto flex max-w-md flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Create affiliate account</h1>
        <p className="mt-1 text-sm text-neutral-600">
          UK postcode, pickup address, and daily capacity for your hub.
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Password: 12-128 characters with upper, lower, number, and special character.
        </p>
      </div>
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-neutral-700">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-neutral-700">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
        </div>
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
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <div>
          <label htmlFor="postcode" className="mb-1 block text-sm font-medium text-neutral-700">
            UK postcode (hub)
          </label>
          <input
            id="postcode"
            name="postcode"
            autoComplete="postal-code"
            required
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="min-h-11 w-full rounded-md border border-neutral-300 px-3 py-2 text-base shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="addressLine1" className="mb-1 block text-sm font-medium text-neutral-700">
            Pickup address (line 1)
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            required
            minLength={3}
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            className="min-h-11 w-full rounded-md border border-neutral-300 px-3 py-2 text-base shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="maxDailyCapacity" className="mb-1 block text-sm font-medium text-neutral-700">
            Max parcels per day
          </label>
          <input
            id="maxDailyCapacity"
            name="maxDailyCapacity"
            type="number"
            min={1}
            max={500}
            required
            value={maxDailyCapacity}
            onChange={(e) => setMaxDailyCapacity(e.target.value)}
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
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
          {pending ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-neutral-600">
        Already have an account?{' '}
        <Link href="/login?portal=affiliate" className="font-medium text-neutral-900 underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
