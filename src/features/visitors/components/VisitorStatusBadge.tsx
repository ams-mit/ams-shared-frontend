import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { VisitorStatus } from '../types/visitor.types';

export interface VisitorStatusBadgeProps {
  status: VisitorStatus;
  size?: 'sm' | 'md';
}

export const VisitorStatusBadge: React.FC<VisitorStatusBadgeProps> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'CHECKED_IN':
      return (
        <Badge variant="success" size={size} dot>
          Checked In
        </Badge>
      );
    case 'CHECKED_OUT':
      return (
        <Badge variant="neutral" size={size} dot>
          Checked Out
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="danger" size={size} dot>
          Cancelled
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge variant="warning" size={size} dot>
          Expired
        </Badge>
      );
    case 'EXPECTED':
    default:
      return (
        <Badge variant="info" size={size} dot>
          Expected Arrival
        </Badge>
      );
  }
};
