'use client';

import type { ParcelListQuery } from '@neardrop/shared';
import { useEffect } from 'react';
import { useParcels, type UseParcelsState } from '@/lib/hooks/useParcels';

/** Customer parcel list with 30s polling (MVP “near real-time” per plan). */
export function useCustomerParcels(query: ParcelListQuery): UseParcelsState {
  const state = useParcels(query);
  const { refetch } = state;

  useEffect(() => {
    const id = window.setInterval(() => void refetch(), 30_000);
    return () => clearInterval(id);
  }, [refetch]);

  return state;
}
