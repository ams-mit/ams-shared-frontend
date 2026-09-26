/**
 * Property-unit-service request/response contracts for buildings, unit types and ownerships
 * (verified against ams-mit/property-unit-service main). Building, Floor, UnitType and
 * Ownership are shared with the units feature so there is one definition of each.
 */
import type { Floor, UnitType } from '@/features/units/types/unit.types';
import type { LeaseStatus } from '@/features/leases/types/lease.types';

export type { Building, Floor, Ownership, UnitType } from '@/features/units/types/unit.types';

export interface CreateBuildingRequest {
  buildingCode: string;
  name: string;
  address: string;
  floors: Floor[];
}

export type CreateUnitTypeRequest = Omit<UnitType, 'id'>;

export interface CreateOwnershipRequest {
  unitId: number;
  ownerId: string;
  sharePercentage: number;
  startDate: string;
  endDate?: string | null;
}

export type OwnershipLookup = { by: 'unit'; unitId: number } | { by: 'owner'; ownerId: string };

/** lease-occupancy-service GET /units/{unitId}/active-occupancy (ActiveOccupancyResponse). */
export interface ActiveOccupancy {
  unitId: string;
  leaseId: string;
  occupantId: string;
  tenantId: string;
  ownerId: string | null;
  startDate: string;
  endDate: string;
  status: LeaseStatus;
  occupantIds: string[];
}
