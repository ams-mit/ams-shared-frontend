import React from 'react';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Check, X, Calendar, User, Clock, Trash2, CheckCircle2, Users } from 'lucide-react';
import { useAppSelector } from '@/app/store/hooks';

export interface BookingTableProps {
  bookings: Booking[];
  isLoading?: boolean;
  onUpdateStatus?: (bookingId: number, status: BookingStatus) => void;
  actionLoading?: boolean;
}

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  isLoading = false,
  onUpdateStatus,
  actionLoading = false,
}) => {
  const { activeRole, currentUser } = useAppSelector((state) => state.auth);
  const isStaffOrAdmin = activeRole === 'ADMIN' || activeRole === 'STAFF';

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

  const columns: Column<Booking>[] = [
    {
      key: 'id',
      header: 'Booking Ref',
      width: '120px',
      render: (b) => (
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
          #BKG-{b.id}
        </span>
      ),
    },
    {
      key: 'facilityName',
      header: 'Amenity / Facility',
      render: (b) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9375rem' }}>
            {b.facilityName}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '3px',
              flexWrap: 'wrap',
            }}
          >
            <span>Amenity ID: #{b.facilityId}</span>
            {b.attendeeCount && (
              <>
                <span style={{ opacity: 0.5 }}>•</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: 'var(--color-secondary)',
                    fontWeight: 600,
                  }}
                >
                  <Users size={12} color="var(--color-accent)" />
                  <span>{b.attendeeCount} Attendees</span>
                </span>
              </>
            )}
            {b.purpose && (
              <>
                <span style={{ opacity: 0.5 }}>•</span>
                <span style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                  "{b.purpose}"
                </span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Reserved Time Window',
      render: (b) => {
        const start = formatDateTime(b.startTime);
        const end = formatDateTime(b.endTime);
        return (
          <div style={{ fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, color: 'var(--color-text)' }}>
              <Calendar size={14} color="var(--color-accent)" />
              <span>{start.date}</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--color-text-muted)',
                marginTop: '3px',
              }}
            >
              <Clock size={13} />
              <span>
                {start.time} – {end.time}
              </span>
            </div>
          </div>
        );
      },
    },
    // Only show Requester details to Staff / Admin
    ...(isStaffOrAdmin
      ? [
          {
            key: 'requester',
            header: 'Requester',
            render: (b: Booking) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                  }}
                >
                  <User size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    {b.requesterName ? `${b.requesterName}` : b.requesterId}
                    {b.requesterName && (
                      <span style={{ fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: '0.35rem', fontSize: '0.75rem' }}>
                        ({b.requesterId})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                    <span>
                      Role: <strong>{b.requesterRole}</strong> {b.unitId ? `• Unit: ${b.unitId}` : ''}
                    </span>
                    {b.bookedByStaffName && (
                      <span style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.6875rem' }}>
                        Booked by: {b.bookedByStaffName} ({b.bookedByStaffRole || 'Officer'})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'status',
      header: 'Review Status',
      width: '150px',
      render: (b) => <BookingStatusBadge status={b.status} />,
    },
    {
      key: 'actions',
      header: isStaffOrAdmin ? 'Staff Decision' : 'Management',
      width: isStaffOrAdmin ? '210px' : '150px',
      align: 'right',
      render: (b) => {
        // Staff / Admin Approval Controls
        if (isStaffOrAdmin) {
          if (b.status === 'PENDING' && onUpdateStatus) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => onUpdateStatus(b.id, 'APPROVED')}
                  leftIcon={<Check size={14} />}
                  title="Approve and confirm booking"
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => onUpdateStatus(b.id, 'REJECTED')}
                  leftIcon={<X size={14} />}
                  title="Reject reservation request"
                >
                  Reject
                </Button>
              </div>
            );
          }

          if (b.status === 'APPROVED') {
            return (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Confirmed
              </span>
            );
          }

          return (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Finalized ({b.status})
            </span>
          );
        }

        // Resident / Owner View (STRICTLY NO APPROVE/REJECT BUTTONS)
        if (b.status === 'PENDING' && onUpdateStatus && b.requesterId === currentUser.id) {
          return (
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => onUpdateStatus(b.id, 'CANCELLED')}
              leftIcon={<Trash2 size={13} color="var(--color-danger)" />}
              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }}
            >
              Withdraw
            </Button>
          );
        }

        if (b.status === 'APPROVED') {
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Slot Guaranteed
            </span>
          );
        }

        return (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {b.status === 'PENDING' ? 'Pending Review' : 'Closed'}
          </span>
        );
      },
    },
  ];

  return (
    <Table<Booking>
      columns={columns}
      data={bookings}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      emptyText={
        isStaffOrAdmin
          ? 'No reservation requests currently in queue.'
          : 'You have not submitted any amenity reservations yet. Click "Book Facility" above to reserve a slot.'
      }
    />
  );
};
