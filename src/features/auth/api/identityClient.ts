import {
  GATEWAY_BASE_URL,
  ServiceError,
  createStandardClient,
  isServiceOffline,
  toServiceError,
  unwrapEnvelope,
  withMockFallback as withStandardFallback,
  type StandardEnvelope,
} from '@/services/api/standardClient';

/**
 * Axios instance for identity-access-service, reached through the central API gateway.
 * It is separate from the shared apiClient, which points at another service other features use.
 */
const baseURL = import.meta.env.VITE_IDENTITY_API_BASE_URL || GATEWAY_BASE_URL;

export const identityClient = createStandardClient(baseURL, [
  '/auth/login',
  '/auth/logout',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
]);

export interface IdentityPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IdentityEnvelope<T> extends StandardEnvelope<T> {
  pagination?: IdentityPagination;
}

export const unwrapIdentity = unwrapEnvelope;

/** The service caps page size at 100. */
export const IDENTITY_MAX_PAGE_SIZE = 100;

export const IdentityError = ServiceError;
export type IdentityError = ServiceError;

const IDENTITY_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_INACTIVE:
    'Your account is not active. New registrations must be activated by an administrator; otherwise contact the building administrator.',
  INVALID_RESET_TOKEN: 'This reset code is invalid, expired or already used. Request a new one and try again.',
  INVALID_TOKEN: 'Your session has expired. Please sign in again.',
  PERMISSION_DENIED: 'Your role does not have permission to perform this action.',
  USER_ALREADY_EXISTS: 'An account with this email address already exists.',
  USER_NOT_FOUND: 'This user account could not be found.',
  ROLE_NOT_FOUND: 'This role could not be found.',
  ROLE_CONFLICT: 'System role names cannot be changed.',
  ROLE_IN_USE: 'This role is assigned to users and cannot be deleted.',
  PERMISSION_NOT_FOUND: 'One or more of the selected permissions no longer exist.',
};

export const isIdentityOffline = isServiceOffline;

export const toIdentityError = (err: unknown, fallbackMessage: string): ServiceError =>
  toServiceError(err, fallbackMessage, IDENTITY_ERROR_MESSAGES);

export const withMockFallback = <T>(
  real: () => Promise<T>,
  mock: () => Promise<T>,
  fallbackMessage: string,
  publicEndpoint = false
): Promise<T> => withStandardFallback(real, mock, fallbackMessage, { codeMessages: IDENTITY_ERROR_MESSAGES, publicEndpoint });
