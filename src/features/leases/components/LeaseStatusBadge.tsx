import React from 'react';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import type { LeaseStatus } from '../types/lease.types';

const VARIANT: Record<LeaseStatus, NonNullable<BadgeProps['variant']>> = {
  DRAFT: 'neutral',
  PENDING_ACTIVATION: 'warning',
  ACTIVE: 'success',
  TERMINATED: 'danger',
  EXPIRED: 'info',
};

export const LEASE_STATUS_LABEL: Record<LeaseStatus, string> = {
  DRAFT: 'Draft',
  PENDING_ACTIVATION: 'Pending Activation',
  ACTIVE: 'Active',
  TERMINATED: 'Terminated',
  EXPIRED: 'Expired',
};

export const LeaseStatusBadge: React.FC<{ status: LeaseStatus }> = ({ status }) => (
  <Badge variant={VARIANT[status]} dot>
    {LEASE_STATUS_LABEL[status]}
  </Badge>
);
