/**
 * Mirrors lease-occupancy-service OccupancyController (LEASE-008 to LEASE-011):
 * OccupancyResponse, OccupancyCreateRequest and OccupancyStatusUpdateRequest.
 */

export type OccupancyStatus = 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

// Same rules as OccupancyService.assertValidTransition.
export const OCCUPANCY_TRANSITIONS: Record<OccupancyStatus, OccupancyStatus[]> = {
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['ENDED'],
  ENDED: [],
  CANCELLED: [],
};

export interface Occupancy {
  id: string;
  unitId: string;
  residentId: string;
  leaseId: string;
  status: OccupancyStatus;
  /** Move-in date. */
  startDate: string;
  /** Move-out date; null while the resident still lives there. */
  endDate: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOccupancyRequest {
  unitId: string;
  residentId: string;
  leaseId: string;
  startDate: string;
  notes?: string;
}

export interface UpdateOccupancyStatusRequest {
  status: OccupancyStatus;
  reason?: string;
  effectiveDate: string;
}

export interface UnitOccupancyFilters {
  status?: OccupancyStatus;
  includeHistory?: boolean;
  page?: number;
  size?: number;
}
