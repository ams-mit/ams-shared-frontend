/**
 * Mirrors lease-occupancy-service (ams-mit/lease-occupancy-service main, V3 canonical contract):
 * LeaseController, LeaseResponse, LeaseCreateRequest, LeaseStatusUpdateRequest and
 * LeaseHistoryResponse.
 */

export type LeaseStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED' | 'CANCELLED';

export const LEASE_STATUSES: LeaseStatus[] = ['DRAFT', 'PENDING', 'ACTIVE', 'TERMINATED', 'EXPIRED', 'CANCELLED'];

// Same rules as LeaseService.assertValidTransition — the UI only offers legal moves.
export const LEASE_TRANSITIONS: Record<LeaseStatus, LeaseStatus[]> = {
  DRAFT: ['PENDING', 'ACTIVE', 'CANCELLED'],
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['TERMINATED', 'EXPIRED'],
  TERMINATED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export interface Lease {
  id: string;
  unitId: string;
  startDate: string;
  endDate: string;
  status: LeaseStatus;
  notes?: string | null;
  /** Resident IDs on the lease; the first is the primary tenant. */
  occupants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaseRequest {
  unitId: string;
  startDate: string;
  endDate: string;
  occupants: { residentId: string }[];
  notes?: string;
}

export interface UpdateLeaseStatusRequest {
  status: LeaseStatus;
  reason?: string;
}

export interface LeaseListFilters {
  unitId?: string;
  residentId?: string;
  ownerId?: string;
  status?: LeaseStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface LeaseHistoryItem {
  status: LeaseStatus;
  changedAt: string;
  changedBy: string;
  reason: string | null;
}

export interface LeaseHistory {
  leaseId: string;
  history: LeaseHistoryItem[];
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
