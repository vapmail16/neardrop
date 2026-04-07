'use client';

import { OpsAffiliateMap } from '@/components/ops/OpsAffiliateMap';
import { useOpsAffiliateMapPins } from '@/lib/hooks/useOpsAffiliateMapPins';

export function OpsMapClient() {
  const { items, loading, error } = useOpsAffiliateMapPins();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Affiliate map</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Hubs with verification status. Open in OpenStreetMap for location context.
        </p>
      </div>
      <OpsAffiliateMap items={items} />
    </div>
  );
}
