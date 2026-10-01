/**
 * AMSG2-53 — Frontend Date Validation Engine.
 *
 * Mirrors LeaseCreateRequest (unitId, startDate, endDate, at least one occupant, notes up to
 * 255 characters) and LeaseService's date rules so bad input never reaches the server. The
 * form is stricter than the service: new leases cannot start in the past. Overlap and
 * multi-occupancy capacity (AMSG2-54/55) need live lease data, so those stay server-side and
 * surface as 409 OCCUPANCY_CONFLICT.
 */

import { LEASE_TRANSITIONS, type Lease, type LeaseStatus } from '../types/lease.types';

export interface LeaseFormValues {
  unitId: string;
  /** Resident UUIDs separated by commas, spaces or new lines; the first is the primary tenant. */
  occupantIds: string;
  startDate: string;
  endDate: string;
  notes: string;
}

export const NOTES_MAX_LENGTH = 255;

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

  if (!values.unitId.trim()) errors.unitId = 'Select or enter a unit.';
  else if (!isUuid(values.unitId)) errors.unitId = 'Unit ID must be a valid UUID.';

  const residentIds = parseResidentIds(values.occupantIds);
  const invalid = residentIds.filter((id) => !isUuid(id));
  if (residentIds.length === 0) errors.occupantIds = 'Add at least one resident ID.';
  else if (invalid.length > 0) errors.occupantIds = `Not a valid UUID: ${invalid.join(', ')}`;

  if (values.notes.trim().length > NOTES_MAX_LENGTH) {
    errors.notes = `Notes must be ${NOTES_MAX_LENGTH} characters or fewer.`;
  }

  return errors;
};

/** Splits the occupant field into unique IDs, keeping the order they were entered in. */
export const parseResidentIds = (raw: string): string[] => [
  ...new Set(
    raw
      .split(/[\s,;]+/)
      .map((id) => id.trim())
      .filter(Boolean)
  ),
];

export const localToday = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/** LeaseService only activates a lease on a day inside its agreed period. */
export const availableLeaseTransitions = (lease: Lease, today = localToday()): LeaseStatus[] =>
  LEASE_TRANSITIONS[lease.status].filter(
    (status) => status !== 'ACTIVE' || (lease.startDate <= today && today <= lease.endDate)
  );

export const hasErrors = (errors: object): boolean => Object.values(errors).some(Boolean);

export const formatLeaseDuration = (startDate: string, endDate: string): string | null => {
  if (!startDate || !endDate) return null;
  const days = Math.round((toLocalDay(endDate) - toLocalDay(startDate)) / 86_400_000);
  if (days <= 0) return null;
  const months = Math.floor(days / 30);
  return months >= 1 ? `${days} days (~${months} month${months === 1 ? '' : 's'})` : `${days} days`;
};
