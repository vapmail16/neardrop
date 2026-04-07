import type { UserPublic, UserRole } from '@neardrop/shared';

export type FetchMeUserResult =
  | { ok: true; user: UserPublic }
  | { ok: false; kind: 'unauthorized' | 'invalid_response' | 'wrong_role' };

export async function fetchMeUserFromApi(
  apiOrigin: string,
  cookieHeader: string,
  expectedRole: UserRole,
): Promise<FetchMeUserResult> {
  const trimmed = cookieHeader.trim();
  if (!trimmed) {
    return { ok: false, kind: 'unauthorized' };
  }

  const base = apiOrigin.replace(/\/$/, '');
  const res = await fetch(`${base}/api/v1/auth/me`, {
    headers: { cookie: trimmed },
    cache: 'no-store',
  });

  if (!res.ok) {
    return { ok: false, kind: 'unauthorized' };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { ok: false, kind: 'invalid_response' };
  }

  const parsed = body as { success?: boolean; data?: { user?: UserPublic } };
  if (!parsed.success || !parsed.data?.user) {
    return { ok: false, kind: 'invalid_response' };
  }

  if (parsed.data.user.role !== expectedRole) {
    return { ok: false, kind: 'wrong_role' };
  }

  return { ok: true, user: parsed.data.user };
}
