import type { ApiFailure, ApiResponse } from '@neardrop/shared';

export class ApiRequestError extends Error {
  readonly status: number;
  readonly body: ApiFailure;

  constructor(status: number, body: ApiFailure) {
    super(body.error.message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }

  get code(): string {
    return this.body.error.code;
  }
}

async function readFailure(res: Response): Promise<ApiFailure> {
  try {
    const j = (await res.json()) as ApiFailure;
    if (j && j.success === false) return j;
  } catch {
    /* ignore */
  }
  return {
    success: false,
    error: { code: 'INTERNAL_ERROR', message: res.statusText || 'Request failed' },
  };
}

export async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const rest = init ?? {};
  const headers: HeadersInit = { ...rest.headers };
  if (rest.body && typeof rest.body === 'string' && !('Content-Type' in headers)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const res = await fetch(path, {
    ...rest,
    credentials: 'include',
    headers,
  });

  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success) {
    const fail = json.success === false ? (json as ApiFailure) : await readFailure(res);
    throw new ApiRequestError(res.ok ? 400 : res.status, fail);
  }
  return json.data;
}
