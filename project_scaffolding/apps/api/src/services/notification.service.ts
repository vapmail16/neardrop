import type { EmailChannel } from '../channels/email.channel.js';
import type { ParcelRow } from '../repositories/parcel.repository.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { UserRepository } from '../repositories/user.repository.js';

export class NotificationService {
  constructor(
    private readonly users: UserRepository,
    private readonly notifications: NotificationRepository,
    private readonly email: EmailChannel,
  ) {}

  async notifyParcelReadyToCollect(parcel: ParcelRow): Promise<void> {
    if (!parcel.customer_id) return;
    const user = await this.users.findById(parcel.customer_id);
    if (!user) return;
    const body = `Your parcel is ready to collect from your NearDrop affiliate (ref ${parcel.carrier_ref ?? parcel.id.slice(0, 8)}).`;
    await this.dispatchEmail({
      userId: user.id,
      parcelId: parcel.id,
      type: 'parcel_ready_to_collect',
      subject: 'Your parcel is ready to collect',
      body,
      to: user.email,
    });
  }

  async notifyParcelCollected(parcel: ParcelRow): Promise<void> {
    if (!parcel.customer_id) return;
    const user = await this.users.findById(parcel.customer_id);
    if (!user) return;
    const body = `Your parcel has been collected (ref ${parcel.carrier_ref ?? parcel.id.slice(0, 8)}).`;
    await this.dispatchEmail({
      userId: user.id,
      parcelId: parcel.id,
      type: 'parcel_collected',
      subject: 'Your parcel has been collected',
      body,
      to: user.email,
    });
  }

  private async dispatchEmail(params: {
    userId: string;
    parcelId: string;
    type: string;
    subject: string;
    body: string;
    to: string;
  }): Promise<void> {
    const id = await this.notifications.insertPending({
      userId: params.userId,
      parcelId: params.parcelId,
      type: params.type,
      subject: params.subject,
      body: params.body,
    });
    try {
      await this.email.send({
        to: params.to,
        subject: params.subject,
        text: params.body,
      });
      await this.notifications.markSent(id);
    } catch {
      await this.notifications.markFailed(id);
    }
  }
}
