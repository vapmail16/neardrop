import type { ReactNode } from 'react';
import { AffiliateNav } from '@/components/affiliate/AffiliateNav';
import { ndAppShellMain, ndAppShellRoot } from '@/components/ds/layout-classes';
import { requireAffiliateSession } from '@/lib/server-auth';

export default async function AffiliateProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireAffiliateSession();
  return (
    <div className={ndAppShellRoot}>
      <AffiliateNav user={user} />
      <div className={ndAppShellMain}>{children}</div>
    </div>
  );
}
