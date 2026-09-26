/**
 * Unit contracts for property-unit-service.
 *
 * Verified: Building/Floor (GET /buildings), UnitType (GET /unit-types), Ownership
 * (GET /ownerships/units/{id}) on main, and the unit status state machine + PATCH
 * /units/{id}/status on feature/AMSG2-60 (unmerged).
 * Provisional: GET/POST /units do not exist yet and the Unit entity has no unit number,
 * so `Unit` below is the flat DTO the grid needs — agree it with the backend owner.
 */

export type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'UNDER_MAINTENANCE' | 'INACTIVE';

export const UNIT_STATUSES: UnitStatus[] = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'UNDER_MAINTENANCE', 'INACTIVE'];

// Mirrors UnitService.updateUnitStatus so the UI only ever offers legal transitions.
export const UNIT_STATUS_TRANSITIONS: Record<UnitStatus, UnitStatus[]> = {
  AVAILABLE: ['RESERVED'],
  RESERVED: ['OCCUPIED'],
  OCCUPIED: ['UNDER_MAINTENANCE', 'INACTIVE'],
  UNDER_MAINTENANCE: ['AVAILABLE'],
  INACTIVE: [],
};

export interface Unit {
  id: number;
  unitNumber: string;
  buildingId: number;
  floorNumber: number;
  unitTypeId: number;
  status: UnitStatus;
}

export interface CreateUnitRequest {
  unitNumber: string;
  buildingId: number;
  floorNumber: number;
  unitTypeId: number;
  status: UnitStatus;
}

export interface UpdateUnitStatusRequest {
  newStatus: UnitStatus;
}

export interface Floor {
  floorNumber: number;
  floorName?: string | null;
}

export interface Building {
  id: number;
  buildingCode: string;
  name: string;
  address: string;
  floors: Floor[];
}

export interface UnitType {
  id: number;
  typeName: string;
  baseRent: number;
  capacityLimit: number;
  amenitiesSummary?: string | null;
}

export interface Ownership {
  id: number;
  unitId: number;
  ownerId: string;
  sharePercentage: number;
  startDate: string;
  endDate?: string | null;
}
