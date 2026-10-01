import { isSystemRole } from '../constants/systemRoles';
import { ACCOUNT_STATUS_CONFIG } from '../constants/accountStatus';
import type { AccountStatus, UserAccount } from '../types/user.types';

/** identity-access-service user payload (login `data.user`, GET /auth/me, /users). */
export interface IdentityUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: AccountStatus;
  roles: string[];
  createdAt: string;
}

/** identity-access-service RoleResponse. */
export interface IdentityRole {
  id: string;
  name: string;
  description?: string | null;
}

// Custom roles created through POST /roles have no UI configuration, so only the canonical
// roles are kept; everything role-based in the UI is keyed by them.
export const toUserAccount = (user: IdentityUser): UserAccount => ({
  id: user.id,
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone || undefined,
  roles: (user.roles ?? []).filter(isSystemRole),
  // Any status the UI doesn't know is treated as not able to sign in.
  status: user.status in ACCOUNT_STATUS_CONFIG ? user.status : 'INACTIVE',
  createdAt: user.createdAt,
});
