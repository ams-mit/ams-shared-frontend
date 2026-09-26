import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { LeaseStatusBadge } from '@/features/leases/components/LeaseStatusBadge';
import type { ApiErrorInfo } from '@/services/api/apiError';
import { useUnitDetail } from '../hooks/useUnitDetail';
import { UnitStatusBadge } from './UnitStatusBadge';
import { UnitStatusControl } from './UnitStatusControl';
import type { Building, Ownership, Unit, UnitType } from '../types/unit.types';

export interface UnitDetailDrawerProps {
  unit: Unit | null;
  building?: Building;
  unitType?: UnitType;
  canManage: boolean;
  onClose: () => void;
}

const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const isCurrentOwnership = (o: Ownership) => o.startDate <= todayIso() && (!o.endDate || o.endDate >= todayIso());

const rent = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
    <h3
      style={{
        margin: 0,
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--color-text-muted)',
      }}
    >
      {title}
    </h3>
    {children}
  </section>
);

const Muted: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{children}</p>
);

const sectionError = (error: ApiErrorInfo) =>
  error.status === 403 ? 'Only property managers can view this.' : error.message;

const mono: React.CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.8125rem' };

export const UnitDetailDrawer: React.FC<UnitDetailDrawerProps> = ({ unit, building, unitType, canManage, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { loading, ownerships, leases } = useUnitDetail(unit?.id ?? null);

  useEffect(() => {
    if (!unit) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [unit, onClose]);

  if (!unit) return null;

  const currentOwners = ownerships.data.filter(isCurrentOwnership);
  const activeLease = leases.data.find((l) => l.status === 'ACTIVE');
  const floorName = building?.floors.find((f) => f.floorNumber === unit.floorNumber)?.floorName;
  const showFloorName = floorName && floorName !== `Floor ${unit.floorNumber}`;

  return (
    <div
      onMouseDown={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.35)', display: 'flex', justifyContent: 'flex-end' }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unit-drawer-title"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: 'min(440px, 100vw)',
          height: '100%',
          overflowY: 'auto',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h2 id="unit-drawer-title" style={{ margin: 0, fontSize: '1.25rem' }}>
              Unit {unit.unitNumber}
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {building ? `${building.name} · ` : ''}Floor {unit.floorNumber}
              {showFloorName ? ` (${floorName})` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close unit details"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </header>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Section title="Status">
            <div>
              <UnitStatusBadge status={unit.status} size="md" />
            </div>
            {canManage && <UnitStatusControl key={unit.id} unit={unit} />}
          </Section>

          <Section title="Unit Type">
            {unitType ? (
              <Muted>
                <strong style={{ color: 'var(--color-text)' }}>{unitType.typeName}</strong> · {rent.format(unitType.baseRent)} / month ·
                capacity {unitType.capacityLimit}
              </Muted>
            ) : (
              <Muted>Unknown unit type</Muted>
            )}
          </Section>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
              <Spinner />
            </div>
          ) : (
            <>
              <Section title="Current Owner">
                {ownerships.error ? (
                  <Muted>{sectionError(ownerships.error)}</Muted>
                ) : currentOwners.length === 0 ? (
                  <Muted>No owner recorded.</Muted>
                ) : (
                  currentOwners.map((o) => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.875rem' }}>
                      <span style={mono}>{o.ownerId}</span>
                      <span>{Number(o.sharePercentage).toFixed(2)}% since {o.startDate}</span>
                    </div>
                  ))
                )}
              </Section>

              <Section title="Active Occupant">
                {leases.error ? (
                  <Muted>{sectionError(leases.error)}</Muted>
                ) : activeLease ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                    <span>
                      Tenant <span style={mono}>{activeLease.tenantId}</span>
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Lease {activeLease.startDate} → {activeLease.endDate}
                    </span>
                  </div>
                ) : (
                  <Muted>No active lease on record.</Muted>
                )}
              </Section>

              <Section title="Lease History">
                {leases.error ? (
                  <Muted>{sectionError(leases.error)}</Muted>
                ) : leases.data.length === 0 ? (
                  <Muted>No leases recorded for this unit.</Muted>
                ) : (
                  <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {leases.data.map((lease) => (
                      <li
                        key={lease.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.625rem 0.75rem',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <span>
                          {lease.startDate} → {lease.endDate}
                        </span>
                        <LeaseStatusBadge status={lease.status} />
                      </li>
                    ))}
                  </ol>
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
