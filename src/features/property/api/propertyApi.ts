import { apiClient } from '@/services/api/client';
import type { ApiEnvelope } from '@/features/leases/types/lease.types';
import type {
  ActiveOccupancy,
  Building,
  CreateBuildingRequest,
  CreateOwnershipRequest,
  CreateUnitTypeRequest,
  Ownership,
  OwnershipLookup,
  UnitType,
} from '../types/property.types';

export const propertyApi = {
  createBuilding: async (payload: CreateBuildingRequest): Promise<Building> => {
    const response = await apiClient.post<Building>('/buildings', payload);
    return response.data;
  },

  createUnitType: async (payload: CreateUnitTypeRequest): Promise<UnitType> => {
    const response = await apiClient.post<UnitType>('/unit-types', payload);
    return response.data;
  },

  getOwnerships: async (lookup: OwnershipLookup): Promise<Ownership[]> => {
    const path =
      lookup.by === 'unit'
        ? `/ownerships/units/${lookup.unitId}`
        : `/ownerships/owners/${encodeURIComponent(lookup.ownerId)}`;
    const response = await apiClient.get<Ownership[]>(path);
    return response.data;
  },

  createOwnership: async (payload: CreateOwnershipRequest): Promise<Ownership> => {
    const response = await apiClient.post<Ownership>('/ownerships', payload);
    return response.data;
  },

  getActiveOccupancy: async (unitId: string): Promise<ActiveOccupancy> => {
    const response = await apiClient.get<ApiEnvelope<ActiveOccupancy>>(`/units/${unitId}/active-occupancy`);
    if (!response.data.data) throw new Error(response.data.message || 'No active occupancy returned.');
    return response.data.data;
  },
};
