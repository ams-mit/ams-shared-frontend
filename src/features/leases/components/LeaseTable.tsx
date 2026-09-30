import React from 'react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { LeaseStatusBadge } from './LeaseStatusBadge';
import { LEASE_TRANSITIONS, type Lease } from '../types/lease.types';

export interface LeaseTableProps {
  leases: Lease[];
  /** Readable unit name when the inventory is loaded; the table falls back to the UUID. */
  unitLabel?: (unitId: string) => string | undefined;
  isLoading: boolean;
  canManage: boolean;
  onView: (lease: Lease) => void;
  onChangeStatus: (lease: Lease) => void;
}

const shortId = (id: string) => `${id.slice(0, 8)}…`;

export const idCell = (id: string) => (
  <span title={id} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.8125rem' }}>
    {shortId(id)}
  </span>
);

const occupantsCell = (lease: Lease) => {
  const [primary, ...others] = lease.occupants;
  if (!primary) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {idCell(primary)}
      {others.length > 0 && (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}> +{others.length}</span>
      )}
    </span>
  );
};

export const LeaseTable: React.FC<LeaseTableProps> = ({ leases, unitLabel, isLoading, canManage, onView, onChangeStatus }) => {
  const columns: Column<Lease>[] = [
    { key: 'id', header: 'Lease', render: (lease) => idCell(lease.id) },
    {
      key: 'unitId',
      header: 'Unit',
      render: (lease) => {
        const label = unitLabel?.(lease.unitId);
        return label ? <span title={lease.unitId}>{label}</span> : idCell(lease.unitId);
      },
    },
    { key: 'occupants', header: 'Tenant', render: occupantsCell },
    {
      key: 'term',
      header: 'Term',
      render: (lease) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {lease.startDate} → {lease.endDate}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (lease) => <LeaseStatusBadge status={lease.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (lease) => (
        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
          <Button size="sm" variant="ghost" onClick={() => onView(lease)}>
            Details
          </Button>
          {canManage && LEASE_TRANSITIONS[lease.status].length > 0 && (
            <Button size="sm" variant="outline" onClick={() => onChangeStatus(lease)}>
              Change status
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={leases}
      keyExtractor={(lease) => lease.id}
      isLoading={isLoading}
      emptyText="No leases match this filter."
      striped
    />
  );
};
