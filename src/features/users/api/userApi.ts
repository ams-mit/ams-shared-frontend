import { normalizeEmail } from '@/utils/validation';
import { validatePasswordPolicy } from '@/features/auth/validation/passwordValidation';
import {
  IDENTITY_MAX_PAGE_SIZE,
  identityClient,
  unwrapIdentity,
  withMockFallback,
  type IdentityEnvelope,
} from '@/features/auth/api/identityClient';
import { SYSTEM_ROLES, SYSTEM_ROLE_CONFIG, getRoleLabel, isSystemRole } from '../constants/systemRoles';
import { ACCOUNT_STATUS_CONFIG, canTransitionStatus } from '../constants/accountStatus';
import type {
  AccountStatus,
  CreateUserRequest,
  SystemRole,
  UpdateUserRequest,
  UserAccount,
} from '../types/user.types';
import { mockDelay, userMockStore } from './userMockStore';
import { toUserAccount, type IdentityRole, type IdentityUser } from './identityUser';

// Administrator user-management operations (identity-access-service /api/v1/users, /api/v1/roles;
// SYSTEM_ADMINISTRATOR only). Each call tries the service first and falls back to the offline
// mock store only when it is unreachable.

export interface RoleReference {
  id: string;
  /** Canonical role name, e.g. OWNER. */
  code: string;
  /** Display label. */
  name: string;
  description: string;
}

