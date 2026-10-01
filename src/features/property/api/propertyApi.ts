import type { ApiEnvelope } from '@/features/leases/types/lease.types';
import { unwrap } from '@/features/leases/api/leaseApi';
import { fetchAllPages, propertyClient } from './propertyClient';
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
  // PROP-001 — floors are created with the building and returned with their UUIDs.
  createBuilding: async (payload: CreateBuildingRequest): Promise<Building> => {
    const response = await propertyClient.post<ApiEnvelope<Building>>('/buildings', payload);
    return unwrap(response.data);
  },

  // PROP-003
  createUnitType: async (payload: CreateUnitTypeRequest): Promise<UnitType> => {
    const response = await propertyClient.post<ApiEnvelope<UnitType>>('/unit-types', payload);
    return unwrap(response.data);
  },

  // PROP-008
  getOwnerships: (lookup: OwnershipLookup): Promise<Ownership[]> =>
    fetchAllPages<Ownership>('/ownerships', lookup.by === 'unit' ? { unitId: lookup.unitId } : { ownerId: lookup.ownerId }),

  // PROP-007 — the owner is validated against Resident Management.
  createOwnership: async (payload: CreateOwnershipRequest): Promise<Ownership> => {
    const response = await propertyClient.post<ApiEnvelope<Ownership>>('/ownerships', payload);
    return unwrap(response.data);
  },
};
