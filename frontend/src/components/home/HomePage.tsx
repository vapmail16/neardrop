/** Landing content for `/` — kept in a tested module so the root route cannot silently empty. */
import { DsCard } from '@/components/ds/DsCard';
import { dsButtonClassName } from '@/components/ds/button-variants';

function IconCube({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 4 8 14v20l16 10 16-10V14L24 4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M8 14 24 24l16-10M24 24v20" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconTruck({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 18V6H3v12h2.5M14 18h-2M14 18h5l2.5-3V9h-3M19 18v3M5 18v3M8 21h2M17 21h2"
      />
    </svg>
  );
}

function IconBag({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 9V7a4 4 0 0 1 8 0v2M5 9h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9Z"
      />
    </svg>
  );
}

function IconStore({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10V20h16V10M4 10 2 6h20l-2 4M9 14h6M9 18h6"
      />
    </svg>
  );
}

function IconUpload({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16"
      />
    </svg>
  );
}

function IconQr({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth="1.75"
        strokeLinecap="round"
        d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 10h2m2 0h2m-4-4h4m-4 4v-4m4 8v-4m-4 4h4"
      />
    </svg>
  );
}

export function HomePage() {
  const roleCards = [
    {
      role: 'Carrier',
      subtitle:
        'Upload manifests, manage parcel status, and coordinate deliveries to local pickup points.',
      registerHref: '/register',
      loginHref: '/login',
      Icon: IconTruck,
    },
    {
      role: 'Customer',
      subtitle:
        'Track your parcels, view your collection QR code, and find your nearest pickup location.',
      registerHref: '/customer/register',
      loginHref: '/login?portal=customer',
      Icon: IconBag,
    },
    {
      role: 'Affiliate',
      subtitle:
        'Receive parcels at your location and complete handover to customers with QR verification.',
      registerHref: '/affiliate/register',
      loginHref: '/login?portal=affiliate',
      Icon: IconStore,
    },
  ] as const;

  const howSteps = [
    {
      title: 'Carrier sends',
      body: 'The carrier uploads a manifest and delivers parcels to a local affiliate.',
      Icon: IconUpload,
    },
    {
      title: 'Affiliate receives',
      body: 'The pickup point confirms receipt and the parcel is ready for collection.',
      Icon: IconCube,
    },
    {
      title: 'Customer collects',
      body: 'The customer visits the affiliate, scans their QR code, and picks up the parcel.',
      Icon: IconQr,
    },
  ] as const;

  return (
    <main data-testid="home-root" className="flex min-h-screen flex-col bg-white">
      <header className="bg-neutral-900 px-4 py-14 text-center sm:py-20">
        <div className="mx-auto flex max-w-content flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-brand-400">
            <IconCube className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">NearDrop</h1>
          </div>
          <p className="text-sm font-medium text-brand-200 sm:text-base">
            Neighbourhood last-mile delivery
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            Coordinating carriers, customers, and local pickup partners for seamless parcel handover —
            all in one system.
          </p>
        </div>
      </header>

      <section
        className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16"
        aria-label="Role selection menu"
      >
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Choose your role
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600 sm:text-base">
            NearDrop connects three sides of every delivery. Pick your role to get started.
          </p>
        </div>
        <ul className="grid gap-6 lg:grid-cols-3">
          {roleCards.map((card) => {
            const RIcon = card.Icon;
            return (
              <li key={card.role}>
                <DsCard className="flex h-full flex-col" padding="lg">
                  <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-700">
                    <RIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">{card.role}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{card.subtitle}</p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <a
                      href={card.loginHref}
                      aria-label={`Sign in as ${card.role.toLowerCase()}`}
                      className={`${dsButtonClassName('primary')} w-full justify-center sm:w-auto`}
                    >
                      Sign in
                    </a>
                    <a
                      href={card.registerHref}
                      aria-label={`Register as ${card.role.toLowerCase()}`}
                      className={`${dsButtonClassName('secondary')} w-full justify-center sm:w-auto`}
                    >
                      Register
                    </a>
                  </div>
                </DsCard>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className="border-t border-neutral-200/80 bg-surface-page px-4 py-12 sm:px-6 sm:py-16"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-content">
          <h2
            id="how-it-works-heading"
            className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
          >
            How it works
          </h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {howSteps.map((step, i) => {
              const HIcon = step.Icon;
              return (
                <li key={step.title} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <HIcon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-neutral-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <footer className="mt-auto border-t border-neutral-200/80 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-content flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-brand-800">
            <IconCube className="h-8 w-8 text-brand-600" />
            <span className="text-base font-semibold tracking-tight">NearDrop</span>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <a
              href="/login?portal=ops"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Operations sign in
            </a>
            <p className="text-xs text-neutral-500">© 2026 NearDrop</p>
          </div>
        </div>
        <nav
          className="mx-auto mt-6 max-w-content border-t border-neutral-100 pt-6"
          aria-label="Quick dashboard links"
        >
          <p className="mb-2 text-xs font-medium text-neutral-500">Quick links</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-600">
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
        </nav>
      </footer>
    </main>
  );
}
