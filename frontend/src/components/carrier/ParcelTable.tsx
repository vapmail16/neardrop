'use client';

import type { ParcelPublic, ParcelStatus } from '@neardrop/shared';
import { useState } from 'react';
import { carrierActionLabel, carrierAllowedNextStatuses } from '@/lib/carrier-transitions';
import { patchParcelStatus } from '@/lib/api/parcels';
import { ApiRequestError } from '@/lib/api/client';
import { StatusBadge } from './StatusBadge';

export function ParcelTable({
  parcels,
  onUpdated,
}: {
  parcels: ParcelPublic[];
  onUpdated?: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function transition(parcelId: string, status: ParcelStatus) {
    setError(null);
    setBusyId(parcelId);
    try {
      await patchParcelStatus(parcelId, { status });
      onUpdated?.();
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Update failed';
      setError(msg);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">Ref</th>
              <th className="px-4 py-3 font-medium">Recipient</th>
              <th className="px-4 py-3 font-medium">Postcode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {parcels.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No parcels yet. Upload a manifest to create parcels.
                </td>
              </tr>
            ) : (
              parcels.map((p) => {
                const nextStatuses = carrierAllowedNextStatuses(p.status);
                return (
                  <tr key={p.id} data-testid={`parcel-row-${p.id}`}>
                    <td className="px-4 py-3 font-mono text-xs">{p.carrierRef ?? '-'}</td>
                    <td className="px-4 py-3">{p.recipientName}</td>
                    <td className="px-4 py-3">{p.recipientPostcode}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {nextStatuses.map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={busyId === p.id}
                            onClick={() => void transition(p.id, s)}
                            className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
                          >
                            {busyId === p.id ? '...' : carrierActionLabel(s)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
