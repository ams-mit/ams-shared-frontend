import { normalizeEmail } from '@/utils/validation';
import { mockDelay, userMockStore } from '@/features/users/api/userMockStore';
import type { UserAccount } from '@/features/users/types/user.types';
import { validatePasswordPolicy } from '../validation/passwordValidation';

// Self-service account operations for the signed-in user:
//   profile       resident-management-service GET/PUT /api/v1/profiles/me
//   email change  resident-management-service POST /profiles/me/email-change, PUT .../confirm
//   password      identity-access-service     PUT /api/v1/users/me/password
// Mock implementation for the UI-only phase. The real endpoints identify the user
// from the session token, so `userId` will be dropped during API/Gateway integration.

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** The signed-in user as known to the auth state. */
export interface SessionIdentity {
  userId: string;
  name: string;
  email: string;
}

export interface EmailChangeRequested {
  profile: UserAccount;
  /**
   * Mock only: the verification code that the real service emails to the new
   * address. Exposed here so the flow can be demonstrated without an inbox.
   */
  mockVerificationCode: string;
}

// Mock-only: outstanding email verification codes by user id.
const verificationCodes = new Map<string, string>();

const createVerificationCode = (): string => String(Math.floor(100000 + Math.random() * 900000));

const requireProfile = (userId: string): UserAccount => {
  const user = userMockStore.findById(userId);
  if (!user) throw new Error('Your profile could not be found. Please sign in again.');
  return user;
};

export const profileApi = {
  getMyProfile: async (session: SessionIdentity): Promise<UserAccount> => {
    await mockDelay();
    const existing = userMockStore.findById(session.userId);
    if (existing) return existing;
    // Mock only: the demo persona switcher can select someone who is not in the seed data.
    // The real /profiles/me endpoint always returns the signed-in account.
    const [firstName, ...rest] = session.name.trim().split(/\s+/);
    return userMockStore.insert(
      {
        id: session.userId,
        firstName: firstName || session.email,
        lastName: rest.join(' '),
        email: session.email,
        roles: [],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {}
    );
  },

  updateMyProfile: async (userId: string, payload: UpdateProfileRequest): Promise<UserAccount> => {
    await mockDelay();
    requireProfile(userId);
    return userMockStore.update(userId, {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone.trim() || undefined,
    }) as UserAccount;
  },

  /** 202 Accepted: a code is sent to the new address; the email only changes once confirmed. */
  requestEmailChange: async (userId: string, newEmail: string): Promise<EmailChangeRequested> => {
    await mockDelay();
    const user = requireProfile(userId);
    const email = normalizeEmail(newEmail);
    if (email === user.email.toLowerCase()) {
      throw new Error('The new email address is the same as your current email.');
    }
    if (userMockStore.isEmailTaken(email, userId)) {
      throw new Error('This email address is already used by another account.');
    }
    const code = createVerificationCode();
    verificationCodes.set(userId, code);
    const profile = userMockStore.update(userId, { pendingEmail: email }) as UserAccount;
    return { profile, mockVerificationCode: code };
  },

  resendEmailVerification: async (userId: string): Promise<string> => {
    await mockDelay();
    const user = requireProfile(userId);
    if (!user.pendingEmail) throw new Error('There is no pending email change to verify.');
    const code = createVerificationCode();
    verificationCodes.set(userId, code);
    return code;
  },

  confirmEmailChange: async (userId: string, verificationToken: string): Promise<UserAccount> => {
    await mockDelay();
    const user = requireProfile(userId);
    if (!user.pendingEmail) throw new Error('There is no pending email change to verify.');
    if (verificationCodes.get(userId) !== verificationToken.trim()) {
      throw new Error('The verification code is invalid or has expired. Request a new code and try again.');
    }
    if (userMockStore.isEmailTaken(user.pendingEmail, userId)) {
      throw new Error('This email address is now used by another account.');
    }
    verificationCodes.delete(userId);
    return userMockStore.update(userId, { email: user.pendingEmail, pendingEmail: undefined }) as UserAccount;
  },

  cancelEmailChange: async (userId: string): Promise<UserAccount> => {
    await mockDelay();
    requireProfile(userId);
    verificationCodes.delete(userId);
    return userMockStore.update(userId, { pendingEmail: undefined }) as UserAccount;
  },

  /** PUT /users/me/password — 401 when the current password is wrong. */
  changePassword: async (userId: string, payload: ChangePasswordRequest): Promise<void> => {
    await mockDelay(700);
    requireProfile(userId);
    if (userMockStore.matchPassword(userId, payload.currentPassword) === null) {
      throw new Error('Your current password is incorrect.');
    }
    const policyError = validatePasswordPolicy(payload.newPassword, 'New password');
    if (policyError) throw new Error(policyError);
    if (payload.newPassword === payload.currentPassword) {
      throw new Error('New password must be different from your current password.');
    }
    userMockStore.setPassword(userId, payload.newPassword);
  },
};
