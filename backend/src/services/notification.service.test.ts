import { describe, expect, it, vi } from 'vitest';
import type { ParcelRow } from '../repositories/parcel.repository.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { NotificationService } from './notification.service.js';

function parcel(over: Partial<ParcelRow> = {}): ParcelRow {
  return {
    id: 'p1',
    carrier_id: 'c1',
    carrier_ref: 'R',
    affiliate_id: 'a1',
    customer_id: 'u1',
    recipient_name: 'Bob',
    recipient_postcode: 'E1 6AN',
    recipient_email: 'bob@example.com',
    status: 'ready_to_collect',
    estimated_drop_time: null,
    actual_drop_time: null,
    collection_time: null,
    collection_qr_token: null,
    qr_token_expires_at: null,
    qr_token_used_at: null,
    per_parcel_fee: '0.50',
    created_at: new Date(),
    updated_at: new Date(),
    ...over,
  };
}

describe('NotificationService', () => {
  it('sends ready-to-collect email and marks notification sent', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const notif = {
      insertPending: vi.fn().mockResolvedValue('nid-1'),
      markSent: vi.fn().mockResolvedValue(undefined),
      markFailed: vi.fn(),
    } as unknown as NotificationRepository;
    const users = {
      findById: vi.fn().mockResolvedValue({
        id: 'u1',
        email: 'bob@example.com',
      }),
    } as unknown as UserRepository;
    const svc = new NotificationService(users, notif, { send });
    await svc.notifyParcelReadyToCollect(parcel());
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'bob@example.com',
        subject: expect.stringMatching(/ready/i),
      }),
    );
    expect(notif.markSent).toHaveBeenCalledWith('nid-1');
    expect(notif.markFailed).not.toHaveBeenCalled();
  });

  it('marks failed when email channel throws', async () => {
    const send = vi.fn().mockRejectedValue(new Error('smtp unavailable'));
    const notif = {
      insertPending: vi.fn().mockResolvedValue('nid-2'),
      markSent: vi.fn(),
      markFailed: vi.fn().mockResolvedValue(undefined),
    } as unknown as NotificationRepository;
    const users = {
      findById: vi.fn().mockResolvedValue({ id: 'u1', email: 'bob@example.com' }),
    } as unknown as UserRepository;
    const svc = new NotificationService(users, notif, { send });
    await svc.notifyParcelReadyToCollect(parcel());
    expect(notif.markFailed).toHaveBeenCalledWith('nid-2');
    expect(notif.markSent).not.toHaveBeenCalled();
  });

  it('skips when no customer on parcel', async () => {
    const send = vi.fn();
    const notif = {
      insertPending: vi.fn(),
      markSent: vi.fn(),
      markFailed: vi.fn(),
    } as unknown as NotificationRepository;
    const users = { findById: vi.fn() } as unknown as UserRepository;
    const svc = new NotificationService(users, notif, { send });
    await svc.notifyParcelReadyToCollect(parcel({ customer_id: null }));
    expect(send).not.toHaveBeenCalled();
    expect(notif.insertPending).not.toHaveBeenCalled();
  });

  it('notifyParcelCollected sends email', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const notif = {
      insertPending: vi.fn().mockResolvedValue('nid-3'),
      markSent: vi.fn().mockResolvedValue(undefined),
      markFailed: vi.fn(),
    } as unknown as NotificationRepository;
    const users = {
      findById: vi.fn().mockResolvedValue({ id: 'u1', email: 'bob@example.com' }),
    } as unknown as UserRepository;
    const svc = new NotificationService(users, notif, { send });
    await svc.notifyParcelCollected(parcel({ status: 'collected' }));
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringMatching(/collected/i),
      }),
    );
  });
});
