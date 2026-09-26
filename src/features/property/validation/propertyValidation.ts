import type { Building, Floor, Ownership } from '../types/property.types';

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const MAX_FLOOR_COUNT = 200;

export interface BuildingFormValues {
  buildingCode: string;
  name: string;
  address: string;
  floorCount: string;
}

// property-unit-service returns 500 (not 409) on a duplicate code (GAPS.md #2), so the
// duplicate check has to happen here against the buildings already loaded.
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

// The backend does not auto-generate floors yet (GAPS.md #1), so they are sent explicitly.
export const generateFloors = (floorCount: number): Floor[] =>
  Array.from({ length: floorCount }, (_, index) => ({
    floorNumber: index + 1,
    floorName: `Floor ${index + 1}`,
  }));

export interface UnitTypeFormValues {
  typeName: string;
  baseRent: string;
  capacityLimit: string;
  amenitiesSummary: string;
}

export const validateUnitType = (values: UnitTypeFormValues): FieldErrors<keyof UnitTypeFormValues> => {
  const errors: FieldErrors<keyof UnitTypeFormValues> = {};
  const baseRent = Number(values.baseRent);
  const capacity = Number(values.capacityLimit);

  if (!values.typeName.trim()) errors.typeName = 'Type name is required.';

  if (values.baseRent.trim() === '') errors.baseRent = 'Base monthly rent is required.';
  else if (!Number.isFinite(baseRent) || baseRent < 0) errors.baseRent = 'Base rent must be zero or a positive amount.';
  else if (!/^\d+(\.\d{1,2})?$/.test(values.baseRent.trim())) {
    errors.baseRent = 'Base rent can have at most two decimal places.';
  }

  if (values.capacityLimit.trim() === '') errors.capacityLimit = 'Capacity limit is required.';
  else if (!Number.isInteger(capacity) || capacity < 1) {
    errors.capacityLimit = 'Capacity must be a whole number of at least 1 occupant.';
  }

  return errors;
};

export interface OwnershipFormValues {
  unitId: string;
  ownerId: string;
  sharePercentage: string;
  startDate: string;
  endDate: string;
}

export const totalSharePercentage = (ownerships: Ownership[]): number =>
  Math.round(ownerships.reduce((sum, o) => sum + Number(o.sharePercentage), 0) * 100) / 100;

// Mirrors OwnershipService: the sum of every recorded share on a unit may not exceed 100.00.
// The backend surfaces a breach as a bare 500, so it is checked here first.
export const validateOwnership = (
  values: OwnershipFormValues,
  existingOwnershipsForUnit: Ownership[]
): FieldErrors<keyof OwnershipFormValues> => {
  const errors: FieldErrors<keyof OwnershipFormValues> = {};
  const unitId = Number(values.unitId);
  const share = Number(values.sharePercentage);

  if (values.unitId.trim() === '') errors.unitId = 'Unit ID is required.';
  else if (!Number.isInteger(unitId) || unitId < 1) errors.unitId = 'Unit ID must be a positive whole number.';

  if (!values.ownerId.trim()) errors.ownerId = 'Owner profile ID is required.';

  if (values.sharePercentage.trim() === '') errors.sharePercentage = 'Share percentage is required.';
  else if (!Number.isFinite(share) || share < 0.01 || share > 100) {
    errors.sharePercentage = 'Share must be between 0.01% and 100%.';
  } else if (!/^\d+(\.\d{1,2})?$/.test(values.sharePercentage.trim())) {
    errors.sharePercentage = 'Share can have at most two decimal places.';
  } else {
    const allocated = totalSharePercentage(existingOwnershipsForUnit);
    if (allocated + share > 100) {
      const remaining = Math.max(0, Math.round((100 - allocated) * 100) / 100);
      errors.sharePercentage = `Only ${remaining}% of this unit is still unallocated (${allocated}% already assigned).`;
    }
  }

  if (!values.startDate) errors.startDate = 'Start date is required.';
  if (values.endDate && values.startDate && values.endDate <= values.startDate) {
    errors.endDate = 'End date must be after the start date.';
  }

  return errors;
};
