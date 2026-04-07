import type { ReactNode } from 'react';
import { OpsNav } from '@/components/ops/OpsNav';
import { requireOpsSession } from '@/lib/server-auth';

export default async function OpsProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireOpsSession();
  return (
    <div className="min-h-screen bg-neutral-50">
      <OpsNav user={user} />
      <div className="mx-auto max-w-6xl p-4 sm:p-6">{children}</div>
    </div>
  );
}
