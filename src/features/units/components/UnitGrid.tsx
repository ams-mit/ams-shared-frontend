import React from 'react';
import { Card } from '@/components/ui/Card';
import { UNIT_STATUS_THEME } from './UnitStatusBadge';
import type { Unit, UnitType } from '../types/unit.types';

export interface UnitGridProps {
  units: Unit[];
  unitTypes: UnitType[];
  onSelectUnit: (unit: Unit) => void;
}

const UnitTile: React.FC<{
  unit: Unit;
  unitType?: UnitType;
  onSelect: () => void;
}> = ({ unit, unitType, onSelect }) => {
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
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.text }}>
        {theme.label}
      </span>
      {unitType && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {unitType.typeName}
        </span>
      )}
    </button>
  );
};

export const UnitGrid: React.FC<UnitGridProps> = ({
  units,
  unitTypes,
  onSelectUnit,
}) => {
  const types = new Map(unitTypes.map((t) => [t.id, t]));
  const floors = [...new Set(units.map((u) => u.floorId))].sort(
    (a, b) => a - b
  );
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {floors.map((floorId) => (
        <Card key={floorId} title={`Floor ID ${floorId}`}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {units
              .filter((u) => u.floorId === floorId)
              .sort((a, b) =>
                a.unitNumber.localeCompare(b.unitNumber, undefined, {
                  numeric: true,
                })
              )
              .map((unit) => (
                <UnitTile
                  key={unit.unitId}
                  unit={unit}
                  unitType={types.get(unit.unitTypeId)}
                  onSelect={() => onSelectUnit(unit)}
                />
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
