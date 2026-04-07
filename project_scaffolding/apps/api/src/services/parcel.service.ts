import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';
import {
  ErrorCodes,
  type ManifestRowParsed,
  type ManifestUploadBody,
  type ManifestUploadSummary,
  type ParcelListQuery,
  type ParcelPublic,
  type ParcelStatus,
  type UserRole,
} from '@neardrop/shared';
import { AppError } from '../errors/AppError.js';
import { AffiliateRepository } from '../repositories/affiliate.repository.js';
import { CarrierRepository } from '../repositories/carrier.repository.js';
import { toParcelPublic } from '../repositories/parcel.mappers.js';
import type { ParcelRow } from '../repositories/parcel.repository.js';
import { ParcelRepository } from '../repositories/parcel.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AffiliateMatchingService } from './affiliate-matching.service.js';
import { parseManifestCsv } from './manifest.service.js';
import { canTransition, type TransitionActor } from './parcel.stateMachine.js';
import type { NotificationService } from './notification.service.js';
import type { QrTokenService } from './qr-token.service.js';

export type ParcelServiceDeps = {
  qrTokens?: QrTokenService;
  notifications?: NotificationService;
};

export class ParcelService {
  constructor(
    private readonly knex: Knex,
    private readonly deps: ParcelServiceDeps = {},
  ) {}

  async uploadManifest(
    carrierUserId: string,
    body: ManifestUploadBody,
    actorUserId: string,
  ): Promise<ManifestUploadSummary> {
    const carriers = new CarrierRepository(this.knex);
    const carrier = await carriers.findByUserId(carrierUserId);
    if (!carrier) {
      throw new AppError('Carrier profile not found', ErrorCodes.NOT_FOUND, 404);
    }

    let rows: ManifestRowParsed[];
    if (body.format === 'json') {
      rows = body.rows;
    } else {
      const { rows: parsed, errors } = parseManifestCsv(body.content);
      if (errors.length > 0) {
        throw new AppError(
          'Invalid manifest CSV',
          ErrorCodes.VALIDATION_ERROR,
          400,
          errors.map((e) => ({
            field: `row.${e.row}`,
            message: e.message,
          })),
        );
      }
      rows = parsed;
    }

    const parcelIds: string[] = [];
    let matchedAffiliate = 0;
    let unmatched = 0;

    await this.knex.transaction(async (trx) => {
      const pr = new ParcelRepository(trx);
      const ur = new UserRepository(trx);
      const ar = new AffiliateRepository(trx);
      const matchSvc = new AffiliateMatchingService(ar);

      for (const r of rows) {
        const match = await matchSvc.matchPostcode(r.recipientPostcode);
        const affiliateId = match.type === 'matched' ? match.affiliateId : null;
        if (affiliateId) matchedAffiliate += 1;
        else unmatched += 1;

        let customerId: string | null = null;
        if (r.recipientEmail) {
          customerId = await ur.findCustomerIdByEmail(r.recipientEmail);
        }

        let est: Date | null = null;
        if (r.estimatedDropTime) {
          const d = new Date(r.estimatedDropTime);
          est = Number.isNaN(d.getTime()) ? null : d;
        }

        const parcel = await pr.insertParcel({
          carrier_id: carrier.id,
          carrier_ref: r.carrierRef,
          affiliate_id: affiliateId,
          customer_id: customerId,
          recipient_name: r.recipientName,
          recipient_postcode: r.recipientPostcode,
          recipient_email: r.recipientEmail,
          status: 'manifest_received',
          estimated_drop_time: est,
        });
        parcelIds.push(parcel.id);
        await pr.insertHistory({
          parcel_id: parcel.id,
          status: 'manifest_received',
          actor_id: actorUserId,
          actor_role: 'carrier',
        });
      }
    });

    return {
      total: rows.length,
      matchedAffiliate,
      unmatched,
      parcelIds,
    };
  }

  async listParcels(
    role: UserRole,
    userId: string,
    query: ParcelListQuery,
  ): Promise<{ items: ParcelPublic[]; total: number; page: number; limit: number }> {
    const pr = new ParcelRepository(this.knex);
    const limit = query.limit;
    const offset = (query.page - 1) * limit;
    const { status } = query;

    if (role === 'ops') {
      const { rows, total } = await pr.findAllForOps({ limit, offset, status });
      return { items: rows.map(toParcelPublic), total, page: query.page, limit };
    }
    if (role === 'carrier') {
      const c = await new CarrierRepository(this.knex).findByUserId(userId);
      if (!c) return { items: [], total: 0, page: query.page, limit };
      const { rows, total } = await pr.findByCarrierId(c.id, { limit, offset, status });
      return { items: rows.map(toParcelPublic), total, page: query.page, limit };
    }
    if (role === 'customer') {
      const { rows, total } = await pr.findByCustomerId(userId, { limit, offset, status });
      return { items: rows.map(toParcelPublic), total, page: query.page, limit };
    }
    if (role === 'affiliate') {
      const a = await new AffiliateRepository(this.knex).findByUserId(userId);
      if (!a) return { items: [], total: 0, page: query.page, limit };
      const { rows, total } = await pr.findByAffiliateId(a.id, { limit, offset, status });
      return { items: rows.map(toParcelPublic), total, page: query.page, limit };
    }
    return { items: [], total: 0, page: query.page, limit };
  }

