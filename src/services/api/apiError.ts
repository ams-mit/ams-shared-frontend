import axios from 'axios';
import { tokenStorage } from '@/services/storage/tokenStorage';

export interface ApiErrorInfo {
  status?: number;
  code?: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

const STATUS_MESSAGES: Record<number, string> = {
  401: 'You are not signed in, or your session has expired.',
  403: 'Your role does not have permission to perform this action.',
  404: 'The requested record could not be found.',
  503: 'A service this action depends on is currently unavailable. Please try again shortly.',
};

interface ErrorBody {
  message?: unknown;
  code?: unknown;
  error?: unknown;
  errorCode?: unknown;
  path?: unknown;
}

// `details` is either a list of { field, message } (identity-access-service) or a
// { field: message } map (resident-management-service).
const readFieldErrors = (details: unknown): Record<string, string> | undefined => {
  if (typeof details !== 'object' || details === null) return undefined;
  const entries = Array.isArray(details)
    ? details
        .filter((d): d is { field: string; message: string } =>
          typeof d === 'object' && d !== null && typeof d.field === 'string' && typeof d.message === 'string'
        )
        .map((d) => [d.field, d.message] as const)
    : Object.entries(details).filter((entry): entry is [string, string] => typeof entry[1] === 'string');
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

/**
 * Normalizes the error bodies AMS services return into one serializable shape:
 *   API-STANDARD-v1 envelope   { message, error: { code, details } }  (gateway, lease-occupancy)
 *   ErrorResponse              { errorCode, message }                  (property-unit handlers)
 *   ad-hoc                     { error: "message" }                     (property-unit UnitController)
 *   Spring Boot default        { status, error: "Reason Phrase", path }
 */
export const toApiError = (err: unknown, fallbackMessage: string): ApiErrorInfo => {
  // Errors raised by the demo-mode mocks (ServiceError) already carry status, code and fields.
  if (err instanceof Error && typeof (err as { status?: unknown }).status === 'number') {
    const known = err as Error & { status: number; code?: string; fieldErrors?: Record<string, string> };
    return { status: known.status, code: known.code, message: known.message, fieldErrors: known.fieldErrors };
  }
  if (!axios.isAxiosError(err)) {
    return { message: err instanceof Error ? err.message : fallbackMessage };
  }
  if (!err.response) {
    return { message: 'Cannot reach the server. Check that the API gateway is running.' };
  }

  const { status } = err.response;
  const body = (err.response.data ?? {}) as ErrorBody;
  const nestedError =
    typeof body.error === 'object' && body.error !== null
      ? (body.error as { code?: unknown; details?: unknown })
      : undefined;

  const code = [nestedError?.code, body.errorCode, body.code].find((c): c is string => typeof c === 'string');

  // A string `error` is a real message only when it isn't Spring's default body (which carries `path`
  // and just repeats the HTTP reason phrase).
  const adHocMessage = typeof body.error === 'string' && body.path === undefined ? body.error : undefined;
  const bodyMessage =
    typeof body.message === 'string' && body.message.trim() ? body.message : adHocMessage?.trim() || undefined;

  if (status === 401 && tokenStorage.isDemoSession()) {
    return {
      status,
      code,
      message:
        'You are signed in with offline demo data, which this service does not accept. Sign in again once the identity service is running.',
    };
  }

  return {
    status,
    code,
    message: bodyMessage ?? STATUS_MESSAGES[status] ?? fallbackMessage,
    fieldErrors: readFieldErrors(nestedError?.details),
  };
};
