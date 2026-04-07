'use client';

import type { OpsAffiliateMapPinPublic } from '@neardrop/shared';
import { useCallback, useEffect, useState } from 'react';
import { fetchOpsAffiliateMapPins } from '@/lib/api/ops';
import { ApiRequestError } from '@/lib/api/client';

export type UseOpsAffiliateMapPinsState = {
  items: OpsAffiliateMapPinPublic[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useOpsAffiliateMapPins(): UseOpsAffiliateMapPinsState {
  const [items, setItems] = useState<OpsAffiliateMapPinPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchOpsAffiliateMapPins();
      setItems(list);
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Load failed';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, loading, error, refetch };
}
