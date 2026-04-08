'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DsButton } from '@/components/ds/DsButton';
import { DsPageHeader } from '@/components/ds/DsPageHeader';
import { registerAccount } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

export function CustomerRegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await registerAccount({
        email,
        password,
        firstName,
        lastName,
        role: 'customer',
        postcode,
      });
      router.push('/customer/dashboard');
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
      <DsPageHeader
        title="Create customer account"
        description="Use your UK postcode — we'll match a nearby pickup point when parcels arrive. Password: 12–128 characters with upper, lower, number, and special character."
      />
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
            required
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="nd-input"
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
