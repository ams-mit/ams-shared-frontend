import type { UserRole } from '@/constants/roles';
import { normalizeEmail } from '@/utils/validation';
import { mockDelay, userMockStore } from '@/features/users/api/userMockStore';
import {
  LOCKOUT_DURATION_MINUTES,
  LOCKOUT_MAX_FAILED_ATTEMPTS,
  isAccountLocked,
} from '@/features/users/constants/accountStatus';
import type { SystemRole, UserAccount } from '@/features/users/types/user.types';
import type { User } from '../store/authSlice';
import { validatePasswordPolicy } from '../validation/passwordValidation';
import type { LoginResponse, RegisterRequest, RegisterResponse } from './authApi';
import { IdentityError } from './identityClient';
import { DEMO_TOKEN_PREFIX } from '@/services/storage/tokenStorage';

/*
 * Offline stand-in for identity-access-service /api/v1/auth, used only when the
 * backend cannot be reached. It follows the service's rules:
 * - only ACTIVE accounts can sign in (403 ACCOUNT_INACTIVE otherwise)
 * - one generic message for any credential failure, so the response never reveals
 *   whether an email is registered (400 INVALID_CREDENTIALS)
 * - 5 consecutive failures lock sign-in for 15 minutes (423)
 * - admin-created accounts must replace their temporary password on first sign-in
 */

/** Same error type the real API calls throw, so pages handle both paths identically. */
export const AuthError = IdentityError;
export type AuthError = IdentityError;

const INVALID_CREDENTIALS = 'Invalid email or password.';

const INACTIVE_MESSAGES: Partial<Record<UserAccount['status'], string>> = {
  INACTIVE:
    'Your account is not active. New registrations must be activated by an administrator; otherwise contact the building administrator.',
  SUSPENDED: 'This account is suspended. Please contact the building administrator.',
};

const MOCK_TOKEN_PREFIX = DEMO_TOKEN_PREFIX;

/** Maps system roles to the four UI roles used for navigation and route guards. */
export const toAppRole = (roles: SystemRole[]): UserRole => {
  if (roles.includes('SYSTEM_ADMINISTRATOR') || roles.includes('APARTMENT_MANAGER')) return 'ADMIN';
  if (roles.includes('OWNER')) return 'OWNER';
  if (roles.includes('TENANT_RESIDENT')) return 'RESIDENT';
  return 'STAFF';
};

export const toSessionUser = (account: UserAccount, mustChangePassword = false): User => ({
  id: account.id,
  name: `${account.firstName} ${account.lastName}`.trim(),
  firstName: account.firstName,
  lastName: account.lastName,
  email: account.email,
  phone: account.phone,
  role: toAppRole(account.roles),
  systemRole: account.roles[0],
  systemRoles: account.roles,
  accountStatus: account.status,
  mustChangePassword,
});

export const authMockService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    await mockDelay(350);
    const account = userMockStore.findByEmail(email);
    if (!account) throw new AuthError(400, INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');

    if (isAccountLocked(account)) {
      throw new AuthError(
        423,
        `Too many failed sign-in attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`
      );
    }

    const match = userMockStore.matchPassword(account.id, password);
    if (!match) {
      const failedAttemptCount = (account.failedAttemptCount ?? 0) + 1;
      const locks = failedAttemptCount >= LOCKOUT_MAX_FAILED_ATTEMPTS;
      userMockStore.update(account.id, {
        failedAttemptCount,
        lockedUntil: locks ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60_000).toISOString() : undefined,
      });
      if (locks) {
        throw new AuthError(
          423,
          `Too many failed sign-in attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`
        );
      }
      throw new AuthError(400, INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');
    }

    const inactiveMessage = INACTIVE_MESSAGES[account.status];
    if (inactiveMessage) throw new AuthError(403, inactiveMessage, 'ACCOUNT_INACTIVE');

    userMockStore.update(account.id, { failedAttemptCount: 0, lockedUntil: undefined });
    const mustChangePassword = match === 'temporary' || Boolean(account.mustChangePassword);
    return {
      user: toSessionUser(account, mustChangePassword),
      token: `${MOCK_TOKEN_PREFIX}${account.id}-${Date.now()}`,
      mustChangePassword,
    };
  },

  /** GET /auth/me for a mock session token (`mock-jwt-<userId>-<timestamp>`). */
  me: async (token: string): Promise<User> => {
    await mockDelay(150);
    // A real token can't be checked offline; keep the session until the service is back.
    if (!token.startsWith(MOCK_TOKEN_PREFIX)) {
      throw new AuthError(503, 'Cannot reach the identity service to restore your session.');
    }
    const userId = token.slice(MOCK_TOKEN_PREFIX.length).replace(/-\d+$/, '');
    const account = userMockStore.findById(userId);
    if (!account || account.status !== 'ACTIVE') {
      throw new AuthError(401, 'Your session has expired. Please sign in again.', 'INVALID_TOKEN');
    }
    return toSessionUser(account, Boolean(account.mustChangePassword));
  },

  /** Self-registration creates an INACTIVE account that an administrator reviews. */
  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    await mockDelay();
    const email = normalizeEmail(payload.email);
    if (userMockStore.isEmailTaken(email)) {
      throw new AuthError(409, 'An account with this email address already exists.', 'USER_ALREADY_EXISTS');
    }
    const passwordError = validatePasswordPolicy(payload.password);
    if (passwordError) throw new AuthError(400, passwordError, 'VALIDATION_ERROR');

    const created = userMockStore.insert(
      {
        id: `usr-${Date.now()}`,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email,
        phone: payload.phone?.trim() || undefined,
        roles: [],
        requestedRole: payload.requestedRole,
        status: 'INACTIVE',
        createdAt: new Date().toISOString(),
      },
      { password: payload.password }
    );
    return {
      message: 'Registration submitted. An administrator must activate your account before you can sign in.',
      id: created.id,
    };
  },

  /** Replaces the temporary password after first sign-in. */
  completeForcedPasswordChange: async (userId: string, newPassword: string): Promise<void> => {
    await mockDelay();
    const passwordError = validatePasswordPolicy(newPassword, 'New password');
    if (passwordError) throw new AuthError(400, passwordError);
    if (userMockStore.matchPassword(userId, newPassword)) {
      throw new AuthError(400, 'Choose a password different from your temporary password.');
    }
    userMockStore.setPassword(userId, newPassword);
  },
};
