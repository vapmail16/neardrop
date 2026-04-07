import type { ReactNode } from 'react';
import { CustomerNav } from '@/components/customer/CustomerNav';
import { requireCustomerSession } from '@/lib/server-auth';

export default async function CustomerProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireCustomerSession();
  return (
    <div className="min-h-screen bg-neutral-50">
      <CustomerNav user={user} />
      <div className="mx-auto max-w-6xl p-6">{children}</div>
    </div>
  );
}
