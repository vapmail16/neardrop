'use client';

import type { OpsStatsPublic } from '@neardrop/shared';
import { useCallback, useEffect, useState } from 'react';
import { fetchOpsStats } from '@/lib/api/ops';
import { ApiRequestError } from '@/lib/api/client';

export type UseOpsStatsState = {
  data: OpsStatsPublic | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useOpsStats(): UseOpsStatsState {
  const [data, setData] = useState<OpsStatsPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchOpsStats();
      setData(result);
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Load failed';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
