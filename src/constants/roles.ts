export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OWNER: 'OWNER',
  TENANT: 'TENANT',
  STAFF: 'STAFF',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
