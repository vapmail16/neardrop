'use client';

import { EarningsSummary } from '@/components/affiliate/EarningsSummary';
import { useAffiliateEarnings } from '@/lib/hooks/useAffiliateEarnings';

export function AffiliateEarningsClient() {
  const { data, loading, error } = useAffiliateEarnings();

  if (loading) {
    return <p className="text-sm text-neutral-600">Loading…</p>;
  }
  if (error) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
        {error}
      </p>
    );
  }
  if (!data) {
    return null;
  }
  return <EarningsSummary data={data} />;
}
