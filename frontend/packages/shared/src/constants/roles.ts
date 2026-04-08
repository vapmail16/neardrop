export const USER_ROLES = ['carrier', 'customer', 'affiliate', 'ops'] as const;

export type UserRole = (typeof USER_ROLES)[number];
