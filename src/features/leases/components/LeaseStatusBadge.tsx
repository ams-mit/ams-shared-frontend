import React from 'react';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import type { LeaseStatus } from '../types/lease.types';

const VARIANT: Record<LeaseStatus, NonNullable<BadgeProps['variant']>> = {
  DRAFT: 'neutral',
  PENDING: 'warning',
  ACTIVE: 'success',
  TERMINATED: 'danger',
  EXPIRED: 'info',
  CANCELLED: 'neutral',
};

export const LEASE_STATUS_LABEL: Record<LeaseStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending Activation',
  ACTIVE: 'Active',
  TERMINATED: 'Terminated',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

export const LeaseStatusBadge: React.FC<{ status: LeaseStatus }> = ({ status }) => (
  <Badge variant={VARIANT[status] ?? 'neutral'} dot>
    {LEASE_STATUS_LABEL[status] ?? status}
  </Badge>
);
