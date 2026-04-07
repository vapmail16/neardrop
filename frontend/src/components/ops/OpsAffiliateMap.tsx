'use client';

import type { OpsAffiliateMapPinPublic } from '@neardrop/shared';

function pinStatusClass(status: string): string {
  if (status === 'verified') return 'bg-emerald-100 text-emerald-900';
  if (status === 'pending') return 'bg-amber-100 text-amber-900';
  if (status === 'rejected' || status === 'suspended') return 'bg-red-100 text-red-900';
  return 'bg-neutral-100 text-neutral-800';
}

function osmSearchUrl(postcode: string, name: string): string {
  const q = `${name}, ${postcode}`;
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`;
}

/** Ops view: all hubs with verification colour; OSM deep links (no API key). */
export function OpsAffiliateMap({ items }: { items: OpsAffiliateMapPinPublic[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
        No affiliate hubs yet.
      </p>
    );
  }

  return (
    <div className="space-y-3" data-testid="ops-affiliate-map">
      <h2 className="text-lg font-semibold text-neutral-900">Affiliate hubs</h2>
      <ul className="space-y-2">
        {items.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            data-testid={`ops-map-pin-${p.id}`}
          >
            <div>
              <p className="font-medium text-neutral-900">{p.displayName}</p>
              <p className="text-sm text-neutral-600">{p.postcode}</p>
              <p className="text-xs text-neutral-500">
                {p.isAvailable ? 'Available' : 'Unavailable'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${pinStatusClass(p.verificationStatus)}`}
                data-testid={`ops-pin-status-${p.id}`}
              >
                {p.verificationStatus}
              </span>
              <a
                href={osmSearchUrl(p.postcode, p.displayName)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-11 touch-manipulation content-center text-sm font-medium text-neutral-900 underline"
              >
                Open in OSM
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
