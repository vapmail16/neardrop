'use client';

import type { OpsStatsPublic } from '@neardrop/shared';

const statusLabel: Record<string, string> = {
  manifest_received: 'Manifest received',
  in_transit: 'In transit',
  dropped_at_affiliate: 'At affiliate',
  ready_to_collect: 'Ready to collect',
  collected: 'Collected',
  exception: 'Exception',
};

export function OpsStatCards({ data }: { data: OpsStatsPublic }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">Total parcels</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900" data-testid="ops-total-parcels">
            {data.totalParcels}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">Affiliate hubs</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900" data-testid="ops-total-affiliates">
            {data.totalAffiliates}
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Parcels by status</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2" data-testid="ops-status-breakdown">
          {data.parcelCountsByStatus.map((row) => (
            <li
              key={row.status}
              className="flex justify-between text-sm text-neutral-700"
              data-testid={`ops-count-${row.status}`}
            >
              <span>{statusLabel[row.status] ?? row.status}</span>
              <span className="font-medium text-neutral-900">{row.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
