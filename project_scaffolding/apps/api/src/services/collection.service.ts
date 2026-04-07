import { timingSafeEqual } from 'node:crypto';
import type { Knex } from 'knex';
import type { ParcelPublic } from '@neardrop/shared';
import { ErrorCodes } from '@neardrop/shared';
import { AppError } from '../errors/AppError.js';
import { AffiliateEarningsRepository } from '../repositories/affiliate-earnings.repository.js';
import { AffiliateRepository } from '../repositories/affiliate.repository.js';
import { toParcelPublic } from '../repositories/parcel.mappers.js';
import { ParcelRepository } from '../repositories/parcel.repository.js';
import type { NotificationService } from './notification.service.js';
import type { QrTokenService } from './qr-token.service.js';

function tokensEqual(stored: string, provided: string): boolean {
  const a = Buffer.from(stored, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export class CollectionService {
  constructor(
    private readonly knex: Knex,
    private readonly qr: QrTokenService,
    private readonly notifications: NotificationService,
  ) {}

  /**
   * Affiliate completes handover (scanner app or web). JWT must match the row-stored token (single-use).
   */
  async completeCollection(
    affiliateUserId: string,
    parcelId: string,
    qrToken: string,
  ): Promise<ParcelPublic> {
    let payload;
    try {
      payload = this.qr.verifyCollectionToken(qrToken);
    } catch {
      throw new AppError('Invalid or expired collection token', ErrorCodes.INVALID_QR_TOKEN, 401);
    }
    if (payload.pid !== parcelId) {
      throw new AppError('Token does not match parcel', ErrorCodes.INVALID_QR_TOKEN, 400);
    }

    const parcel = await new ParcelRepository(this.knex).findById(parcelId);
    if (!parcel) {
      throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);
    }

    const aff = await new AffiliateRepository(this.knex).findByUserId(affiliateUserId);
    if (!aff || aff.id !== parcel.affiliate_id || aff.id !== payload.aid) {
      throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
    }

    if (parcel.customer_id !== payload.cid) {
      throw new AppError('Invalid or expired collection token', ErrorCodes.INVALID_QR_TOKEN, 400);
    }

    if (parcel.status !== 'ready_to_collect') {
      throw new AppError('Parcel is not ready for collection', ErrorCodes.QR_NOT_READY, 409);
    }

    if (parcel.qr_token_used_at != null) {
      throw new AppError('Collection code already used', ErrorCodes.QR_ALREADY_USED, 409);
    }

    if (!parcel.collection_qr_token || !tokensEqual(parcel.collection_qr_token, qrToken)) {
      throw new AppError('Invalid or expired collection token', ErrorCodes.INVALID_QR_TOKEN, 401);
    }

    const fee =
      typeof parcel.per_parcel_fee === 'string' ? parseFloat(parcel.per_parcel_fee) : parcel.per_parcel_fee;
    if (!Number.isFinite(fee) || fee <= 0) {
      throw new AppError('Invalid parcel fee configuration', ErrorCodes.INTERNAL_ERROR, 500);
    }

    await this.knex.transaction(async (trx) => {
      const pr = new ParcelRepository(trx);
      await pr.updateStatus(parcelId, 'collected', { collection_time: new Date() });
      await pr.insertHistory({
        parcel_id: parcelId,
        status: 'collected',
        actor_id: affiliateUserId,
        actor_role: 'affiliate',
        note: null,
      });
      await pr.clearCollectionQr(parcelId);
      await new AffiliateEarningsRepository(trx).insertEarning({
        affiliateId: aff.id,
        parcelId,
        amount: fee,
      });
    });

    const updated = await new ParcelRepository(this.knex).findById(parcelId);
    if (!updated) throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);

    await this.notifications.notifyParcelCollected(updated).catch(() => undefined);

    return toParcelPublic(updated);
  }
}
