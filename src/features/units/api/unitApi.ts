import { apiClient } from '@/services/api/client';
import { leaseApi } from '@/features/leases/api/leaseApi';
import type { Lease } from '@/features/leases/types/lease.types';
import type {
  Building,
  CreateUnitRequest,
  Unit,
  UnitType,
} from '../types/unit.types';

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

  getLeaseHistory: async (unitId: string): Promise<Lease[]> =>
    leaseApi.forUnit(unitId),
};
