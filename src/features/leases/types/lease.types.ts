/**
 * Mirrors lease-occupancy-service (ams-mit/lease-occupancy-service main): LeaseController,
 * LeaseResponse, LeaseCreateRequest and LeaseStatusUpdateRequest.
 */

export type LeaseStatus = 'DRAFT' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED';

export const LEASE_STATUSES: LeaseStatus[] = ['DRAFT', 'PENDING_ACTIVATION', 'ACTIVE', 'TERMINATED', 'EXPIRED'];

// Same rules as LeaseService.assertValidTransition — the UI only offers legal moves.
export const LEASE_TRANSITIONS: Record<LeaseStatus, LeaseStatus[]> = {
  DRAFT: ['PENDING_ACTIVATION', 'ACTIVE', 'TERMINATED'],
  PENDING_ACTIVATION: ['ACTIVE', 'TERMINATED'],
  ACTIVE: ['TERMINATED', 'EXPIRED'],
  TERMINATED: [],
  EXPIRED: [],
};

export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  status: LeaseStatus;
  customNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaseRequest {
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  customNotes?: string;
}

export interface UpdateLeaseStatusRequest {
  status: LeaseStatus;
  reason?: string;
}

export interface LeaseListFilters {
  status?: LeaseStatus;
  activeOn?: string;
  page?: number;
  size?: number;
}

export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** API-STANDARD-v1 response envelope returned by lease-occupancy-service. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: PaginationMeta | null;
  timestamp: string;
  requestId: string;
}
