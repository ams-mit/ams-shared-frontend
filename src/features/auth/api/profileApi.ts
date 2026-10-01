import { normalizeEmail } from '@/utils/validation';
import { mockDelay, userMockStore } from '@/features/users/api/userMockStore';
import { toUserAccount, type IdentityUser } from '@/features/users/api/identityUser';
import type { UserAccount } from '@/features/users/types/user.types';
import { residentProfileApi } from '@/features/residents/api/residentProfileApi';
import type { ResidentProfile } from '@/features/residents/types/profile.types';
import { ServiceError, isServiceOffline } from '@/services/api/standardClient';
import { tokenStorage } from '@/services/storage/tokenStorage';
import { validatePasswordPolicy } from '../validation/passwordValidation';
import { authApi } from './authApi';
import { identityClient, toIdentityError, unwrapIdentity, type IdentityEnvelope } from './identityClient';

// Self-service account operations for the signed-in user:
//   account       identity-access-service      GET /api/v1/auth/me
//   profile       resident-management-service  GET /api/v1/residents?userId=…, PATCH /residents/{id}
//   password      identity-access-service      PUT /api/v1/auth/me/password
//   email change  no endpoint yet — offline demo only
// Demo sessions, and an unreachable identity service, use the offline demo data.
//
// Gap: listing residents (the only way to find a profile id from a user id) is limited to
// SYSTEM_ADMINISTRATOR / APARTMENT_MANAGER, so other users can view but not edit their profile.

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
  if (!user) {
    throw new Error(
      tokenStorage.isDemoSession()
        ? 'Your profile could not be found. Please sign in again.'
        : 'Changing your email is not available yet: the resident management service has no email-change endpoint.'
    );
  }
  return user;
};

const SELF_LOOKUP_UNAVAILABLE =
  'Editing your profile is not available for your role yet: the resident management service only lets administrators and managers look up a profile. Ask the building administrator to update your details.';

/** The signed-in user's resident profile; 403 for roles that may not list residents. */
const findOwnResidentProfile = async (userId: string): Promise<ResidentProfile | null> => {
  const page = await residentProfileApi.list('RESIDENT', { userId, size: 1 });
  return page.items[0] ?? null;
};

const fetchMyAccount = async (): Promise<UserAccount> => {
  const response = await identityClient.get<IdentityEnvelope<IdentityUser>>('/auth/me');
  return toUserAccount(unwrapIdentity(response.data));
};

const mockGetMyProfile = async (session: SessionIdentity): Promise<UserAccount> => {
  await mockDelay();
  const existing = userMockStore.findById(session.userId);
  if (existing) return existing;
  // The demo persona switcher can select someone who is not in the seed data.
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
};

const mockChangePassword = async (userId: string, payload: ChangePasswordRequest): Promise<void> => {
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
};

const mockUpdateMyProfile = async (userId: string, payload: UpdateProfileRequest): Promise<UserAccount> => {
  await mockDelay();
  requireProfile(userId);
  return userMockStore.update(userId, {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    phone: payload.phone.trim() || undefined,
  }) as UserAccount;
};

export const profileApi = {
  /** The identity account, with name and phone from the resident profile when it can be read. */
  getMyProfile: async (session: SessionIdentity): Promise<UserAccount> => {
    if (tokenStorage.isDemoSession()) return mockGetMyProfile(session);
    let account: UserAccount;
    try {
      account = await fetchMyAccount();
    } catch (err) {
      if (isServiceOffline(err)) return mockGetMyProfile(session);
      throw toIdentityError(err, 'Your profile could not be loaded.');
    }
    try {
      const profile = await findOwnResidentProfile(account.id);
      if (profile) {
        return { ...account, firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone || undefined };
      }
    } catch {
      // No resident profile access for this role (or the service is down): show the account as is.
    }
    return account;
  },

  updateMyProfile: async (userId: string, payload: UpdateProfileRequest): Promise<UserAccount> => {
    if (tokenStorage.isDemoSession()) return mockUpdateMyProfile(userId, payload);
    let profile: ResidentProfile | null;
    try {
      profile = await findOwnResidentProfile(userId);
    } catch (err) {
      if (isServiceOffline(err)) return mockUpdateMyProfile(userId, payload);
      if (err instanceof ServiceError && err.status === 403) throw new ServiceError(403, SELF_LOOKUP_UNAVAILABLE, err.code);
      throw err;
    }
    if (!profile) {
      throw new ServiceError(404, 'You do not have a resident profile yet. Ask the building administrator to create one.');
    }
    await residentProfileApi.updateResident(profile.id, {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone.trim() || undefined,
    });
    return profileApi.getMyProfile({ userId, name: '', email: '' });
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

  /** PUT /auth/me/password — 400 INVALID_CREDENTIALS when the current password is wrong. */
  changePassword: (userId: string, payload: ChangePasswordRequest): Promise<void> =>
    authApi.changePassword(payload, () => mockChangePassword(userId, payload)),
};
