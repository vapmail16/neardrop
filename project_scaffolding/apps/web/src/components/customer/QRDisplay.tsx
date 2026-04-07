'use client';

import QRCode from 'react-qr-code';

/** Collection JWT for affiliate scanner — show at pickup (Phase 3 API contract). */
export function QRDisplay({ token, expiresAt }: { token: string; expiresAt: string }) {
  const exp = new Date(expiresAt);
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm" data-testid="customer-qr-display">
      <p className="text-sm font-medium text-neutral-900">Collection code</p>
      <p className="mt-1 text-xs text-neutral-600">Show this QR at the pickup point. Expires {exp.toLocaleString()}.</p>
      <div className="mt-4 flex justify-center rounded-md bg-white p-4">
        <QRCode value={token} size={200} />
      </div>
    </div>
  );
}
