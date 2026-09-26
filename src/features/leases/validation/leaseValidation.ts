/**
 * AMSG2-53 — Frontend Date Validation Engine.
 *
 * Mirrors LeaseCreateRequest (@FutureOrPresent startDate, @Future endDate) and
 * LeaseService's endDate-after-startDate rule so bad input never reaches the server.
 * Overlap and multi-occupancy capacity (AMSG2-54/55) need live lease data, so those stay
 * server-side and surface as 409 OCCUPANCY_CONFLICT / 422 CAPACITY_LIMIT_EXCEEDED.
 */

export interface LeaseFormValues {
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  customNotes: string;
}

export type LeaseFieldErrors = Partial<Record<keyof LeaseFormValues, string>>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string): boolean => UUID_PATTERN.test(value.trim());

// Parse yyyy-MM-dd as a local calendar date; `new Date('2026-01-01')` would be UTC midnight
// and shift a day for users west of UTC.
const toLocalDay = (isoDate: string): number => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
};

const today = (): number => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

export const validateLeaseDates = (startDate: string, endDate: string): LeaseFieldErrors => {
  const errors: LeaseFieldErrors = {};

  if (!startDate) errors.startDate = 'Start date is required.';
  if (!endDate) errors.endDate = 'End date is required.';
  if (errors.startDate || errors.endDate) return errors;

  const start = toLocalDay(startDate);
  const end = toLocalDay(endDate);

  if (start < today()) errors.startDate = 'Start date cannot be in the past.';

  if (end <= start) errors.endDate = 'End date must be after the start date.';
  else if (end <= today()) errors.endDate = 'End date must be in the future.';

  return errors;
};

export const validateLeaseForm = (values: LeaseFormValues): LeaseFieldErrors => {
  const errors: LeaseFieldErrors = validateLeaseDates(values.startDate, values.endDate);

  if (!values.unitId.trim()) errors.unitId = 'Unit ID is required.';
  else if (!isUuid(values.unitId)) errors.unitId = 'Unit ID must be a valid UUID.';

  if (!values.tenantId.trim()) errors.tenantId = 'Tenant ID is required.';
  else if (!isUuid(values.tenantId)) errors.tenantId = 'Tenant ID must be a valid UUID.';

  return errors;
};

export const hasErrors = (errors: object): boolean => Object.values(errors).some(Boolean);

export const formatLeaseDuration = (startDate: string, endDate: string): string | null => {
  if (!startDate || !endDate) return null;
  const days = Math.round((toLocalDay(endDate) - toLocalDay(startDate)) / 86_400_000);
  if (days <= 0) return null;
  const months = Math.floor(days / 30);
  return months >= 1 ? `${days} days (~${months} month${months === 1 ? '' : 's'})` : `${days} days`;
};
