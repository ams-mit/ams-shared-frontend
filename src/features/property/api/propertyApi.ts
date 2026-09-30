import { apiClient } from '@/services/api/client';
import type {
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

};
