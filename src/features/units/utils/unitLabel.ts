import type { Building, Unit } from '../types/unit.types';

/** "Tower A · 101" — how a unit UUID is shown to people. */
export const unitLabel = (unit: Unit, buildings: Building[]): string => {
  const building = buildings.find((b) => b.id === unit.buildingId);
  return building ? `${building.name} · ${unit.unitNumber}` : `Unit ${unit.unitNumber}`;
};

/** Labels a unit ID from the loaded inventory, falling back to a shortened UUID. */
export const unitLabelById = (unitId: string, units: Unit[], buildings: Building[]): string => {
  const unit = units.find((u) => u.id === unitId);
  return unit ? unitLabel(unit, buildings) : `${unitId.slice(0, 8)}…`;
};

export const unitOptions = (units: Unit[], buildings: Building[]) =>
  units
    .map((unit) => ({ value: unit.id, label: unitLabel(unit, buildings) }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
