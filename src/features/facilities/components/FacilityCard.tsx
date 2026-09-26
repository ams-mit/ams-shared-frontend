import React from 'react';
import { Users, MapPin, Clock, Calendar, Edit2, Power, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Facility } from '../types/facility.types';
import { useAppSelector } from '@/app/store/hooks';

export interface FacilityCardProps {
  facility: Facility;
  onBook: (facility: Facility) => void;
  onEdit?: (facility: Facility) => void;
  onToggleStatus?: (facility: Facility) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  onBook,
  onEdit,
  onToggleStatus,
}) => {
  const { activeRole } = useAppSelector((state) => state.auth);
  const isAdmin = activeRole === 'ADMIN';
  const isStaffOrAdmin = activeRole === 'ADMIN' || activeRole === 'STAFF';
  const isAvailable = facility.status === 'ACTIVE';

  return (
    <Card
      padding="none"
      headerBorder={false}
      footerBorder={false}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
    >
      {/* Visual Top Bar / Badge Header */}
      <div
        style={{
          padding: '1.25rem 1.25rem 0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--color-secondary)',
            letterSpacing: '0.05em',
          }}
        >
          {facility.type}
        </span>
        <Badge variant={isAvailable ? 'success' : 'neutral'} size="sm" dot>
          {isAvailable ? 'Available' : 'Under Maintenance'}
        </Badge>
      </div>

      {/* Main Info */}
      <div style={{ padding: '0 1.25rem 1rem' }}>
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '0.75rem',
          }}
        >
          {facility.name}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={15} color="var(--color-secondary)" />
            <span>{facility.location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} color="var(--color-secondary)" />
            <span>
              {facility.operatingHoursStart ? facility.operatingHoursStart.slice(0, 5) : '06:00'} -{' '}
              {facility.operatingHoursEnd ? facility.operatingHoursEnd.slice(0, 5) : '22:00'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={15} color="var(--color-secondary)" />
            <span>Capacity: up to {facility.capacity} persons</span>
          </div>

          {facility.bookingFee !== undefined && facility.bookingFee > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={15} color="var(--color-accent)" />
              <span>Fee: ${facility.bookingFee} / session</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--color-surface-hover)',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {isAdmin ? (
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {onToggleStatus && (
              <Button
                variant={isAvailable ? 'outline' : 'primary'}
                size="sm"
                onClick={() => onToggleStatus(facility)}
                title={isAvailable ? 'Mark Under Maintenance' : 'Set Available'}
                leftIcon={<Power size={13} />}
              >
                {isAvailable ? 'Maintenance' : 'Activate'}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(facility)}
                title="Edit Facility Details"
                leftIcon={<Edit2 size={13} />}
              >
                Edit
              </Button>
            )}
          </div>
        ) : (
          <div />
        )}

        <Button
          variant={isAvailable ? 'primary' : 'outline'}
          size="sm"
          disabled={!isAvailable}
          onClick={() => onBook(facility)}
          leftIcon={<Calendar size={14} />}
        >
          {isAvailable ? 'Reserve Slot' : 'Unavailable'}
        </Button>
      </div>
    </Card>
  );
};
