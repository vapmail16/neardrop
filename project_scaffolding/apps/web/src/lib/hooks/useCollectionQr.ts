'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCollectionQr, type CollectionQrResponse } from '@/lib/api/parcels';
import { ApiRequestError } from '@/lib/api/client';

export type UseCollectionQrState = {
  data: CollectionQrResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCollectionQr(parcelId: string | null, enabled: boolean): UseCollectionQrState {
  const [data, setData] = useState<CollectionQrResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!parcelId || !enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await getCollectionQr(parcelId);
      setData(r);
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Load failed';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [parcelId, enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
