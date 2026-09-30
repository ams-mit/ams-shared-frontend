import type { ApiErrorInfo } from '@/services/api/apiError';

// Error codes raised by lease-occupancy-service's BusinessException hierarchy.
const TITLES: Record<string, string> = {
  OCCUPANCY_CONFLICT: 'Occupancy rule not satisfied',
  LEASE_DATE_CONFLICT: 'Dates overlap an active lease on this unit',
  LEASE_STATUS_TRANSITION_NOT_ALLOWED: 'Status change not allowed',
  OCCUPANCY_STATUS_TRANSITION_NOT_ALLOWED: 'Status change not allowed',
  LEASE_NOT_ACTIVE: 'Lease is not active',
  LEASE_NOT_FOUND: 'Lease not found',
  OCCUPANCY_NOT_FOUND: 'Occupancy not found',
  UNIT_NOT_FOUND: 'Unit not found',
  RESPONSIBLE_PARTY_NOT_FOUND: 'Resident is not a valid, active resident',
  RESIDENT_NOT_FOUND: 'Resident profile not found',
  BUSINESS_RULE_VIOLATION: 'Lease rule not satisfied',
  DEPENDENCY_UNAVAILABLE: 'A required service is unavailable',
  VALIDATION_ERROR: 'Please correct the highlighted fields',
  FORBIDDEN: 'Not permitted',
  PERMISSION_DENIED: 'Not permitted',
  UNAUTHORIZED: 'Not signed in',
  UNAUTHENTICATED: 'Not signed in',
};

export const leaseErrorTitle = (error: ApiErrorInfo): string =>
  (error.code && TITLES[error.code]) ||
  (error.status === 409 ? 'Conflict' : error.status === 422 ? 'Business rule violated' : 'Request failed');
