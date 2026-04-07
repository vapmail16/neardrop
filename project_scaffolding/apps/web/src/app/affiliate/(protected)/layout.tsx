import type { ReactNode } from 'react';
import { AffiliateNav } from '@/components/affiliate/AffiliateNav';
import { requireAffiliateSession } from '@/lib/server-auth';

export default async function AffiliateProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireAffiliateSession();
  return (
    <div className="min-h-screen bg-neutral-50">
      <AffiliateNav user={user} />
      <div className="mx-auto max-w-6xl p-4 sm:p-6">{children}</div>
    </div>
  );
}
