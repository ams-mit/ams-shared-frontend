import { apiClient } from '@/services/api/client';
import { leaseApi } from '@/features/leases/api/leaseApi';
import type { Lease } from '@/features/leases/types/lease.types';
import type {
  Building,
  CreateUnitRequest,
  Ownership,
  Unit,
  UnitStatus,
  UnitType,
  UpdateUnitStatusRequest,
} from '../types/unit.types';

const LEASE_HISTORY_PAGE_SIZE = 100;

export const unitApi = {
  getBuildings: async (): Promise<Building[]> => {
    const response = await apiClient.get<Building[]>('/buildings');
    return response.data;
  },

  getUnitTypes: async (): Promise<UnitType[]> => {
    const response = await apiClient.get<UnitType[]>('/unit-types');
    return response.data;
  },

  getUnits: async (): Promise<Unit[]> => {
    const response = await apiClient.get<Unit[]>('/units');
    return response.data;
  },

  createUnit: async (payload: CreateUnitRequest): Promise<Unit> => {
    const response = await apiClient.post<Unit>('/units', payload);
    return response.data;
  },

  updateStatus: async (unitId: number, newStatus: UnitStatus): Promise<Unit> => {
    const body: UpdateUnitStatusRequest = { newStatus };
    const response = await apiClient.patch<Unit>(`/units/${unitId}/status`, body);
    return response.data;
  },

  getOwnerships: async (unitId: number): Promise<Ownership[]> => {
    const response = await apiClient.get<Ownership[]>(`/ownerships/units/${unitId}`);
    return response.data;
  },

  // lease-occupancy-service has no unit filter on GET /leases, so the unit's history is
  // filtered client-side from the most recent page of leases.
  getLeaseHistory: async (unitId: number): Promise<Lease[]> => {
    const { leases } = await leaseApi.list({ size: LEASE_HISTORY_PAGE_SIZE });
    return leases
      .filter((lease) => lease.unitId === String(unitId))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  },
};
