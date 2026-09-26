import React from 'react';
import { UNIT_STATUS_THEME } from './UnitStatusBadge';
import { UNIT_STATUSES, type Unit, type UnitStatus } from '../types/unit.types';

export interface UnitStatusSummaryProps {
  units: Unit[];
  activeStatus: UnitStatus | null;
  onSelect: (status: UnitStatus | null) => void;
}

/** Status legend that doubles as a filter: each chip shows the count and toggles that status. */
export const UnitStatusSummary: React.FC<UnitStatusSummaryProps> = ({ units, activeStatus, onSelect }) => {
  const counts = UNIT_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: units.filter((u) => u.status === status).length }),
    {} as Record<UnitStatus, number>
  );

  return (
    <div role="group" aria-label="Filter units by status" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {UNIT_STATUSES.map((status) => {
        const theme = UNIT_STATUS_THEME[status];
        const isActive = activeStatus === status;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? null : status)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '9999px',
              border: `1.5px solid ${isActive ? theme.text : theme.border}`,
              backgroundColor: theme.background,
              color: theme.text,
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.text }} />
            {theme.label}
            <span style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.85 }}>{counts[status]}</span>
          </button>
        );
      })}
    </div>
  );
};
