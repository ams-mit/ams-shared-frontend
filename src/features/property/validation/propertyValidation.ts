import type { Building, CreateFloorRequest, Ownership, UnitType } from '../types/property.types';

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const MAX_FLOOR_COUNT = 200;

export interface BuildingFormValues {
  buildingCode: string;
  name: string;
  address: string;
  floorCount: string;
}

// PROP-001 answers a duplicate code with 409 BUILDING_ALREADY_EXISTS; checking the loaded
// buildings first gives the error on the field before a round trip.
export const validateBuilding = (
  values: BuildingFormValues,
  existingBuildings: Building[]
): FieldErrors<keyof BuildingFormValues> => {
  const errors: FieldErrors<keyof BuildingFormValues> = {};
  const code = values.buildingCode.trim();

  if (!code) errors.buildingCode = 'Building code is required.';
  else if (code.length > 50) errors.buildingCode = 'Building code must be 50 characters or fewer.';
  else if (existingBuildings.some((b) => b.buildingCode.toLowerCase() === code.toLowerCase())) {
    errors.buildingCode = `Building code "${code}" is already in use.`;
  }

  if (!values.name.trim()) errors.name = 'Building name is required.';
  else if (values.name.trim().length > 255) errors.name = 'Building name must be 255 characters or fewer.';

  if (!values.address.trim()) errors.address = 'Address is required.';
  else if (values.address.trim().length > 255) errors.address = 'Address must be 255 characters or fewer.';

  const floorCount = Number(values.floorCount);
  if (values.floorCount.trim() === '') errors.floorCount = 'Number of floors is required.';
  else if (!Number.isInteger(floorCount) || floorCount < 1) {
    errors.floorCount = 'Number of floors must be a whole number of at least 1.';
  } else if (floorCount > MAX_FLOOR_COUNT) {
    errors.floorCount = `Number of floors cannot exceed ${MAX_FLOOR_COUNT}.`;
  }

  return errors;
};

// PROP-001 creates the floors sent with the building; they are generated from the count.
export const generateFloors = (floorCount: number): CreateFloorRequest[] =>
  Array.from({ length: floorCount }, (_, index) => ({
    floorNumber: index + 1,
    name: `Floor ${index + 1}`,
  }));

export interface UnitTypeFormValues {
  code: string;
  name: string;
  capacity: string;
  description: string;
}

// Mirrors UnitTypeInput: code up to 50, name up to 255, description up to 500, positive capacity.
export const validateUnitType = (
  values: UnitTypeFormValues,
  existingTypes: UnitType[] = []
): FieldErrors<keyof UnitTypeFormValues> => {
  const errors: FieldErrors<keyof UnitTypeFormValues> = {};
  const code = values.code.trim();
  const capacity = Number(values.capacity);

  if (!code) errors.code = 'Type code is required.';
  else if (code.length > 50) errors.code = 'Type code must be 50 characters or fewer.';
  else if (existingTypes.some((t) => t.code.toLowerCase() === code.toLowerCase())) {
    errors.code = `Type code "${code}" is already in use.`;
  }

  if (!values.name.trim()) errors.name = 'Type name is required.';
  else if (values.name.trim().length > 255) errors.name = 'Type name must be 255 characters or fewer.';

  if (values.capacity.trim() === '') errors.capacity = 'Capacity is required.';
  else if (!Number.isInteger(capacity) || capacity < 1) {
    errors.capacity = 'Capacity must be a whole number of at least 1 occupant.';
  }

  if (values.description.trim().length > 500) errors.description = 'Description must be 500 characters or fewer.';

  return errors;
};

export interface OwnershipFormValues {
  unitId: string;
  ownerId: string;
  ownershipPercentage: string;
  startDate: string;
  endDate: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const overlaps = (o: Ownership, startDate: string, endDate: string) =>
  (!o.endDate || !startDate || o.endDate >= startDate) && (!endDate || o.startDate <= endDate);

export const totalOwnershipPercentage = (ownerships: Ownership[]): number =>
  Math.round(ownerships.reduce((sum, o) => sum + Number(o.ownershipPercentage), 0) * 100) / 100;

// Mirrors PROP-007: active records overlapping the new period may not total more than 100.00%,
// and an owner cannot hold two overlapping records on the same unit.
export const validateOwnership = (
  values: OwnershipFormValues,
  existingOwnershipsForUnit: Ownership[]
): FieldErrors<keyof OwnershipFormValues> => {
  const errors: FieldErrors<keyof OwnershipFormValues> = {};
  const share = Number(values.ownershipPercentage);
  const ownerId = values.ownerId.trim();
  const overlapping = existingOwnershipsForUnit.filter(
    (o) => o.status === 'ACTIVE' && overlaps(o, values.startDate, values.endDate)
  );

  if (!values.unitId) errors.unitId = 'Select a unit.';

  if (!ownerId) errors.ownerId = 'Owner profile ID is required.';
  else if (!UUID_PATTERN.test(ownerId)) errors.ownerId = 'Owner profile ID must be a valid UUID.';
  else if (overlapping.some((o) => o.ownerId.toLowerCase() === ownerId.toLowerCase())) {
    errors.ownerId = 'This owner already holds an overlapping share of this unit.';
  }

  if (values.ownershipPercentage.trim() === '') errors.ownershipPercentage = 'Share percentage is required.';
  else if (!Number.isFinite(share) || share < 0.01 || share > 100) {
    errors.ownershipPercentage = 'Share must be between 0.01% and 100%.';
  } else if (!/^\d+(\.\d{1,2})?$/.test(values.ownershipPercentage.trim())) {
    errors.ownershipPercentage = 'Share can have at most two decimal places.';
  } else {
    const allocated = totalOwnershipPercentage(overlapping);
    if (allocated + share > 100) {
      const remaining = Math.max(0, Math.round((100 - allocated) * 100) / 100);
      errors.ownershipPercentage = `Only ${remaining}% of this unit is unallocated for these dates (${allocated}% already assigned).`;
    }
  }

  if (!values.startDate) errors.startDate = 'Start date is required.';
  if (values.endDate && values.startDate && values.endDate < values.startDate) {
    errors.endDate = 'End date cannot be before the start date.';
  }

  return errors;
};
