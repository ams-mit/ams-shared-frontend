import type { SelfRegistrationRole } from '@/features/users/types/user.types';
import { toUserAccount, type IdentityUser } from '@/features/users/api/identityUser';
import { tokenStorage } from '@/services/storage/tokenStorage';
import type { User } from '../store/authSlice';
import { AuthError, authMockService, toSessionUser } from './authMockService';
import {
  identityClient,
  isIdentityOffline,
  toIdentityError,
  unwrapIdentity,
  withMockFallback,
  type IdentityEnvelope,
} from './identityClient';

// identity-access-service /api/v1/auth. Each call tries the service first and falls back
// to the offline mock only when it is unreachable, so real 4xx responses are never masked.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  mustChangePassword?: boolean;
}

/** Form values of the self-registration page. */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  /**
   * Shown on the form only. The service always assigns TENANT_RESIDENT to self-registrations,
   * so this is not sent; an administrator grants OWNER through the role editor.
   */
  requestedRole: SelfRegistrationRole;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
  id?: string;
}

export interface ForceChangePasswordRequest {
  userId: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface LoginData {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: IdentityUser;
}

export { AuthError };

const REGISTERED_MESSAGE = 'Registration submitted. An administrator must activate your account before you can sign in.';

const OFFLINE_MESSAGE = 'Cannot reach the identity service right now. Please try again later.';

export const authApi = {
  // POST /auth/login — the service signs in by username; accounts use their email as username.
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    withMockFallback(
      async () => {
        const response = await identityClient.post<IdentityEnvelope<LoginData>>('/auth/login', {
          username: credentials.email,
          password: credentials.password,
        });
        const data = unwrapIdentity(response.data);
        return { user: toSessionUser(toUserAccount(data.user)), token: data.token };
      },
      () => authMockService.login(credentials.email, credentials.password),
      'Sign-in failed. Please try again.',
      true
    ),

  // GET /auth/me — restores the signed-in user from a stored token.
  me: (token: string): Promise<User> =>
    withMockFallback(
      async () => {
        const response = await identityClient.get<IdentityEnvelope<IdentityUser>>('/auth/me');
        return toSessionUser(toUserAccount(unwrapIdentity(response.data)));
      },
      () => authMockService.me(token),
      'Your profile could not be loaded.'
    ),

  // POST /auth/logout — 204. The JWT is stateless, so this only informs the service; the
  // caller clears local state regardless of the outcome. The token is read here because the
  // caller clears it from storage straight after.
  logout: async (): Promise<void> => {
    const token = tokenStorage.getToken();
    if (!token || tokenStorage.isDemoSession()) return;
    try {
      await identityClient.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // Signing out locally still succeeds.
    }
  },

  // POST /auth/register — 201; the account is INACTIVE with TENANT_RESIDENT until activated.
  register: (payload: RegisterRequest): Promise<RegisterResponse> =>
    withMockFallback(
      async () => {
        const response = await identityClient.post<IdentityEnvelope<IdentityUser | null>>('/auth/register', {
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          email: payload.email.trim(),
          phone: payload.phone?.trim() || undefined,
          password: payload.password,
          confirmPassword: payload.confirmPassword,
        });
        return { message: REGISTERED_MESSAGE, id: response.data.data?.id };
      },
      () => authMockService.register(payload),
      'Registration failed. Please try again.',
      true
    ),

  // POST /auth/forgot-password — always 200 so the response never reveals whether the email exists.
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await identityClient.post('/auth/forgot-password', { email: email.trim() });
    } catch (err) {
      throw isIdentityOffline(err)
        ? new AuthError(503, OFFLINE_MESSAGE)
        : toIdentityError(err, 'The reset request could not be sent.');
    }
  },

  // POST /auth/reset-password — 400 INVALID_RESET_TOKEN when the token is invalid or expired.
  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    try {
      await identityClient.post('/auth/reset-password', payload);
    } catch (err) {
      throw isIdentityOffline(err)
        ? new AuthError(503, OFFLINE_MESSAGE)
        : toIdentityError(err, 'Your password could not be reset.');
    }
  },

  // PUT /auth/me/password — 204; 400 INVALID_CREDENTIALS when the current password is wrong.
  changePassword: (
    payload: { currentPassword: string; newPassword: string },
    offlineFallback: () => Promise<void>
  ): Promise<void> =>
    withMockFallback(
      async () => {
        await identityClient.put('/auth/me/password', {
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
          confirmNewPassword: payload.newPassword,
        });
      },
      offlineFallback,
      'Your password could not be changed.'
    ).catch((err: unknown) => {
      throw err instanceof AuthError && err.code === 'INVALID_CREDENTIALS'
        ? new AuthError(400, 'Your current password is incorrect.', err.code)
        : err;
    }),

  /**
   * Replaces a temporary password at first sign-in. The identity service has no forced-change
   * flag, so only accounts from the offline mock reach this screen.
   */
  forceChangePassword: ({ userId, newPassword }: ForceChangePasswordRequest): Promise<void> =>
    authMockService.completeForcedPasswordChange(userId, newPassword),
};

export default authApi;
