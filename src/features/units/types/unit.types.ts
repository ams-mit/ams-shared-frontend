/**
 * property-unit-service canonical contract (ams-mit/property-unit-service fix/API-fixes,
 * PROP-001 to PROP-008): every ID is a UUID and every response uses the API-STANDARD-v1
 * envelope. The same UUID identifies a unit in lease-occupancy-service.
 *
 * The contract has no public unit status transition route; status is read-only in the UI.
 */

export type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'UNDER_MAINTENANCE' | 'INACTIVE';

export const UNIT_STATUSES: UnitStatus[] = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'UNDER_MAINTENANCE', 'INACTIVE'];

/** Lifecycle of buildings, floors, unit types and ownership records. */
export type RecordStatus = 'ACTIVE' | 'INACTIVE';

export interface Unit {
  id: string;
  unitNumber: string;
  buildingId: string;
  floorId: string;
  unitTypeId: string;
  status: UnitStatus;
  availability: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRequest {
  unitNumber: string;
  buildingId: string;
  floorId: string;
  unitTypeId: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  name?: string | null;
  description?: string | null;
  status: RecordStatus;
}

export interface Building {
  id: string;
  buildingCode: string;
  name: string;
  address: string;
  description?: string | null;
  status: RecordStatus;
  floors: Floor[];
  createdAt: string;
  updatedAt: string;
}

export interface UnitType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  /** Maximum concurrent occupants; above 1 means a multi-occupancy (co-living) unit. */
  capacity: number;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Ownership {
  id: string;
  unitId: string;
  ownerId: string;
  ownershipPercentage: number;
  startDate: string;
  endDate?: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}
