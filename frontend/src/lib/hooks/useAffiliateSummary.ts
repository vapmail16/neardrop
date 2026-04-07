'use client';

import type { AffiliateSummaryPublic } from '@neardrop/shared';
import { useCallback, useEffect, useState } from 'react';
import { getAffiliateSummary } from '@/lib/api/affiliates';
import { ApiRequestError } from '@/lib/api/client';

export type UseAffiliateSummaryState = {
  affiliate: AffiliateSummaryPublic | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useAffiliateSummary(affiliateId: string | null): UseAffiliateSummaryState {
  const [affiliate, setAffiliate] = useState<AffiliateSummaryPublic | null>(null);
  const [loading, setLoading] = useState(!!affiliateId);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!affiliateId) {
      setAffiliate(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const a = await getAffiliateSummary(affiliateId);
      setAffiliate(a);
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Load failed';
      setError(msg);
      setAffiliate(null);
    } finally {
      setLoading(false);
    }
  }, [affiliateId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { affiliate, loading, error, refetch };
}
