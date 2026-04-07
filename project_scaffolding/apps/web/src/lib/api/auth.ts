import type { LoginRequest, RegisterRequest, UserPublic } from '@neardrop/shared';
import { apiFetchJson } from './client';

export async function login(body: LoginRequest): Promise<{ user: UserPublic }> {
  return apiFetchJson<{ user: UserPublic }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function registerAccount(body: RegisterRequest): Promise<{ user: UserPublic }> {
  return apiFetchJson<{ user: UserPublic }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function logout(): Promise<void> {
  await apiFetchJson<Record<string, never>>('/api/v1/auth/logout', {
    method: 'POST',
    body: '{}',
  });
}

export async function fetchMe(): Promise<{ user: UserPublic }> {
  return apiFetchJson<{ user: UserPublic }>('/api/v1/auth/me');
}
