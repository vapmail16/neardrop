import type { Knex } from 'knex';
import type { UserRole } from '@neardrop/shared';

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string | null;
  postcode: string | null;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class UserRepository {
  constructor(private readonly db: Knex) {}

  async insertUser(params: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone: string | null;
    postcode: string | null;
  }): Promise<UserRow> {
    const [row] = await this.db<UserRow>('users')
      .insert({
        email: params.email.toLowerCase(),
        password_hash: params.passwordHash,
        first_name: params.firstName,
        last_name: params.lastName,
        role: params.role,
        phone: params.phone,
        postcode: params.postcode,
        is_active: true,
        email_verified: false,
      })
      .returning('*');
    if (!row) throw new Error('insertUser: no row returned');
    return row;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const row = await this.db<UserRow>('users')
      .whereRaw('LOWER(email) = LOWER(?)', [email])
      .first();
    return row ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const row = await this.db<UserRow>('users').where({ id }).first();
    return row ?? null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db('users').where({ id }).update({ last_login_at: this.db.fn.now() });
  }

  /** For manifest import: link parcel to customer account when email matches. */
  async findCustomerIdByEmail(email: string): Promise<string | null> {
    const row = await this.db<{ id: string }>('users')
      .select('id')
      .whereRaw('LOWER(email) = LOWER(?)', [email])
      .where({ role: 'customer' })
      .first();
    return row?.id ?? null;
  }
}
