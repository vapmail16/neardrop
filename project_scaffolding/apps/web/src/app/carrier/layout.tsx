import type { ReactNode } from 'react';
import { CarrierNav } from '@/components/carrier/CarrierNav';
import { requireCarrierSession } from '@/lib/server-auth';

export default async function CarrierLayout({ children }: { children: ReactNode }) {
  const user = await requireCarrierSession();
  return (
    <div className="min-h-screen bg-neutral-50">
      <CarrierNav user={user} />
      <div className="mx-auto max-w-6xl p-6">{children}</div>
    </div>
  );
}
