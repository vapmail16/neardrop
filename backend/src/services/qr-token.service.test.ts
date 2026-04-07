import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { addExpiresIn } from './token.service.js';
import { QrTokenService } from './qr-token.service.js';

const secret = '0123456789abcdef0123456789abcdef';

describe('QrTokenService', () => {
  const svc = new QrTokenService({
    JWT_SECRET: secret,
    JWT_QR_COLLECTION_EXPIRES: '7d',
  });

  it('signs and verifies parcel collection payload', () => {
    const token = svc.signCollectionToken({
      parcelId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      affiliateId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      customerId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      jti: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    });
    const payload = svc.verifyCollectionToken(token);
    expect(payload.pid).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    expect(payload.aid).toBe('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    expect(payload.cid).toBe('cccccccc-cccc-cccc-cccc-cccccccccccc');
    expect(payload.jti).toBe('dddddddd-dddd-dddd-dddd-dddddddddddd');
    expect(payload.typ).toBe('parcel_collect');
  });

  it('rejects wrong secret', () => {
    const token = svc.signCollectionToken({
      parcelId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      affiliateId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      customerId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      jti: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    });
    const bad = new QrTokenService({
      JWT_SECRET: 'wrongwrongwrongwrongwrongwrongwr',
      JWT_QR_COLLECTION_EXPIRES: '7d',
    });
    expect(() => bad.verifyCollectionToken(token)).toThrow();
  });

  it('rejects expired token', () => {
    const short = new QrTokenService({
      JWT_SECRET: secret,
      JWT_QR_COLLECTION_EXPIRES: '1ms',
    });
    const token = short.signCollectionToken({
      parcelId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      affiliateId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      customerId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      jti: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    });
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          expect(() => short.verifyCollectionToken(token)).toThrow();
          resolve();
        } catch (e) {
          reject(e);
        }
      }, 30);
    });
  });

  it('rejects access token type', () => {
    const wrong = jwt.sign(
      { sub: 'u', role: 'customer', typ: 'access' },
      secret,
      { expiresIn: '1h' },
    );
    expect(() => svc.verifyCollectionToken(wrong)).toThrow();
  });

  it('qrExpiryDate matches configured window', () => {
    const d = svc.qrExpiryDate();
    const expected = addExpiresIn(new Date(), '7d');
    expect(Math.abs(d.getTime() - expected.getTime())).toBeLessThan(2000);
  });
});
