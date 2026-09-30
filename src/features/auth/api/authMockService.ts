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

/*
 * Offline stand-in for identity-access-service /api/v1/auth, used only when the
 * backend cannot be reached. It follows the service's rules:
 * - only ACTIVE accounts can sign in (403 otherwise)
 * - one generic message for any credential failure, so the response never reveals
 *   whether an email is registered (FR-IAM-017)
 * - 5 consecutive failures lock sign-in for 15 minutes (423)
 * - admin-created accounts must replace their temporary password on first sign-in
 */

export class AuthError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const INVALID_CREDENTIALS = 'Invalid email or password.';

const INACTIVE_MESSAGES: Partial<Record<UserAccount['status'], string>> = {
  PENDING_VERIFICATION: 'Your registration is waiting for administrator approval.',
  SUSPENDED: 'This account is suspended. Please contact the building administrator.',
  DEACTIVATED: 'This account has been deactivated. Please contact the building administrator.',
  REJECTED: 'This registration was not approved. Please contact the building administrator.',
};

/** Maps system roles to the four UI roles used for navigation and route guards. */
export const toAppRole = (roles: SystemRole[]): UserRole => {
  if (roles.includes('SYSTEM_ADMINISTRATOR') || roles.includes('APARTMENT_MANAGER')) return 'ADMIN';
  if (roles.includes('OWNER')) return 'OWNER';
  if (roles.includes('TENANT_RESIDENT')) return 'RESIDENT';
  return 'STAFF';
};

const toSessionUser = (account: UserAccount, mustChangePassword: boolean): User => ({
  id: account.id,
  name: `${account.firstName} ${account.lastName}`.trim(),
  firstName: account.firstName,
  lastName: account.lastName,
  email: account.email,
  phone: account.phone,
  role: toAppRole(account.roles),
  systemRole: account.roles[0],
  systemRoles: account.roles,
  mustChangePassword,
});

export const authMockService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    await mockDelay(350);
    const account = userMockStore.findByEmail(email);
    if (!account) throw new AuthError(401, INVALID_CREDENTIALS);

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
      throw new AuthError(401, INVALID_CREDENTIALS);
    }

    const inactiveMessage = INACTIVE_MESSAGES[account.status];
    if (inactiveMessage) throw new AuthError(403, inactiveMessage);

    userMockStore.update(account.id, { failedAttemptCount: 0, lockedUntil: undefined });
    const mustChangePassword = match === 'temporary' || Boolean(account.mustChangePassword);
    return {
      user: toSessionUser(account, mustChangePassword),
      token: `mock-jwt-${account.id}-${Date.now()}`,
      mustChangePassword,
    };
  },

  /** Self-registration creates a PENDING_VERIFICATION account that an administrator reviews. */
  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    await mockDelay();
    const email = normalizeEmail(payload.email);
    if (userMockStore.isEmailTaken(email)) {
      throw new AuthError(409, 'An account with this email address already exists.');
    }
    const passwordError = validatePasswordPolicy(payload.password);
    if (passwordError) throw new AuthError(400, passwordError);

    const created = userMockStore.insert(
      {
        id: `usr-${Date.now()}`,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email,
        phone: payload.phone?.trim() || undefined,
        roles: [],
        requestedRole: payload.requestedRole,
        status: 'PENDING_VERIFICATION',
        createdAt: new Date().toISOString(),
      },
      { password: payload.password }
    );
    return {
      message: 'Registration submitted. An administrator will review it before you can sign in.',
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
