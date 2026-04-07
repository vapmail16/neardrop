'use client';

import type { AffiliateSummaryPublic } from '@neardrop/shared';
import { useCallback, useEffect, useState } from 'react';
import { getMatchedAffiliate } from '@/lib/api/affiliates';
import { ApiRequestError } from '@/lib/api/client';

export type UseAffiliateMatchState = {
  affiliate: AffiliateSummaryPublic | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useAffiliateMatch(): UseAffiliateMatchState {
  const [affiliate, setAffiliate] = useState<AffiliateSummaryPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const a = await getMatchedAffiliate();
      setAffiliate(a);
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Load failed';
      setError(msg);
      setAffiliate(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { affiliate, loading, error, refetch };
}
