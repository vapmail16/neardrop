import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError, apiFetchJson } from './client';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('apiFetchJson', () => {
  it('returns parsed data when response is ok and success true', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { n: 42 } }),
      }),
    );
    await expect(apiFetchJson<{ n: number }>('/api/v1/x')).resolves.toEqual({ n: 42 });
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/x',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('throws ApiRequestError when success false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Bad' },
        }),
      }),
    );
    await expect(apiFetchJson('/api/v1/x')).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('throws when HTTP not ok and body is not ApiFailure shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server error',
        json: async () => ({}),
      }),
    );
    await expect(apiFetchJson('/api/v1/x')).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('sets Content-Type for string body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      }),
    );
    await apiFetchJson('/api/v1/x', { method: 'POST', body: '{}' });
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/x',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });
});
