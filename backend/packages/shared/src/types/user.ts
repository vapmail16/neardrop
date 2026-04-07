import type { UserRole } from '../constants/roles.js';

export type { UserRole };

/** Identity attached after JWT verification (email optional until profile loaded). */
export type AuthUser = {
  id: string;
  role: UserRole;
  email?: string;
};

/** Safe user shape returned from APIs (no secrets). */
export type UserPublic = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string | null;
  postcode: string | null;
  emailVerified: boolean;
  createdAt: string;
};
