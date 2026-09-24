import React from 'react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { VisitorStatusBadge } from './VisitorStatusBadge';
import { Visitor } from '../types/visitor.types';
import { CheckCircle2, QrCode, Home, Calendar, Clock, User } from 'lucide-react';
import { useAppSelector } from '@/app/store/hooks';

export interface VisitorTableProps {
  visitors: Visitor[];
  isLoading?: boolean;
  onCheckIn?: (visitorId: number) => void;
  onViewPass?: (visitor: Visitor) => void;
  actionLoading?: boolean;
}

export const VisitorTable: React.FC<VisitorTableProps> = ({
  visitors,
  isLoading = false,
  onCheckIn,
  onViewPass,
  actionLoading = false,
}) => {
  const { activeRole } = useAppSelector((state) => state.auth);
  const isSecurity = activeRole === 'STAFF' || activeRole === 'ADMIN';

  const columns: Column<Visitor>[] = [
    {
      key: 'id',
      header: 'Pass Ref',
      width: '120px',
      render: (v) => (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.8125rem',
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-surface-hover)',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          #VIS-{v.id}
        </span>
      ),
    },
    {
      key: 'visitorName',
      header: 'Guest / Visitor',
      render: (v) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>
            {v.visitorName}
          </div>
          {isSecurity && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
              <User size={12} />
              <span>Host ID: {v.residentId}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'unitId',
      header: 'Apartment Unit',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600 }}>
          <Home size={14} color="var(--color-secondary)" />
          <span>{v.unitId}</span>
        </div>
      ),
    },
    {
      key: 'purpose',
      header: 'Visit Purpose',
      render: (v) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text)' }}>
          {v.purpose}
        </span>
      ),
    },
    {
      key: 'visitDate',
      header: 'Scheduled Date',
      render: (v) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
            <Calendar size={13} color="var(--color-secondary)" />
            <span>{v.visitDate}</span>
          </div>
          {v.checkedInAt && (
            <div
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '3px',
                fontWeight: 600,
              }}
            >
              <Clock size={11} />
              <span>Arrived: {new Date(v.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Clearance Status',
      width: '160px',
      render: (v) => <VisitorStatusBadge status={v.status} />,
    },
    {
      key: 'actions',
      header: isSecurity ? 'Gate Actions' : 'Guest Pass',
      width: isSecurity ? '210px' : '140px',
      align: 'right',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {onViewPass && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewPass(v)}
              leftIcon={<QrCode size={14} />}
              title="Inspect Digital QR Gate Pass"
            >
              View Pass
            </Button>
          )}

          {/* Security Gate Check-in Control - strictly restricted to Staff & Admin */}
          {v.status === 'EXPECTED' && isSecurity && onCheckIn && (
            <Button
              variant="primary"
              size="sm"
              disabled={actionLoading}
              onClick={() => onCheckIn(v.id)}
              leftIcon={<CheckCircle2 size={14} />}
              title="Authorize entry and log arrival timestamp"
            >
              Check In
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table<Visitor>
      columns={columns}
      data={visitors}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      emptyText={
        isSecurity
          ? 'No incoming visitors logged for today.'
          : 'You have not pre-registered any visitors yet. Click "Pre-Register Guest" above to issue a digital gate pass.'
      }
    />
  );
};
