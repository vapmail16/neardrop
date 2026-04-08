import { describe, expect, it } from 'vitest';
import {
  emailSchema,
  manifestRowSchema,
  manifestUploadSchema,
  parcelAssignAffiliateBodySchema,
  registerRequestSchema,
  ukPostcodeSchema,
  userRoleSchema,
} from './schemas.js';

describe('emailSchema', () => {
  it('accepts valid email', () => {
    expect(emailSchema.parse('a@b.co')).toBe('a@b.co');
  });

  it('rejects invalid email', () => {
    expect(() => emailSchema.parse('not-an-email')).toThrow();
  });
});

describe('ukPostcodeSchema', () => {
  it('normalises valid postcodes', () => {
    expect(ukPostcodeSchema.parse('e1 6an')).toBe('E1 6AN');
    expect(ukPostcodeSchema.parse('sw9 9ab')).toBe('SW9 9AB');
  });

  it('rejects invalid postcodes', () => {
    expect(() => ukPostcodeSchema.parse('INVALID')).toThrow();
  });
});

describe('userRoleSchema', () => {
  it('accepts ops role', () => {
    expect(userRoleSchema.parse('ops')).toBe('ops');
  });

  it('rejects unknown role', () => {
    expect(() => userRoleSchema.parse('admin')).toThrow();
  });
});

describe('registerRequestSchema', () => {
  it('parses customer with strong password and postcode', () => {
    const out = registerRequestSchema.parse({
      email: 'c@example.com',
      password: 'GoodPassw0rd!',
      firstName: 'A',
      lastName: 'B',
      role: 'customer',
      postcode: 'sw1a 1aa',
    });
    expect(out.email).toBe('c@example.com');
    expect(out.postcode).toBe('SW1A 1AA');
  });

  it('requires postcode for customer', () => {
    expect(() =>
      registerRequestSchema.parse({
        email: 'c@example.com',
        password: 'GoodPassw0rd!',
        firstName: 'A',
        lastName: 'B',
        role: 'customer',
      }),
    ).toThrow();
  });

  it('accepts carrier with explicit null postcode (JSON APIs)', () => {
    const out = registerRequestSchema.parse({
      email: 'car@example.com',
      password: 'GoodPassw0rd!',
      firstName: 'A',
      lastName: 'B',
      role: 'carrier',
      postcode: null,
    });
    expect(out.postcode).toBeNull();
  });

  it('requires postcode for affiliate', () => {
    expect(() =>
      registerRequestSchema.parse({
        email: 'a@example.com',
        password: 'GoodPassw0rd!',
        firstName: 'A',
        lastName: 'B',
        role: 'affiliate',
      }),
    ).toThrow();
  });

  it('accepts affiliate with valid postcode', () => {
    const out = registerRequestSchema.parse({
      email: 'a@example.com',
      password: 'GoodPassw0rd!',
      firstName: 'A',
      lastName: 'B',
      role: 'affiliate',
      postcode: 'e1 6an',
      addressLine1: '10 Test Street',
      maxDailyCapacity: 40,
    });
    expect(out.postcode).toBe('E1 6AN');
    expect(out.addressLine1).toBe('10 Test Street');
    expect(out.maxDailyCapacity).toBe(40);
  });

  it('requires address line for affiliate', () => {
    expect(() =>
      registerRequestSchema.parse({
        email: 'a@example.com',
        password: 'GoodPassw0rd!',
        firstName: 'A',
        lastName: 'B',
        role: 'affiliate',
        postcode: 'e1 6an',
      }),
    ).toThrow();
  });

  it('rejects affiliate address shorter than 3 characters', () => {
    expect(() =>
      registerRequestSchema.parse({
        email: 'a@example.com',
        password: 'GoodPassw0rd!',
        firstName: 'A',
        lastName: 'B',
        role: 'affiliate',
        postcode: 'e1 6an',
        addressLine1: 'ab',
      }),
    ).toThrow();
  });
});

describe('manifestRowSchema', () => {
  it('normalises postcode and optional email', () => {
    const out = manifestRowSchema.parse({
      carrierRef: 'REF-1',
      recipientName: 'Jane Doe',
      recipientPostcode: 'sw9 9ab',
      recipientEmail: 'j@example.com',
    });
    expect(out.recipientPostcode).toBe('SW9 9AB');
    expect(out.recipientEmail).toBe('j@example.com');
  });

  it('rejects bad postcode', () => {
    expect(() =>
      manifestRowSchema.parse({
        carrierRef: 'R',
        recipientName: 'X',
        recipientPostcode: 'NOT_A_PC',
      }),
    ).toThrow();
  });
});

describe('manifestUploadSchema', () => {
  it('accepts json rows', () => {
    const out = manifestUploadSchema.parse({
      format: 'json',
      rows: [
        {
          carrierRef: 'A',
          recipientName: 'B',
          recipientPostcode: 'E1 6AN',
        },
      ],
    });
    expect(out.format).toBe('json');
    if (out.format === 'json') expect(out.rows).toHaveLength(1);
  });

  it('accepts csv content', () => {
    const out = manifestUploadSchema.parse({
      format: 'csv',
      content: 'carrier_ref,name,pc\nX,Y,SW1A1AA',
    });
    expect(out.format).toBe('csv');
    if (out.format === 'csv') expect(out.content).toContain('carrier_ref');
  });
});

describe('parcelAssignAffiliateBodySchema', () => {
  it('accepts uuid or null', () => {
    const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    expect(parcelAssignAffiliateBodySchema.parse({ affiliateId: id }).affiliateId).toBe(id);
    expect(parcelAssignAffiliateBodySchema.parse({ affiliateId: null }).affiliateId).toBeNull();
  });

  it('rejects invalid uuid', () => {
    expect(() => parcelAssignAffiliateBodySchema.parse({ affiliateId: 'not-uuid' })).toThrow();
  });
});
