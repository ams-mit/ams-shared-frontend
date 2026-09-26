import React from 'react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { VisitorStatusBadge } from './VisitorStatusBadge';
import { Visitor } from '../types/visitor.types';
import { CheckCircle2, LogOut, XCircle, QrCode, Home, Calendar, Clock, User, Phone, Car } from 'lucide-react';
import { useAppSelector } from '@/app/store/hooks';
import { useIsMobile, MobileVisitorCard, MobileCardList } from '@/components/mobile';

export interface VisitorTableProps {
  visitors: Visitor[];
  isLoading?: boolean;
  onCheckIn?: (visitorId: number) => void;
  onCheckOut?: (visitorId: number) => void;
  onCancelPass?: (visitorId: number) => void;
  onViewPass?: (visitor: Visitor) => void;
  actionLoading?: boolean;
}

export const VisitorTable: React.FC<VisitorTableProps> = ({
  visitors,
  isLoading = false,
  onCheckIn,
  onCheckOut,
  onCancelPass,
  onViewPass,
  actionLoading = false,
}) => {
  const { activeRole, currentUser } = useAppSelector((state) => state.auth);
  const { isMobile } = useIsMobile();
  const isSecurity = activeRole === 'STAFF' || activeRole === 'ADMIN';

  const columns: Column<Visitor>[] = [
    {
      key: 'id',
      header: 'Pass Ref',
      width: '130px',
      render: (v) => (
        <div>
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
            {v.passCode ? v.passCode : `#VIS-${v.id}`}
          </span>
        </div>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '3px' }}>
            {v.visitorPhone && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone size={11} /> {v.visitorPhone}
              </span>
            )}
            {v.vehicleNumber && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Car size={11} /> {v.vehicleNumber}
              </span>
            )}
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
              <span>In: {new Date(v.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {v.checkedOutAt && (
            <div
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '2px',
                fontWeight: 500,
              }}
            >
              <LogOut size={11} />
              <span>Out: {new Date(v.checkedOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
      header: 'Actions',
      width: '240px',
      align: 'right',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
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

          {/* Security Gate Check-in Control */}
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

          {/* Security Gate Check-out Control */}
          {v.status === 'CHECKED_IN' && isSecurity && onCheckOut && (
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => onCheckOut(v.id)}
              leftIcon={<LogOut size={14} />}
              title="Record gate departure timestamp"
            >
              Check Out
            </Button>
          )}

          {/* Resident Cancel Pass Control */}
          {v.status === 'EXPECTED' && (!isSecurity || v.residentId === currentUser.id) && onCancelPass && (
            <Button
              variant="ghost"
              size="sm"
              disabled={actionLoading}
              onClick={() => onCancelPass(v.id)}
              leftIcon={<XCircle size={14} />}
              title="Cancel scheduled visitor entry pass"
              style={{ color: 'var(--color-danger)' }}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isMobile) {
    return (
      <MobileCardList
        isLoading={isLoading}
        loadingMessage="Loading visitor ledger..."
        isEmpty={visitors.length === 0}
        emptyTitle={isSecurity ? 'No incoming visitors' : 'No pre-registered guests'}
        emptyDescription={
          isSecurity
            ? 'No incoming visitors logged for today.'
            : 'You have not pre-registered any visitors yet. Tap "Pre-Register Guest" above to issue a digital gate pass.'
        }
      >
        {visitors.map((visitor) => (
          <MobileVisitorCard
            key={visitor.id}
            visitor={visitor}
            onCheckIn={onCheckIn}
            onCheckOut={onCheckOut}
            onCancelPass={onCancelPass}
            onViewPass={onViewPass}
            actionLoading={actionLoading}
            isSecurity={isSecurity}
          />
        ))}
      </MobileCardList>
    );
  }

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
