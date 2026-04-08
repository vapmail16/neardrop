import * as bcrypt from 'bcrypt';
import {
  DEMO_PORTAL_TEST_ACCOUNTS,
  pickLondonDemoPostcode,
  type RegisterRequest,
} from '@neardrop/shared';
import type { Knex } from 'knex';
import type { Env } from '../config/schema.js';
import type { UserRow } from '../repositories/user.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ParcelService } from '../services/parcel.service.js';
import { createUserService } from '../services/user.service.factory.js';

/** Shared demo password for internal-only seed users (second hub affiliate). */
export const DEMO_LONDON_SEED_PASSWORD = 'Demo8London!Seedxx';

/** Re-export for scripts/tests that import portal constants from the seed module. */
export { DEMO_PORTAL_TEST_ACCOUNTS };

export type DemoPortalEmails = {
  ops: string;
  carrier: string;
  affiliateA: string;
  customer: string;
};

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
 * Reclaims the fixed ops demo email when it was previously used as another role on a dev DB
 * (common when older seeds used a dynamic ops address). Refuses if a carrier row has parcels
 * (RESTRICT FK) so we never orphan manifest data silently.
 */
async function reclaimOpsDemoEmail(knex: Knex, config: Env, body: RegisterRequest, existing: UserRow): Promise<void> {
  const opsEmail = DEMO_PORTAL_TEST_ACCOUNTS.ops.email.toLowerCase();
  if (body.role !== 'ops' || body.email.toLowerCase() !== opsEmail) {
    throw new Error('reclaimOpsDemoEmail: internal misuse');
  }

  await knex.transaction(async (trx) => {
    if (existing.role === 'affiliate') {
      await trx('affiliates').where({ user_id: existing.id }).delete();
    }
    if (existing.role === 'carrier') {
      const carrier = await trx('carriers').where({ user_id: existing.id }).first();
      if (carrier) {
        const countRow = await trx('parcels').where({ carrier_id: carrier.id }).count('* as c').first() as
          | { c: string | number }
          | undefined;
        const n = Number(countRow?.c ?? 0);
        if (n > 0) {
          throw new Error(
            'Demo seed: the ops demo email is still a carrier account with parcels. Use a fresh dev database, or change that user in SQL before re-seeding.',
          );
        }
        await trx('carriers').where({ user_id: existing.id }).delete();
      }
    }
    const passwordHash = await bcrypt.hash(body.password, config.BCRYPT_ROUNDS);
    await trx('users').where({ id: existing.id }).update({
      role: 'ops',
      password_hash: passwordHash,
      first_name: body.firstName,
      last_name: body.lastName,
      postcode: null,
      is_active: true,
      updated_at: trx.fn.now(),
    });
  });
}

/**
 * Creates the portal user or resets password + reactivates when the email already exists with the same role.
 * Mismatched role on the ops demo email is reclaimed as ops when safe.
 */
async function registerOrRefreshPortalUser(
  knex: Knex,
  userSvc: ReturnType<typeof createUserService>,
  config: Env,
  body: RegisterRequest,
): Promise<{ userId: string }> {
  const users = new UserRepository(knex);
  const existing = await users.findByEmail(body.email);
  if (existing) {
    if (existing.role !== body.role) {
      const opsEmail = DEMO_PORTAL_TEST_ACCOUNTS.ops.email.toLowerCase();
      if (body.role === 'ops' && body.email.toLowerCase() === opsEmail) {
        await reclaimOpsDemoEmail(knex, config, body, existing);
        return { userId: existing.id };
      }
      throw new Error(
        `Demo seed: cannot refresh ${body.email}: stored role is ${existing.role}, expected ${body.role}.`,
      );
    }
    const passwordHash = await bcrypt.hash(body.password, config.BCRYPT_ROUNDS);
    await users.updatePasswordHash(existing.id, passwordHash, { reactivate: true });
    return { userId: existing.id };
  }
  const reg = await userSvc.register(body);
  return { userId: reg.user.id };
}

/**
 * Ensures the four fixed portal demo users exist with passwords from `DEMO_PORTAL_TEST_ACCOUNTS`.
 * Does not create the secondary hub affiliate or manifest rows — use {@link seedDemoLondonDataset} for that.
 */
export async function ensureDemoPortalAccounts(
  knex: Knex,
  config: Env,
): Promise<{ emails: DemoPortalEmails; carrierUserId: string }> {
  const userSvc = createUserService(knex, config);
  const hubA = pickLondonDemoPostcode(0);

  const portal = DEMO_PORTAL_TEST_ACCOUNTS;
  const emails: DemoPortalEmails = {
    ops: portal.ops.email,
    carrier: portal.carrier.email,
    affiliateA: portal.affiliate.email,
    customer: portal.customer.email,
  };

  await registerOrRefreshPortalUser(knex, userSvc, config, {
    email: emails.ops,
    password: portal.ops.password,
    firstName: 'Demo',
    lastName: 'Ops',
    role: 'ops',
    postcode: null,
  });

  await registerOrRefreshPortalUser(knex, userSvc, config, {
    email: emails.affiliateA,
    password: portal.affiliate.password,
    firstName: 'Demo',
    lastName: 'HubA',
    role: 'affiliate',
    postcode: hubA,
    addressLine1: '88 Demo Collection Street',
    maxDailyCapacity: 40,
  });

  const { userId: carrierUserId } = await registerOrRefreshPortalUser(knex, userSvc, config, {
    email: emails.carrier,
    password: portal.carrier.password,
    firstName: 'Demo',
    lastName: 'Carrier',
    role: 'carrier',
    postcode: null,
  });

  await registerOrRefreshPortalUser(knex, userSvc, config, {
    email: emails.customer,
    password: portal.customer.password,
    firstName: 'Demo',
    lastName: 'Customer',
    role: 'customer',
    postcode: hubA,
  });

  return { emails, carrierUserId };
}

/**
 * Inserts demo users and a multi-row manifest cycling {@link pickLondonDemoPostcode}.
 * Portal emails are refreshed on repeat runs; other behaviour is not fully idempotent.
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

  const { emails: portalEmails, carrierUserId } = await ensureDemoPortalAccounts(knex, config);
  const internalPwd = DEMO_LONDON_SEED_PASSWORD;

  const emails = {
    ...portalEmails,
    affiliateB: `demo8-aff-b-${tag}@example.test`,
  };

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
