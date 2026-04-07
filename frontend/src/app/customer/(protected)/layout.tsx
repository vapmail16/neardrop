import type { ReactNode } from 'react';
import { CustomerNav } from '@/components/customer/CustomerNav';
import { ndAppShellMain, ndAppShellRoot } from '@/components/ds/layout-classes';
import { requireCustomerSession } from '@/lib/server-auth';

export default async function CustomerProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireCustomerSession();
  return (
    <div className={ndAppShellRoot}>
      <CustomerNav user={user} />
      <div className={ndAppShellMain}>{children}</div>
    </div>
  );
}
