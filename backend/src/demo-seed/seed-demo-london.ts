import { pickLondonDemoPostcode } from '@neardrop/shared';
import type { Knex } from 'knex';
import type { Env } from '../config/schema.js';
import { ParcelService } from '../services/parcel.service.js';
import { createUserService } from '../services/user.service.factory.js';

/** Shared demo password for internal-only seed users (ops + second hub). */
export const DEMO_LONDON_SEED_PASSWORD = 'Demo8London!Seedxx';

/**
 * Fixed portal test logins (grant/demo handoff). Passwords meet shared auth policy.
 * Carrier / customer / affiliate use these; ops + second affiliate use {@link DEMO_LONDON_SEED_PASSWORD}.
 */
export const DEMO_PORTAL_TEST_ACCOUNTS = {
  carrier: { email: 'testmail1@example.com', password: 'ZRqA8b_G!v7mt9A' },
  customer: { email: 'testmail2@example.com', password: '8-HKCskEfUQqy$P' },
  affiliate: { email: 'testmail3@example.com', password: '7CD5*fSD6PiKw!M' },
} as const;

export type DemoLondonSeedSummary = {
  tag: string;
  parcelCount: number;
  manifest: { total: number; matchedAffiliate: number; unmatched: number };
  emails: {
    ops: string;
    carrier: string;
    affiliateA: string;
    affiliateB: string;
    customer: string;
  };
  parcelIds: string[];
};

export function buildDemoManifestCsv(opts: {
  tag: string;
  parcelCount: number;
  customerEmail: string;
}): string {
  const header = 'carrier_ref,recipient_name,recipient_postcode,recipient_email';
  const lines = [header];
  for (let i = 0; i < opts.parcelCount; i++) {
    const pc = pickLondonDemoPostcode(i);
    lines.push(`DEMO8-${opts.tag}-${i},Recipient ${i},${pc},${opts.customerEmail}`);
  }
  return lines.join('\n');
}

/**
 * Inserts demo users and a multi-row manifest cycling {@link pickLondonDemoPostcode}.
 * Not idempotent: run on a dev database or use a fresh `tag` per run.
 */
export async function seedDemoLondonDataset(
  knex: Knex,
  config: Env,
  options: { tag: string; parcelCount: number },
): Promise<DemoLondonSeedSummary> {
  const { tag, parcelCount } = options;
  if (parcelCount < 1 || parcelCount > 500) {
    throw new Error('parcelCount must be between 1 and 500');
  }

  const userSvc = createUserService(knex, config);
  const parcelSvc = new ParcelService(knex, {});

  const hubA = pickLondonDemoPostcode(0);
  let hubB = pickLondonDemoPostcode(1);
  if (hubB === hubA) {
    hubB = pickLondonDemoPostcode(2);
  }

  const portal = DEMO_PORTAL_TEST_ACCOUNTS;
  const internalPwd = DEMO_LONDON_SEED_PASSWORD;

  const emails = {
    ops: `demo8-ops-${tag}@example.test`,
    carrier: portal.carrier.email,
    affiliateA: portal.affiliate.email,
    affiliateB: `demo8-aff-b-${tag}@example.test`,
    customer: portal.customer.email,
  };

  await userSvc.register({
    email: emails.ops,
    password: internalPwd,
    firstName: 'Demo',
    lastName: 'Ops',
    role: 'ops',
    postcode: null,
  });

  await userSvc.register({
    email: emails.affiliateA,
    password: portal.affiliate.password,
    firstName: 'Demo',
    lastName: 'HubA',
    role: 'affiliate',
    postcode: hubA,
    addressLine1: '88 Demo Collection Street',
    maxDailyCapacity: 40,
  });

  await userSvc.register({
    email: emails.affiliateB,
    password: internalPwd,
    firstName: 'Demo',
    lastName: 'HubB',
    role: 'affiliate',
    postcode: hubB,
    addressLine1: '22 Demo Secondary Hub',
    maxDailyCapacity: 35,
  });

  const carrierReg = await userSvc.register({
    email: emails.carrier,
    password: portal.carrier.password,
    firstName: 'Demo',
    lastName: 'Carrier',
    role: 'carrier',
    postcode: null,
  });

  await userSvc.register({
    email: emails.customer,
    password: portal.customer.password,
    firstName: 'Demo',
    lastName: 'Customer',
    role: 'customer',
    postcode: hubA,
  });

  const carrierUserId = carrierReg.user.id;
  const csv = buildDemoManifestCsv({ tag, parcelCount, customerEmail: emails.customer });
  const manifest = await parcelSvc.uploadManifest(
    carrierUserId,
    { format: 'csv', content: csv },
    carrierUserId,
  );

  return {
    tag,
    parcelCount,
    manifest: {
      total: manifest.total,
      matchedAffiliate: manifest.matchedAffiliate,
      unmatched: manifest.unmatched,
    },
    emails,
    parcelIds: manifest.parcelIds,
  };
}
