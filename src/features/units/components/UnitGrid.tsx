import React from 'react';
import { Card } from '@/components/ui/Card';
import { UNIT_STATUS_THEME } from './UnitStatusBadge';
import type { Building, Unit, UnitType } from '../types/unit.types';

export interface UnitGridProps {
  buildings: Building[];
  units: Unit[];
  unitTypes: UnitType[];
  onSelectUnit: (unit: Unit) => void;
}

const UnitTile: React.FC<{ unit: Unit; unitType?: UnitType; onSelect: () => void }> = ({ unit, unitType, onSelect }) => {
  const theme = UNIT_STATUS_THEME[unit.status];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Unit ${unit.unitNumber}, ${theme.label}${unitType ? `, ${unitType.typeName}` : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.25rem',
        padding: '0.625rem 0.75rem',
        minHeight: '72px',
        textAlign: 'left',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${theme.border}`,
        borderLeft: `4px solid ${theme.text}`,
        backgroundColor: theme.background,
        color: 'var(--color-text)',
        cursor: 'pointer',
        font: 'inherit',
      }}
    >
      <strong style={{ fontSize: '0.9375rem' }}>{unit.unitNumber}</strong>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.text }}>{theme.label}</span>
      {unitType && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{unitType.typeName}</span>}
    </button>
  );
};

export const UnitGrid: React.FC<UnitGridProps> = ({ buildings, units, unitTypes, onSelectUnit }) => {
  const unitTypeById = new Map(unitTypes.map((t) => [t.id, t]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {buildings.map((building) => {
        const buildingUnits = units.filter((u) => u.buildingId === building.id);
        const floors = [...building.floors].sort((a, b) => b.floorNumber - a.floorNumber);

        return (
          <Card
            key={building.id}
            title={`${building.name} · ${building.buildingCode}`}
            subtitle={`${buildingUnits.length} unit${buildingUnits.length === 1 ? '' : 's'} · ${building.floors.length} floor${building.floors.length === 1 ? '' : 's'}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {floors.map((floor) => {
                const floorUnits = buildingUnits
                  .filter((u) => u.floorNumber === floor.floorNumber)
                  .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true }));
                return (
                  <div
                    key={floor.floorNumber}
                    style={{ display: 'grid', gridTemplateColumns: 'minmax(64px, 88px) 1fr', gap: '0.75rem', alignItems: 'start' }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--color-text-muted)',
                        paddingTop: '0.625rem',
                      }}
                    >
                      Floor {floor.floorNumber}
                    </span>
                    {floorUnits.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: '0.5rem' }}>
                        {floorUnits.map((unit) => (
                          <UnitTile
                            key={unit.id}
                            unit={unit}
                            unitType={unitTypeById.get(unit.unitTypeId)}
                            onSelect={() => onSelectUnit(unit)}
                          />
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', padding: '0.625rem 0' }}>
                        No units on this floor
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
