import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Env } from '../config/schema.js';
import { addExpiresIn } from './token.service.js';

export type QrCollectionPayload = {
  typ: 'parcel_collect';
  pid: string;
  aid: string;
  cid: string;
  jti: string;
};

type QrConfig = Pick<Env, 'JWT_SECRET' | 'JWT_QR_COLLECTION_EXPIRES'>;

/**
 * Short-lived JWT for parcel handover. Same secret as auth JWTs; distinct `typ` claim.
 * Web and native clients embed the returned string in a QR or send it in collect API body.
 */
export class QrTokenService {
  constructor(private readonly config: QrConfig) {}

  signCollectionToken(params: {
    parcelId: string;
    affiliateId: string;
    customerId: string;
    jti: string;
  }): string {
    const payload: QrCollectionPayload = {
      typ: 'parcel_collect',
      pid: params.parcelId,
      aid: params.affiliateId,
      cid: params.customerId,
      jti: params.jti,
    };
    const options: SignOptions = {
      expiresIn: this.config.JWT_QR_COLLECTION_EXPIRES as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, this.config.JWT_SECRET, options);
  }

  verifyCollectionToken(token: string): QrCollectionPayload {
    const decoded = jwt.verify(token, this.config.JWT_SECRET) as QrCollectionPayload;
    if (decoded.typ !== 'parcel_collect') {
      throw new jwt.JsonWebTokenError('Expected parcel collection token');
    }
    if (!decoded.pid || !decoded.aid || !decoded.cid || !decoded.jti) {
      throw new jwt.JsonWebTokenError('Malformed collection payload');
    }
    return decoded;
  }

  qrExpiryDate(): Date {
    return addExpiresIn(new Date(), this.config.JWT_QR_COLLECTION_EXPIRES);
  }
}
