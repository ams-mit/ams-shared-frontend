import { normalizeEmail } from '@/utils/validation';
import { validatePasswordPolicy } from '@/features/auth/validation/passwordValidation';
import { SYSTEM_ROLES, SYSTEM_ROLE_CONFIG, getRoleLabel } from '../constants/systemRoles';
import { ACCOUNT_STATUS_CONFIG, canTransitionStatus } from '../constants/accountStatus';
import type {
  AccountStatus,
  CreateUserRequest,
  SystemRole,
  UpdateUserRequest,
  UserAccount,
} from '../types/user.types';
import { mockDelay, userMockStore } from './userMockStore';

// Administrator user-management operations (identity-access-service /api/v1/users, /api/v1/roles).
// Mock implementation for the UI-only phase — replace each body with an apiClient
// call during API/Gateway integration; signatures are intended to stay the same.

/** identity-access-service RoleResponse. */
export interface RoleReference {
  id: string;
  name: string;
  description: string;
}

const SELF_ROLE_CHANGE_ERROR =
  'You cannot change your own roles. Ask another system administrator to make this change.';

const requireUser = (userId: string): UserAccount => {
  const user = userMockStore.findById(userId);
  if (!user) throw new Error('This user account could not be found.');
  return user;
};

const assertStatusTransition = (from: AccountStatus, to: AccountStatus) => {
  if (!canTransitionStatus(from, to)) {
    throw new Error(
      `An account cannot move from ${ACCOUNT_STATUS_CONFIG[from].label} to ${ACCOUNT_STATUS_CONFIG[to].label}.`
    );
  }
};

export const userApi = {
  getRoles: async (): Promise<RoleReference[]> => {
    await mockDelay();
    return SYSTEM_ROLES.map((role) => ({
      id: role,
      name: getRoleLabel(role),
      description: SYSTEM_ROLE_CONFIG[role].description,
    }));
  },

  getUsers: async (): Promise<UserAccount[]> => {
    await mockDelay();
    return userMockStore.list();
  },

  getUserById: async (userId: string): Promise<UserAccount> => {
    await mockDelay();
    return requireUser(userId);
  },

  /** Admin-created accounts start ACTIVE and must change the temporary password at first sign-in. */
  createUser: async (payload: CreateUserRequest): Promise<UserAccount> => {
    await mockDelay();
    const email = normalizeEmail(payload.email);
    if (userMockStore.isEmailTaken(email)) {
      throw new Error('An account with this email address already exists.');
    }
    const passwordError = validatePasswordPolicy(payload.temporaryPassword, 'Temporary password');
    if (passwordError) throw new Error(passwordError);

    return userMockStore.insert(
      {
        id: `usr-${Date.now()}`,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email,
        phone: payload.phone.trim() || undefined,
        roles: payload.roles,
        status: 'ACTIVE',
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      },
      { temporaryPassword: payload.temporaryPassword }
    );
  },

  updateUser: async (userId: string, payload: UpdateUserRequest): Promise<UserAccount> => {
    await mockDelay();
    const user = requireUser(userId);
    const email = normalizeEmail(payload.email);
    if (userMockStore.isEmailTaken(email, userId)) {
      throw new Error('Another account already uses this email address.');
    }
    assertStatusTransition(user.status, payload.status);
    return userMockStore.update(userId, {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email,
      phone: payload.phone.trim() || undefined,
      status: payload.status,
    }) as UserAccount;
  },

  /** PATCH /users/{userId}/status — used to approve or reject self-registrations, suspend, etc. */
  updateStatus: async (userId: string, status: AccountStatus): Promise<UserAccount> => {
    await mockDelay();
    const user = requireUser(userId);
    assertStatusTransition(user.status, status);
    return userMockStore.update(userId, { status }) as UserAccount;
  },

  /** FR-IAM-027: an administrator cannot assign or remove their own roles. */
  assignRole: async (userId: string, role: SystemRole, actorUserId: string): Promise<UserAccount> => {
    await mockDelay();
    if (userId === actorUserId) throw new Error(SELF_ROLE_CHANGE_ERROR);
    const user = requireUser(userId);
    if (user.roles.includes(role)) {
      throw new Error(`${getRoleLabel(role)} is already assigned to this user.`);
    }
    return userMockStore.update(userId, { roles: [...user.roles, role] }) as UserAccount;
  },

  removeRole: async (userId: string, role: SystemRole, actorUserId: string): Promise<UserAccount> => {
    await mockDelay();
    if (userId === actorUserId) throw new Error(SELF_ROLE_CHANGE_ERROR);
    const user = requireUser(userId);
    if (!user.roles.includes(role)) {
      throw new Error(`${getRoleLabel(role)} is not assigned to this user.`);
    }
    return userMockStore.update(userId, { roles: user.roles.filter((r) => r !== role) }) as UserAccount;
  },
};
