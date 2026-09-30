import type { SelfRegistrationRole } from './user.types';

/**
 * Review view of a self-registered account. In identity-access-service a registration
 * is a user with status PENDING_VERIFICATION; approving sets ACTIVE, rejecting sets REJECTED.
 */
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type RegistrationRole = SelfRegistrationRole;

export interface RegistrationRequest {
  /** The user id of the self-registered account. */
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  requestedRole: RegistrationRole;
  status: RegistrationStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface RegistrationListFilters {
  search: string;
  status: RegistrationStatus | 'ALL';
  requestedRole: RegistrationRole | 'ALL';
}
