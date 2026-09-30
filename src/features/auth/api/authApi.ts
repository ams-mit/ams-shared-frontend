import { isAxiosError } from 'axios';
import { apiClient } from '@/services/api/client';
import type { SelfRegistrationRole } from '@/features/users/types/user.types';
import type { User } from '../store/authSlice';
import { AuthError, authMockService } from './authMockService';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  mustChangePassword?: boolean;
}

/** identity-access-service RegisterRequest. */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
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

export { AuthError };

/** True when the backend could not be reached at all (as opposed to answering with an error). */
const isOffline = (err: unknown): boolean => isAxiosError(err) && !err.response;

/** Converts a backend error response into an AuthError with a user-facing message. */
const toAuthError = (err: unknown): AuthError => {
  if (isAxiosError(err) && err.response) {
    const data = err.response.data as { message?: string } | undefined;
    return new AuthError(err.response.status, data?.message || 'The request could not be completed.');
  }
  return err instanceof AuthError ? err : new AuthError(500, 'An unexpected error occurred.');
};

// Each call tries identity-access-service first and falls back to the offline mock
// only when the server is unreachable, so real 401/403/423 responses are never masked.
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/v1/auth/login', credentials);
      return response.data;
    } catch (err) {
      if (isOffline(err)) return authMockService.login(credentials.email, credentials.password);
      throw toAuthError(err);
    }
  },

  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>('/v1/auth/register', payload);
      return response.data;
    } catch (err) {
      if (isOffline(err)) return authMockService.register(payload);
      throw toAuthError(err);
    }
  },

  forceChangePassword: async ({ userId, newPassword }: ForceChangePasswordRequest): Promise<void> => {
    try {
      await apiClient.put('/v1/users/me/password', { newPassword, confirmPassword: newPassword });
    } catch (err) {
      if (isOffline(err)) return authMockService.completeForcedPasswordChange(userId, newPassword);
      throw toAuthError(err);
    }
  },
};

export default authApi;
