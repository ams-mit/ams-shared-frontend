import { USE_MOCK_DATA } from '@/services/mock/mockMode';
import { mockOccupancyApi } from '@/services/mock/propertyLeaseMock';
import { leaseClient } from '@/features/leases/api/leaseClient';
import { unwrap } from '@/features/leases/api/leaseApi';
import type { ApiEnvelope } from '@/features/leases/types/lease.types';
import type {
  CreateOccupancyRequest,
  Occupancy,
  UnitOccupancyFilters,
  UpdateOccupancyStatusRequest,
} from '../types/occupancy.types';

const realOccupancyApi = {
  // LEASE-008 — the lease must already be ACTIVE and list the resident as an occupant.
  register: async (payload: CreateOccupancyRequest): Promise<Occupancy> => {
    const response = await leaseClient.post<ApiEnvelope<Occupancy>>('/occupancies', payload);
    return unwrap(response.data);
  },

  // LEASE-009 — current occupants only unless includeHistory is set.
  forUnit: async (unitId: string, filters: UnitOccupancyFilters = {}): Promise<Occupancy[]> => {
    const response = await leaseClient.get<ApiEnvelope<Occupancy[]>>(`/occupancies/units/${unitId}`, {
      params: filters,
    });
    return response.data.data ?? [];
  },

  // LEASE-010
  forResident: async (residentId: string): Promise<Occupancy[]> => {
    const response = await leaseClient.get<ApiEnvelope<Occupancy[]>>(`/occupancies/residents/${residentId}`);
    return response.data.data ?? [];
  },

  // LEASE-011 — ENDED records the move-out on effectiveDate.
  updateStatus: async (occupancyId: string, payload: UpdateOccupancyStatusRequest): Promise<Occupancy> => {
    const response = await leaseClient.patch<ApiEnvelope<Occupancy>>(`/occupancies/${occupancyId}/status`, payload);
    return unwrap(response.data);
  },
};

/** Demo build: answers from browser-stored mock data (see services/mock). */
export const occupancyApi: typeof realOccupancyApi = USE_MOCK_DATA ? mockOccupancyApi : realOccupancyApi;
