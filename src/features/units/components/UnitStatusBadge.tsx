import React from 'react';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import type { UnitStatus } from '../types/unit.types';

interface StatusTheme {
  label: string;
  variant: NonNullable<BadgeProps['variant']>;
  background: string;
  border: string;
  text: string;
}

// Grid colours per AMSG2-66: green available, blue occupied, yellow under maintenance.
export const UNIT_STATUS_THEME: Record<UnitStatus, StatusTheme> = {
  AVAILABLE: {
    label: 'Available',
    variant: 'success',
    background: 'var(--color-success-bg)',
    border: 'var(--color-success-border)',
    text: 'var(--color-success-text)',
  },
  OCCUPIED: {
    label: 'Occupied',
    variant: 'info',
    background: 'var(--color-info-bg)',
    border: 'var(--color-info-border)',
    text: 'var(--color-info-text)',
  },
  UNDER_MAINTENANCE: {
    label: 'Under Maintenance',
    variant: 'warning',
    background: 'var(--color-warning-bg)',
    border: 'var(--color-warning-border)',
    text: 'var(--color-warning-text)',
  },
  RESERVED: {
    label: 'Reserved',
    variant: 'accent',
    background: 'var(--color-accent-subtle)',
    border: 'var(--color-accent-light)',
    text: 'var(--color-accent)',
  },
  INACTIVE: {
    label: 'Inactive',
    variant: 'neutral',
    background: 'var(--color-surface-sunken)',
    border: 'var(--color-border-strong)',
    text: 'var(--color-text-muted)',
  },
};

export const UnitStatusBadge: React.FC<{ status: UnitStatus; size?: BadgeProps['size'] }> = ({ status, size = 'sm' }) => (
  <Badge variant={UNIT_STATUS_THEME[status].variant} size={size} dot>
    {UNIT_STATUS_THEME[status].label}
  </Badge>
);
