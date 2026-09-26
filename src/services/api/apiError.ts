import axios from 'axios';

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

const readFieldErrors = (details: unknown): Record<string, string> | undefined => {
  if (!Array.isArray(details)) return undefined;
  const entries = details
    .filter((d): d is { field: string; message: string } =>
      typeof d === 'object' && d !== null && typeof d.field === 'string' && typeof d.message === 'string'
    )
    .map((d) => [d.field, d.message] as const);
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

  return {
    status,
    code,
    message: bodyMessage ?? STATUS_MESSAGES[status] ?? fallbackMessage,
    fieldErrors: readFieldErrors(nestedError?.details),
  };
};
