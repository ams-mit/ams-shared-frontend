import type { ApiErrorInfo } from '@/services/api/apiError';

const TITLES: Record<string, string> = {
  OCCUPANCY_CONFLICT: 'Lease dates overlap an existing lease',
  CAPACITY_LIMIT_EXCEEDED: 'Unit is at full occupancy capacity',
  BUSINESS_RULE_VIOLATION: 'Lease rule not satisfied',
  RESOURCE_NOT_FOUND: 'Unit not found',
  DEPENDENCY_UNAVAILABLE: 'A required service is unavailable',
  VALIDATION_ERROR: 'Please correct the highlighted fields',
  INVALID_LEASE_STATUS: 'Status change not allowed',
  PERMISSION_DENIED: 'Not permitted',
  UNAUTHORIZED: 'Not signed in',
  UNAUTHENTICATED: 'Not signed in',
};

export const leaseErrorTitle = (error: ApiErrorInfo): string =>
  (error.code && TITLES[error.code]) ||
  (error.status === 409 ? 'Conflict' : error.status === 422 ? 'Business rule violated' : 'Request failed');