export interface UserQuery {
  status?: AccountStatus;
  role?: SystemRole;
  search?: string;
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

/** Offline stand-in used when identity-access-service cannot be reached. */
export const mockUserApi = {
  getRoles: async (): Promise<RoleReference[]> => {
    await mockDelay();
    return SYSTEM_ROLES.map((role) => ({
      id: role,
      code: role,
      name: getRoleLabel(role),
      description: SYSTEM_ROLE_CONFIG[role].description,
    }));
  },

  getUsers: async (query: UserQuery = {}): Promise<UserAccount[]> => {
    await mockDelay();
    return userMockStore
      .list()
      .filter((u) => (!query.status || u.status === query.status) && (!query.role || u.roles.includes(query.role)));
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

  updateStatus: async (userId: string, status: AccountStatus): Promise<UserAccount> => {
    await mockDelay();
    const user = requireUser(userId);
    assertStatusTransition(user.status, status);
    return userMockStore.update(userId, { status }) as UserAccount;
  },

  assignRole: async (userId: string, role: SystemRole): Promise<UserAccount> => {
    await mockDelay();
    const user = requireUser(userId);
    if (user.roles.includes(role)) {
      throw new Error(`${getRoleLabel(role)} is already assigned to this user.`);
    }
    return userMockStore.update(userId, { roles: [...user.roles, role] }) as UserAccount;
  },

  removeRole: async (userId: string, role: SystemRole): Promise<UserAccount> => {
    await mockDelay();
    const user = requireUser(userId);
    if (!user.roles.includes(role)) {
      throw new Error(`${getRoleLabel(role)} is not assigned to this user.`);
    }
    return userMockStore.update(userId, { roles: user.roles.filter((r) => r !== role) }) as UserAccount;
  },
};

// ---- identity-access-service --------------------------------------------------------

const listUsers = async (query: UserQuery = {}): Promise<UserAccount[]> => {
  const users: UserAccount[] = [];
  for (let page = 0; ; page += 1) {
    const response = await identityClient.get<IdentityEnvelope<IdentityUser[]>>('/users', {
      params: { ...query, page, size: IDENTITY_MAX_PAGE_SIZE },
    });
    users.push(...(response.data.data ?? []).map(toUserAccount));
    if (!response.data.pagination?.hasNext) return users;
  }
};

const fetchUser = async (userId: string): Promise<UserAccount> => {
  const response = await identityClient.get<IdentityEnvelope<IdentityUser>>(`/users/${userId}`);
  return toUserAccount(unwrapIdentity(response.data));
};

const patchStatus = async (userId: string, status: AccountStatus, reason?: string): Promise<UserAccount> => {
  const response = await identityClient.patch<IdentityEnvelope<IdentityUser>>(`/users/${userId}/status`, {
    status,
    reason,
  });
  return toUserAccount(unwrapIdentity(response.data));
};

// PUT /users/{userId}/roles replaces the whole set, so role changes send the user's full role list.
const replaceRoles = async (userId: string, roles: SystemRole[]): Promise<UserAccount> => {
  await identityClient.put(`/users/${userId}/roles`, { roles });
  return fetchUser(userId);
};

/** Direct identity-service calls without the offline fallback, for callers with their own mock. */
export const identityUserApi = { listUsers, fetchUser, patchStatus };

export const userApi = {
  // GET /roles
  getRoles: (): Promise<RoleReference[]> =>
    withMockFallback(
      async () => {
        const response = await identityClient.get<IdentityEnvelope<IdentityRole[]>>('/roles');
        return unwrapIdentity(response.data).map((role) => ({
          id: role.id,
          code: role.name,
          name: isSystemRole(role.name) ? getRoleLabel(role.name) : role.name,
          description: role.description || (isSystemRole(role.name) ? SYSTEM_ROLE_CONFIG[role.name].description : ''),
        }));
      },
      mockUserApi.getRoles,
      'Roles could not be loaded.'
    ),

  // GET /users — reads every page (the service caps page size at 100).
  getUsers: (query: UserQuery = {}): Promise<UserAccount[]> =>
    withMockFallback(
      () => listUsers(query),
      () => mockUserApi.getUsers(query),
      'Users could not be loaded.'
    ),

  // GET /users/{userId}
  getUserById: (userId: string): Promise<UserAccount> =>
    withMockFallback(() => fetchUser(userId), () => mockUserApi.getUserById(userId), 'This user could not be loaded.'),

  // POST /users — the email doubles as the username.
  createUser: (payload: CreateUserRequest): Promise<UserAccount> =>
    withMockFallback(
      async () => {
        const email = normalizeEmail(payload.email);
        const response = await identityClient.post<IdentityEnvelope<IdentityUser>>('/users', {
          username: email,
          email,
          password: payload.temporaryPassword,
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          phone: payload.phone.trim() || undefined,
          roles: payload.roles,
        });
        return toUserAccount(unwrapIdentity(response.data));
      },
      () => mockUserApi.createUser(payload),
      'The user could not be created.'
    ),

  // PATCH /users/{userId}, then PATCH /users/{userId}/status when the status changed.
  updateUser: (userId: string, payload: UpdateUserRequest): Promise<UserAccount> =>
    withMockFallback(
      async () => {
        const response = await identityClient.patch<IdentityEnvelope<IdentityUser>>(`/users/${userId}`, {
          email: normalizeEmail(payload.email),
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          phone: payload.phone.trim() || undefined,
        });
        const updated = toUserAccount(unwrapIdentity(response.data));
        if (updated.status === payload.status) return updated;
        assertStatusTransition(updated.status, payload.status);
        return patchStatus(userId, payload.status, 'Updated by administrator');
      },
      () => mockUserApi.updateUser(userId, payload),
      'The changes could not be saved.'
    ),

  // PATCH /users/{userId}/status
  updateStatus: (userId: string, status: AccountStatus, reason?: string): Promise<UserAccount> =>
    withMockFallback(
      () => patchStatus(userId, status, reason),
      () => mockUserApi.updateStatus(userId, status),
      'The account status could not be changed.'
    ),

  /** FR-IAM-027: an administrator cannot assign or remove their own roles. */
  assignRole: async (userId: string, role: SystemRole, actorUserId: string): Promise<UserAccount> => {
    if (userId === actorUserId) throw new Error(SELF_ROLE_CHANGE_ERROR);
    return withMockFallback(
      async () => {
        const user = await fetchUser(userId);
        if (user.roles.includes(role)) throw new Error(`${getRoleLabel(role)} is already assigned to this user.`);
        return replaceRoles(userId, [...user.roles, role]);
      },
      () => mockUserApi.assignRole(userId, role),
      'The role could not be assigned.'
    );
  },

  removeRole: async (userId: string, role: SystemRole, actorUserId: string): Promise<UserAccount> => {
    if (userId === actorUserId) throw new Error(SELF_ROLE_CHANGE_ERROR);
    return withMockFallback(
      async () => {
        const user = await fetchUser(userId);
        if (!user.roles.includes(role)) throw new Error(`${getRoleLabel(role)} is not assigned to this user.`);
        return replaceRoles(userId, user.roles.filter((r) => r !== role));
      },
      () => mockUserApi.removeRole(userId, role),
      'The role could not be removed.'
    );
  },
};
