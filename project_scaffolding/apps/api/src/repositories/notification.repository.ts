import type { Knex } from 'knex';

export class NotificationRepository {
  constructor(private readonly db: Knex) {}

  async insertPending(params: {
    userId: string;
    parcelId: string | null;
    type: string;
    subject: string;
    body: string;
  }): Promise<string> {
    const rows = (await this.db('notifications')
      .insert({
        user_id: params.userId,
        parcel_id: params.parcelId,
        channel: 'email',
        type: params.type,
        subject: params.subject,
        body: params.body,
        status: 'pending',
      })
      .returning('id')) as { id: string }[];
    const row = rows[0];
    if (!row) throw new Error('notification insert: no id');
    return row.id;
  }

  async markSent(id: string): Promise<void> {
    await this.db('notifications')
      .where({ id })
      .update({ status: 'sent', sent_at: this.db.fn.now() });
  }

  async markFailed(id: string): Promise<void> {
    await this.db('notifications').where({ id }).update({ status: 'failed' });
  }
}
