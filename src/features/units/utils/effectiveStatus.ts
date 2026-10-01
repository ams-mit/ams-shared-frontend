import type { Unit } from '../types/unit.types';

/**
 * The property contract has no route for lease-occupancy-service to update unit status, so a
 * leased unit can still be recorded as AVAILABLE or RESERVED. The inventory view shows such a
 * unit as OCCUPIED; `recordedStatus` keeps what property-unit-service holds.
 */
export interface DisplayUnit extends Unit {
  recordedStatus: Unit['status'];
}

export const withLeaseStatus = (units: Unit[], leasedUnitIds: string[]): DisplayUnit[] => {
  const leased = new Set(leasedUnitIds);
  return units.map((unit) =>
    leased.has(unit.id) && (unit.status === 'AVAILABLE' || unit.status === 'RESERVED')
      ? { ...unit, status: 'OCCUPIED', availability: false, recordedStatus: unit.status }
      : { ...unit, recordedStatus: unit.status }
  );
};
