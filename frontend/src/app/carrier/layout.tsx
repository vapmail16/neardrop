import type { ReactNode } from 'react';
import { CarrierNav } from '@/components/carrier/CarrierNav';
import { ndAppShellMain, ndAppShellRoot } from '@/components/ds/layout-classes';
import { requireCarrierSession } from '@/lib/server-auth';

export default async function CarrierLayout({ children }: { children: ReactNode }) {
  const user = await requireCarrierSession();
  return (
    <div className={ndAppShellRoot}>
      <CarrierNav user={user} />
      <div className={ndAppShellMain}>{children}</div>
    </div>
  );
}
