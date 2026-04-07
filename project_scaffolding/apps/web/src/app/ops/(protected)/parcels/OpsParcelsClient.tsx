'use client';

import { useMemo } from 'react';
import { OpsParcelPipeline } from '@/components/ops/OpsParcelPipeline';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { useOpsAffiliateMapPins } from '@/lib/hooks/useOpsAffiliateMapPins';
import { useParcels } from '@/lib/hooks/useParcels';

export function OpsParcelsClient() {
  const parcels = useParcels({ page: 1, limit: 100 });
  const mapPins = useOpsAffiliateMapPins();

  const loading = parcels.loading || mapPins.loading;
  const error = parcels.error ?? mapPins.error;

  const items = useMemo(() => parcels.data?.items ?? [], [parcels.data?.items]);

  if (loading) {
    return (
      <PageSkeleton
        title="Parcel pipeline"
        subtitle="All parcels. Assign or reassign affiliate hubs manually."
      />
    );
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
        <h1 className="text-2xl font-semibold text-neutral-900">Parcel pipeline</h1>
        <p className="mt-1 text-sm text-neutral-600">
          All parcels. Assign or reassign affiliate hubs manually.
        </p>
      </div>
      <OpsParcelPipeline
        parcels={items}
        affiliatePins={mapPins.items}
        onUpdated={() => void parcels.refetch()}
      />
    </div>
  );
}
