import type { ReactNode } from 'react';
import { ndAppShellMain, ndAppShellRoot } from '@/components/ds/layout-classes';
import { OpsNav } from '@/components/ops/OpsNav';
import { requireOpsSession } from '@/lib/server-auth';

export default async function OpsProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireOpsSession();
  return (
    <div className={ndAppShellRoot}>
      <OpsNav user={user} />
      <div className={ndAppShellMain}>{children}</div>
    </div>
  );
}
