'use client';

import type { AffiliateEarningsSummaryPublic } from '@neardrop/shared';
import { useCallback, useEffect, useState } from 'react';
import { getAffiliateEarnings } from '@/lib/api/affiliate';
import { ApiRequestError } from '@/lib/api/client';

export type UseAffiliateEarningsState = {
  data: AffiliateEarningsSummaryPublic | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useAffiliateEarnings(): UseAffiliateEarningsState {
  const [data, setData] = useState<AffiliateEarningsSummaryPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAffiliateEarnings();
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
