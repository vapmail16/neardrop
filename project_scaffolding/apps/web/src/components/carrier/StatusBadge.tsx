import type { ParcelStatus } from '@neardrop/shared';

const styles: Record<ParcelStatus, string> = {
  manifest_received: 'bg-amber-100 text-amber-900',
  in_transit: 'bg-sky-100 text-sky-900',
  dropped_at_affiliate: 'bg-violet-100 text-violet-900',
  ready_to_collect: 'bg-emerald-100 text-emerald-900',
  collected: 'bg-neutral-200 text-neutral-800',
  exception: 'bg-red-100 text-red-900',
};

const labels: Record<ParcelStatus, string> = {
  manifest_received: 'Manifest received',
  in_transit: 'In transit',
  dropped_at_affiliate: 'At affiliate',
  ready_to_collect: 'Ready to collect',
  collected: 'Collected',
  exception: 'Exception',
};

export function StatusBadge({ status }: { status: ParcelStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      data-testid="parcel-status-badge"
      data-status={status}
    >
      {labels[status]}
    </span>
  );
}
