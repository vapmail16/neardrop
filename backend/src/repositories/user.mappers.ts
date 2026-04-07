import type { UserPublic, UserRole } from '@neardrop/shared';
import type { UserRow } from './user.repository.js';

export function toUserPublic(row: UserRow): UserPublic {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role as UserRole,
    phone: row.phone,
    postcode: row.postcode,
    emailVerified: row.email_verified,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
