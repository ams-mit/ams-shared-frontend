export type UnitStatus =
  'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'UNDER_MAINTENANCE' | 'INACTIVE';

export const UNIT_STATUSES: UnitStatus[] = [
  'AVAILABLE',
  'RESERVED',
  'OCCUPIED',
  'UNDER_MAINTENANCE',
  'INACTIVE',
];

/** Public UnitView: UUID for lease APIs; floorId is a database floor ID. */
export interface Unit {
  unitId: string;
  ownershipUnitId: number;
  floorId: number;
  unitNumber: string;
  unitTypeId: number;
  status: UnitStatus;
}
export interface CreateUnitRequest {
  floorId: number;
  unitTypeId: number;
  unitNumber: string;
}

export interface Floor {
  id?: number;
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
