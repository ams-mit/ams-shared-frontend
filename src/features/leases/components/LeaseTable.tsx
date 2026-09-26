import React from 'react';
import { Table, type Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { LeaseStatusBadge } from './LeaseStatusBadge';
import { LEASE_TRANSITIONS, type Lease } from '../types/lease.types';

export interface LeaseTableProps {
  leases: Lease[];
  isLoading: boolean;
  canManage: boolean;
  onChangeStatus: (lease: Lease) => void;
}

const shortId = (id: string) => `${id.slice(0, 8)}…`;

const idCell = (id: string) => (
  <span title={id} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.8125rem' }}>
    {shortId(id)}
  </span>
);

export const LeaseTable: React.FC<LeaseTableProps> = ({ leases, isLoading, canManage, onChangeStatus }) => {
  const columns: Column<Lease>[] = [
    { key: 'id', header: 'Lease', render: (lease) => idCell(lease.id) },
    { key: 'unitId', header: 'Unit', render: (lease) => idCell(lease.unitId) },
    { key: 'tenantId', header: 'Tenant', render: (lease) => idCell(lease.tenantId) },
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
  ];

  if (canManage) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (lease) =>
        LEASE_TRANSITIONS[lease.status].length > 0 ? (
          <Button size="sm" variant="outline" onClick={() => onChangeStatus(lease)}>
            Change status
          </Button>
        ) : (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Closed</span>
        ),
    });
  }

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
