import axios, { isAxiosError, type AxiosError, type AxiosInstance } from 'axios';
import { requestInterceptor, responseErrorInterceptor } from './interceptors';
import { toApiError } from './apiError';
import { tokenStorage } from '@/services/storage/tokenStorage';

// Shared plumbing for services that follow the Project A API standard (Group 1's
// identity-access-service and resident-management-service): the success/error envelope,
// X-Request-ID tracing, readable error codes, and the offline demo fallback.

/**
 * The central API gateway that routes every Group 1 service under one /api/v1 base. A
 * service-specific variable (e.g. VITE_IDENTITY_API_BASE_URL) overrides it, e.g. to call a
 * service directly while developing it.
 */
export const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_BASE_URL || 'http://localhost:8080/api/v1';

const newRequestId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

/**
 * Creates an axios instance with the shared auth header and 401 handling, plus an
 * X-Request-ID on every request. A 401 from a `sessionlessPaths` endpoint (login, register…)
 * is not a session expiry, so it skips the global sign-out redirect.
 */
export const createStandardClient = (baseURL: string, sessionlessPaths: string[] = []): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    timeout: 10000,
  });
  client.interceptors.request.use((config) => {
    config.headers.set('X-Request-ID', newRequestId());
    return requestInterceptor(config);
  });
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) =>
      sessionlessPaths.some((path) => error.config?.url?.endsWith(path))
        ? Promise.reject(error)
        : responseErrorInterceptor(error)
  );
  return client;
};

export interface StandardEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
}

export const unwrapEnvelope = <T>(envelope: StandardEnvelope<T>): T => {
  if (envelope.data === null || envelope.data === undefined) {
    throw new Error(envelope.message || 'The server returned an empty response.');
  }
  return envelope.data;
};

/** Error raised for service failures, carrying the HTTP status and error code. */
export class ServiceError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string>;
  constructor(status: number, message: string, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * True when the service could not be reached: no response at all, or the gateway reporting
 * that the owning service is down (503 DEPENDENCY_UNAVAILABLE), as opposed to the service
 * answering with an error.
 */
export const isServiceOffline = (err: unknown): boolean => {
  if (!isAxiosError(err)) return false;
  if (!err.response) return true;
  const body = err.response.data as { error?: { code?: unknown } } | undefined;
  return err.response.status === 503 && body?.error?.code === 'DEPENDENCY_UNAVAILABLE';
};

/** Converts an error response into a ServiceError, preferring the message for its error code. */
export const toServiceError = (
  err: unknown,
  fallbackMessage: string,
  codeMessages: Record<string, string> = {}
): ServiceError => {
  if (err instanceof ServiceError) return err;
  const info = toApiError(err, fallbackMessage);
  const fieldMessages = info.fieldErrors ? Object.values(info.fieldErrors) : [];
  const message =
    (info.code && codeMessages[info.code]) ||
    (info.code === 'VALIDATION_ERROR' && fieldMessages.length > 0 ? fieldMessages.join(' ') : info.message);
  return new ServiceError(info.status ?? 500, message, info.code, info.fieldErrors);
};

export interface FallbackOptions {
  codeMessages?: Record<string, string>;
  /** Public endpoints (login, register) are tried for real even during a demo session. */
  publicEndpoint?: boolean;
}

/**
 * Calls the real service and falls back to offline demo data only when the service is
 * unreachable, so real 4xx/5xx responses are never masked by mock data. A demo session's
 * token is rejected by every real service, so its authenticated calls use demo data directly.
 */
export const withMockFallback = async <T>(
  real: () => Promise<T>,
  mock: () => Promise<T>,
  fallbackMessage: string,
  { codeMessages = {}, publicEndpoint = false }: FallbackOptions = {}
): Promise<T> => {
  if (!publicEndpoint && tokenStorage.isDemoSession()) return mock();
  try {
    return await real();
  } catch (err) {
    if (isServiceOffline(err)) return mock();
    throw toServiceError(err, fallbackMessage, codeMessages);
  }
};
