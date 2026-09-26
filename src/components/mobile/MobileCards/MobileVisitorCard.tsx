import React from 'react';
import { Visitor } from '@/features/visitors/types/visitor.types';
import { VisitorStatusBadge } from '@/features/visitors/components/VisitorStatusBadge';
import { Button } from '@/components/ui/Button';
import {
  QrCode,
  CheckCircle2,
  Calendar,
  Clock,
  Home,
  User,
  LogOut,
  XCircle,
  Phone,
  Car,
} from 'lucide-react';
import './MobileCards.css';

export interface MobileVisitorCardProps {
  visitor: Visitor;
  onCheckIn?: (visitorId: number) => void;
  onCheckOut?: (visitorId: number) => void;
  onCancelPass?: (visitorId: number) => void;
  onViewPass?: (visitor: Visitor) => void;
  actionLoading?: boolean;
  isSecurity?: boolean;
}

export const MobileVisitorCard: React.FC<MobileVisitorCardProps> = ({
  visitor,
  onCheckIn,
  onCheckOut,
  onCancelPass,
  onViewPass,
  actionLoading = false,
  isSecurity = false,
}) => {
  return (
    <div className="ams-mobile-card">
      {/* Top Header: Pass Reference and Status Badge */}
      <div className="ams-mobile-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="ams-mobile-card-ref">{visitor.passCode ? visitor.passCode : `#VIS-${visitor.id}`}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
            }}
          >
            <Home size={13} color="var(--color-secondary)" />
            {visitor.unitId}
          </span>
        </div>
        <VisitorStatusBadge status={visitor.status} />
      </div>

      {/* Visitor Profile Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(47, 139, 139, 0.3)',
          }}
        >
          {visitor.visitorName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <div>
          <div className="ams-mobile-card-title">{visitor.visitorName}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Purpose: <strong>{visitor.purpose}</strong>
          </div>
        </div>
      </div>

      {/* Information Container */}
      <div className="ams-mobile-card-details">
        {visitor.visitorPhone && (
          <div className="ams-mobile-card-detail-row">
            <Phone size={14} color="var(--color-secondary)" />
            <span style={{ fontWeight: 600 }}>Phone:</span>
            <span>{visitor.visitorPhone}</span>
          </div>
        )}

        {visitor.vehicleNumber && (
          <div className="ams-mobile-card-detail-row">
            <Car size={14} color="var(--color-secondary)" />
            <span style={{ fontWeight: 600 }}>Vehicle:</span>
            <span>{visitor.vehicleNumber}</span>
          </div>
        )}

        <div className="ams-mobile-card-detail-row">
          <Calendar size={14} color="var(--color-secondary)" />
          <span style={{ fontWeight: 600 }}>Scheduled Date:</span>
          <span>{visitor.visitDate}</span>
        </div>

        {visitor.checkedInAt && (
          <div
            className="ams-mobile-card-detail-row"
            style={{ color: 'var(--color-success)', fontWeight: 600 }}
          >
            <Clock size={14} />
            <span>
              In:{' '}
              {new Date(visitor.checkedInAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {visitor.checkedOutAt && (
          <div
            className="ams-mobile-card-detail-row"
            style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
          >
            <LogOut size={14} />
            <span>
              Out:{' '}
              {new Date(visitor.checkedOutAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {isSecurity && (
          <div className="ams-mobile-card-detail-row">
            <User size={14} color="var(--color-text-muted)" />
            <span style={{ fontSize: '0.75rem' }}>
              Host Resident ID: <strong>{visitor.residentId}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="ams-mobile-card-actions">
        {onViewPass && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewPass(visitor)}
            leftIcon={<QrCode size={15} />}
          >
            Pass
          </Button>
        )}

        {isSecurity && visitor.status === 'EXPECTED' && onCheckIn && (
          <Button
            variant="primary"
            size="sm"
            disabled={actionLoading}
            onClick={() => onCheckIn(visitor.id)}
            leftIcon={<CheckCircle2 size={15} />}
          >
            Check In
          </Button>
        )}

        {isSecurity && visitor.status === 'CHECKED_IN' && onCheckOut && (
          <Button
            variant="outline"
            size="sm"
            disabled={actionLoading}
            onClick={() => onCheckOut(visitor.id)}
            leftIcon={<LogOut size={15} />}
          >
            Check Out
          </Button>
        )}

        {visitor.status === 'EXPECTED' && onCancelPass && (
          <Button
            variant="ghost"
            size="sm"
            disabled={actionLoading}
            onClick={() => onCancelPass(visitor.id)}
            leftIcon={<XCircle size={15} />}
            style={{ color: 'var(--color-danger)' }}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
