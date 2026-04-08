import type { UserPublic, UserRole } from '@neardrop/shared';

export type FetchMeUserResult =
  | { ok: true; user: UserPublic }
  | { ok: false; kind: 'unauthorized' | 'invalid_response' | 'wrong_role' };

function roleMatches(userRole: UserRole, allowed: UserRole | readonly UserRole[]): boolean {
  const list = Array.isArray(allowed) ? allowed : [allowed];
  return list.includes(userRole);
}

export async function fetchMeUserFromApi(
  apiOrigin: string,
  cookieHeader: string,
  allowedRoles: UserRole | readonly UserRole[],
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

  if (!roleMatches(parsed.data.user.role, allowedRoles)) {
    return { ok: false, kind: 'wrong_role' };
  }

  return { ok: true, user: parsed.data.user };
}
