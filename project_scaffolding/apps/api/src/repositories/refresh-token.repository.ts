import type { Knex } from 'knex';

export class RefreshTokenRepository {
  constructor(private readonly db: Knex) {}

  async insert(params: { id: string; userId: string; expiresAt: Date }): Promise<void> {
    await this.db('refresh_tokens').insert({
      id: params.id,
      user_id: params.userId,
      expires_at: params.expiresAt,
    });
  }

  async findActive(id: string, userId: string): Promise<{ id: string } | null> {
    const row = await this.db('refresh_tokens')
      .where({ id, user_id: userId })
      .whereNull('revoked_at')
      .where('expires_at', '>', this.db.fn.now())
      .first<{ id: string }>();
    return row ?? null;
  }

  async revoke(id: string): Promise<void> {
    await this.db('refresh_tokens').where({ id }).update({ revoked_at: this.db.fn.now() });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db('refresh_tokens')
      .where({ user_id: userId })
      .whereNull('revoked_at')
      .update({ revoked_at: this.db.fn.now() });
  }
}
