import type { UserPublic } from '@neardrop/shared';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchMeUserFromApi } from './server/fetch-me-user';
import { getInternalApiOrigin } from './server-api';

function carrierLoginRedirect(): never {
  const pathname = headers().get('x-nd-pathname') ?? '/carrier/dashboard';
  redirect(`/login?returnTo=${encodeURIComponent(pathname)}`);
}

function customerLoginRedirect(): never {
  const pathname = headers().get('x-nd-pathname') ?? '/customer/dashboard';
  redirect(
    `/login?portal=customer&returnTo=${encodeURIComponent(pathname)}`,
  );
}

function affiliateLoginRedirect(): never {
  const pathname = headers().get('x-nd-pathname') ?? '/affiliate/dashboard';
  redirect(
    `/login?portal=affiliate&returnTo=${encodeURIComponent(pathname)}`,
  );
}

function opsLoginRedirect(): never {
  const pathname = headers().get('x-nd-pathname') ?? '/ops/dashboard';
  redirect(`/login?portal=ops&returnTo=${encodeURIComponent(pathname)}`);
}

export async function requireCarrierSession(): Promise<UserPublic> {
  const jar = cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const result = await fetchMeUserFromApi(getInternalApiOrigin(), cookieHeader, 'carrier');

  if (result.ok) {
    return result.user;
  }
  if (result.kind === 'wrong_role') {
    redirect('/');
  }
  carrierLoginRedirect();
}

export async function requireCustomerSession(): Promise<UserPublic> {
  const jar = cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const result = await fetchMeUserFromApi(getInternalApiOrigin(), cookieHeader, 'customer');

  if (result.ok) {
    return result.user;
  }
  if (result.kind === 'wrong_role') {
    redirect('/');
  }
  customerLoginRedirect();
}

export async function requireAffiliateSession(): Promise<UserPublic> {
  const jar = cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const result = await fetchMeUserFromApi(getInternalApiOrigin(), cookieHeader, 'affiliate');

  if (result.ok) {
    return result.user;
  }
  if (result.kind === 'wrong_role') {
    redirect('/');
  }
  affiliateLoginRedirect();
}

export async function requireOpsSession(): Promise<UserPublic> {
  const jar = cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const result = await fetchMeUserFromApi(getInternalApiOrigin(), cookieHeader, 'ops');

  if (result.ok) {
    return result.user;
  }
  if (result.kind === 'wrong_role') {
    redirect('/');
  }
  opsLoginRedirect();
}