  async getParcel(parcelId: string, role: UserRole, userId: string): Promise<ParcelPublic> {
    const parcel = await new ParcelRepository(this.knex).findById(parcelId);
    if (!parcel) {
      throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);
    }
    await this.assertParcelAccess(parcel, role, userId);
    return toParcelPublic(parcel);
  }

  async changeStatus(
    parcelId: string,
    to: ParcelStatus,
    actor: TransitionActor,
    actorUserId: string | null,
    note?: string | null,
  ): Promise<ParcelPublic> {
    const parcel = await new ParcelRepository(this.knex).findById(parcelId);
    if (!parcel) {
      throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);
    }
    const from = parcel.status as ParcelStatus;
    if (actor !== 'system') {
      await this.assertParcelAccess(parcel, actor, actorUserId!);
    }

    if (from === 'in_transit' && to === 'dropped_at_affiliate' && actor === 'affiliate') {
      if (!parcel.affiliate_id) {
        throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
      }
      const aff = await new AffiliateRepository(this.knex).findByUserId(actorUserId!);
      if (!aff || aff.id !== parcel.affiliate_id) {
        throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
      }
    }

    if (!canTransition(from, to, actor)) {
      const msg =
        from === to
          ? 'Parcel is already in this status'
          : `Cannot transition from "${from}" to "${to}" for this role`;
      throw new AppError(msg, ErrorCodes.INVALID_STATE_TRANSITION, 422);
    }

    const timestamps: { actual_drop_time?: Date | null; collection_time?: Date | null } = {};
    if (to === 'dropped_at_affiliate') timestamps.actual_drop_time = new Date();
    if (to === 'collected') timestamps.collection_time = new Date();

    await this.knex.transaction(async (trx) => {
      const pr = new ParcelRepository(trx);
      await pr.updateStatus(parcelId, to, timestamps);
      await pr.insertHistory({
        parcel_id: parcelId,
        status: to,
        actor_id: actorUserId,
        actor_role: actor,
        note: note ?? null,
      });
    });

    const updated = await new ParcelRepository(this.knex).findById(parcelId);
    if (!updated) throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);
    if (to === 'ready_to_collect') {
      void this.deps.notifications?.notifyParcelReadyToCollect(updated).catch(() => undefined);
    }
    return toParcelPublic(updated);
  }

  /** Ops-only: set or clear parcel affiliate (manual assignment / reassignment). */
  async assignAffiliateByOps(
    parcelId: string,
    affiliateId: string | null,
    opsUserId: string,
  ): Promise<ParcelPublic> {
    const pr = new ParcelRepository(this.knex);
    const ar = new AffiliateRepository(this.knex);
    const parcel = await pr.findById(parcelId);
    if (!parcel) {
      throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);
    }
    if (affiliateId !== null) {
      const aff = await ar.findById(affiliateId);
      if (!aff) {
        throw new AppError('Affiliate not found', ErrorCodes.NOT_FOUND, 404);
      }
    }

    const fromStatus = parcel.status as ParcelStatus;
    await this.knex.transaction(async (trx) => {
      const trxPr = new ParcelRepository(trx);
      await trxPr.updateAffiliateId(parcelId, affiliateId);
      await trxPr.insertHistory({
        parcel_id: parcelId,
        status: fromStatus,
        actor_id: opsUserId,
        actor_role: 'ops',
        note:
          affiliateId === null
            ? 'Affiliate assignment cleared by ops'
            : `Affiliate set to ${affiliateId} by ops`,
      });
    });

    const updated = await pr.findById(parcelId);
    if (!updated) throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);
    return toParcelPublic(updated);
  }

  /**
   * Customer-facing JWT for QR display (web or native). Stored server-side for single-use verification.
   */
  async issueCustomerCollectionQr(
    customerUserId: string,
    parcelId: string,
  ): Promise<{ qrToken: string; expiresAt: string }> {
    const pr = new ParcelRepository(this.knex);
    const parcel = await pr.findById(parcelId);
    if (!parcel) {
      throw new AppError('Resource not found', ErrorCodes.NOT_FOUND, 404);
    }
    if (parcel.customer_id !== customerUserId) {
      throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
    }
    if (parcel.status !== 'ready_to_collect') {
      throw new AppError('Parcel is not ready for collection', ErrorCodes.QR_NOT_READY, 409);
    }
    if (parcel.qr_token_used_at != null) {
      throw new AppError('Collection code already used', ErrorCodes.QR_ALREADY_USED, 409);
    }
    if (!parcel.affiliate_id || !parcel.customer_id) {
      throw new AppError('Parcel cannot issue collection QR yet', ErrorCodes.QR_NOT_READY, 409);
    }
    const qr = this.deps.qrTokens;
    if (!qr) {
      throw new AppError('Service unavailable', ErrorCodes.INTERNAL_ERROR, 503);
    }
    const jti = randomUUID();
    const token = qr.signCollectionToken({
      parcelId,
      affiliateId: parcel.affiliate_id,
      customerId: parcel.customer_id,
      jti,
    });
    const exp = qr.qrExpiryDate();
    await pr.updateCollectionQr(parcelId, token, exp);
    return { qrToken: token, expiresAt: exp.toISOString() };
  }

  private async assertParcelAccess(parcel: ParcelRow, role: UserRole, userId: string): Promise<void> {
    if (role === 'ops') return;
    if (role === 'customer') {
      if (parcel.customer_id !== userId) {
        throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
      }
      return;
    }
    if (role === 'carrier') {
      const c = await new CarrierRepository(this.knex).findByUserId(userId);
      if (!c || c.id !== parcel.carrier_id) {
        throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
      }
      return;
    }
    if (role === 'affiliate') {
      const a = await new AffiliateRepository(this.knex).findByUserId(userId);
      if (!a || parcel.affiliate_id !== a.id) {
        throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
      }
      return;
    }
    throw new AppError('Forbidden', ErrorCodes.FORBIDDEN, 403);
  }
}
