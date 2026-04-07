'use client';

import type { ParcelPublic } from '@neardrop/shared';
import { useCallback, useEffect, useState } from 'react';
import { getParcel } from '@/lib/api/parcels';
import { ApiRequestError } from '@/lib/api/client';

export type UseParcelState = {
  parcel: ParcelPublic | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useParcel(parcelId: string): UseParcelState {
  const [parcel, setParcel] = useState<ParcelPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await getParcel(parcelId);
      setParcel(p);
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Load failed';
      setError(msg);
      setParcel(null);
    } finally {
      setLoading(false);
    }
  }, [parcelId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { parcel, loading, error, refetch };
}
