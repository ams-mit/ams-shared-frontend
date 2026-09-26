import React from 'react';
import { Booking, BookingStatus } from '@/features/facilities/types/facility.types';
import { BookingStatusBadge } from '@/features/facilities/components/BookingStatusBadge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Clock,
  Users,
  User,
  Check,
  X,
  Trash2,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import './MobileCards.css';

export interface MobileBookingCardProps {
  booking: Booking;
  onUpdateStatus?: (bookingId: number, status: BookingStatus) => void;
  actionLoading?: boolean;
  isStaffOrAdmin?: boolean;
  currentUserId?: string;
}

export const MobileBookingCard: React.FC<MobileBookingCardProps> = ({
  booking,
  onUpdateStatus,
  actionLoading = false,
  isStaffOrAdmin = false,
  currentUserId,
}) => {
  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return {
        date: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { date: isoString, time: '' };
    }
  };

  const start = formatDateTime(booking.startTime);
  const end = formatDateTime(booking.endTime);

  return (
    <div className="ams-mobile-card">
      {/* Top Bar: Ref Code & Status Badge */}
      <div className="ams-mobile-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="ams-mobile-card-ref">#BKG-{booking.id}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Amenity #{booking.facilityId}
          </span>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Facility Name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <Building2 size={18} />
        </div>
        <div>
          <div className="ams-mobile-card-title">{booking.facilityName}</div>
          {booking.purpose && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>
              "{booking.purpose}"
            </div>
          )}
        </div>
      </div>

      {/* Information Container */}
      <div className="ams-mobile-card-details">
        {/* Date and Time Row */}
        <div className="ams-mobile-card-detail-row">
          <Calendar size={14} color="var(--color-accent)" />
          <span style={{ fontWeight: 600 }}>{start.date}</span>
          <span style={{ color: 'var(--color-text-light)' }}>•</span>
          <Clock size={13} color="var(--color-text-muted)" />
          <span>
            {start.time} – {end.time}
          </span>
        </div>

        {/* Attendees Row */}
        {booking.attendeeCount && (
          <div className="ams-mobile-card-detail-row">
            <Users size={14} color="var(--color-secondary)" />
            <span>{booking.attendeeCount} Registered Attendees</span>
          </div>
        )}

        {/* Requester Row (For Staff or if booked by staff) */}
        {isStaffOrAdmin && (
          <div className="ams-mobile-card-detail-row">
            <User size={14} color="var(--color-primary)" />
            <span>
              Requester: <strong>{booking.requesterName || booking.requesterId}</strong>
              {booking.unitId && ` (${booking.unitId})`}
            </span>
          </div>
        )}

        {booking.bookedByStaffName && (
          <div className="ams-mobile-card-detail-muted" style={{ color: 'var(--color-accent)' }}>
            Assisted by: {booking.bookedByStaffName} ({booking.bookedByStaffRole || 'Staff'})
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="ams-mobile-card-actions">
        {isStaffOrAdmin ? (
          booking.status === 'PENDING' && onUpdateStatus ? (
            <>
              <Button
                variant="primary"
                size="sm"
                disabled={actionLoading}
                onClick={() => onUpdateStatus(booking.id, 'APPROVED')}
                leftIcon={<Check size={14} />}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={actionLoading}
                onClick={() => onUpdateStatus(booking.id, 'REJECTED')}
                leftIcon={<X size={14} />}
              >
                Reject
              </Button>
            </>
          ) : booking.status === 'APPROVED' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                color: 'var(--color-success)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                padding: '0.35rem 0',
              }}
            >
              <CheckCircle2 size={16} /> Confirmed by Staff
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                padding: '0.25rem 0',
                fontStyle: 'italic',
              }}
            >
              Finalized ({booking.status})
            </div>
          )
        ) : (
          booking.status === 'PENDING' && onUpdateStatus && booking.requesterId === currentUserId ? (
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => onUpdateStatus(booking.id, 'CANCELLED')}
              leftIcon={<Trash2 size={14} color="var(--color-danger)" />}
              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)', width: '100%' }}
            >
              Withdraw Request
            </Button>
          ) : booking.status === 'APPROVED' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                color: 'var(--color-success)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                padding: '0.35rem 0',
              }}
            >
              <CheckCircle2 size={16} /> Slot Guaranteed
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                padding: '0.25rem 0',
              }}
            >
              Status: {booking.status}
            </div>
          )
        )}
      </div>
    </div>
  );
};
