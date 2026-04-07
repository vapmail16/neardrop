'use client';

import type { ParcelListQuery, ParcelPublic } from '@neardrop/shared';
import { useCallback, useEffect, useState } from 'react';
import { listParcels, type ParcelListResult } from '@/lib/api/parcels';
import { ApiRequestError } from '@/lib/api/client';

export type UseParcelsState = {
  data: ParcelListResult | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useParcels(query: ParcelListQuery): UseParcelsState {
  const [data, setData] = useState<ParcelListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listParcels(query);
      setData(result);
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Load failed';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query.page, query.limit, query.status]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function sortParcelsByUpdatedDesc(items: ParcelPublic[]): ParcelPublic[] {
  return [...items].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}
