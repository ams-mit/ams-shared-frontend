/**
 * property-unit-service request contracts for buildings, unit types and ownerships
 * (canonical PROP-001/003/007). Response types are shared with the units feature so there is
 * one definition of each.
 */
export type { Building, Floor, Ownership, UnitType } from '@/features/units/types/unit.types';

export interface CreateFloorRequest {
  floorNumber: number;
  name?: string;
  description?: string;
}

export interface CreateBuildingRequest {
  buildingCode: string;
  name: string;
  address: string;
  description?: string;
  floors: CreateFloorRequest[];
}

export interface CreateUnitTypeRequest {
  code: string;
  name: string;
  description?: string;
  capacity: number;
}

export interface CreateOwnershipRequest {
  unitId: string;
  ownerId: string;
  ownershipPercentage: number;
  startDate: string;
  endDate?: string | null;
}

export type OwnershipLookup = { by: 'unit'; unitId: string } | { by: 'owner'; ownerId: string };
