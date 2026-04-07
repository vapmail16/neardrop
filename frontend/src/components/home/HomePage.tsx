/** Landing content for `/` — kept in a tested module so the root route cannot silently empty. */
import { DsCard } from '@/components/ds/DsCard';
import { dsButtonClassName } from '@/components/ds/button-variants';

export function HomePage() {
  const roleCards = [
    {
      role: 'Carrier',
      subtitle: 'Upload manifests and update parcel delivery status.',
      registerHref: '/register',
      loginHref: '/login',
    },
    {
      role: 'Customer',
      subtitle: 'Track parcels and view your collection QR code.',
      registerHref: '/customer/register',
      loginHref: '/login?portal=customer',
    },
    {
      role: 'Affiliate',
      subtitle: 'Receive parcels and hand over to customers.',
      registerHref: '/affiliate/register',
      loginHref: '/login?portal=affiliate',
    },
  ] as const;

  return (
    <main
      data-testid="home-root"
      className="mx-auto flex w-full max-w-content flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10"
    >
      <header className="space-y-3 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">NearDrop</h1>
        <p className="text-sm font-medium text-brand-700">Neighbourhood last-mile delivery</p>
        <p className="mx-auto max-w-xl text-neutral-600 sm:mx-0">
          Prototype for carriers, customers, and pickup partners — one place to coordinate handover.
        </p>
      </header>

      <section className="space-y-4" aria-label="Role selection menu">
        <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">Choose your role</h2>
        <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
          {roleCards.map((card) => (
            <li key={card.role}>
              <DsCard className="flex h-full flex-col" padding="lg">
                <h3 className="text-lg font-semibold text-neutral-900">{card.role}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{card.subtitle}</p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <a
                    href={card.loginHref}
                    className={`${dsButtonClassName('primary')} w-full justify-center sm:w-auto`}
                  >
                    {`Sign in (${card.role.toLowerCase()})`}
                  </a>
                  <a
                    href={card.registerHref}
                    className={`${dsButtonClassName('secondary')} w-full justify-center sm:w-auto`}
                  >
                    {`Register (${card.role.toLowerCase()})`}
                  </a>
                </div>
              </DsCard>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 border-t border-neutral-200/80 pt-6 text-sm" aria-label="Operations and quick links">
        <a href="/login?portal=ops" className="font-medium text-brand-700 hover:text-brand-800">
          Sign in (ops)
        </a>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-neutral-600">
          <a href="/carrier/dashboard" className="hover:text-neutral-900">
            Carrier dashboard
          </a>
          <a href="/customer/dashboard" className="hover:text-neutral-900">
            Customer dashboard
          </a>
          <a href="/affiliate/dashboard" className="hover:text-neutral-900">
            Affiliate dashboard
          </a>
          <a href="/ops/dashboard" className="hover:text-neutral-900">
            Ops dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
