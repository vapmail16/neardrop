/** Landing content for `/` — kept in a tested module so the root route cannot silently empty. */
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
    <main data-testid="home-root" className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">NearDrop</h1>
        <p className="text-neutral-600">Neighbourhood last-mile delivery prototype</p>
      </header>

      <section className="space-y-4" aria-label="Role selection menu">
        <h2 className="text-center text-lg font-semibold text-neutral-900">Choose your role</h2>
        <ul className="space-y-3">
          {roleCards.map((card) => (
            <li key={card.role} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">{card.role}</h3>
              <p className="mt-1 text-sm text-neutral-600">{card.subtitle}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <a href={card.loginHref} className="rounded-md bg-neutral-900 px-3 py-2 text-white">
                  {`Sign in (${card.role.toLowerCase()})`}
                </a>
                <a href={card.registerHref} className="rounded-md border border-neutral-300 px-3 py-2">
                  {`Register (${card.role.toLowerCase()})`}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 text-sm" aria-label="Operations and quick links">
        <a href="/login?portal=ops" className="text-neutral-900 underline">
          Sign in (ops)
        </a>
        <div className="flex flex-wrap gap-4 text-neutral-600">
          <a href="/carrier/dashboard" className="underline">
            Carrier dashboard
          </a>
          <a href="/customer/dashboard" className="underline">
            Customer dashboard
          </a>
          <a href="/affiliate/dashboard" className="underline">
            Affiliate dashboard
          </a>
          <a href="/ops/dashboard" className="underline">
            Ops dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
