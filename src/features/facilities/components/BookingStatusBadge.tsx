import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { BookingStatus } from '../types/facility.types';

export interface BookingStatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md';
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <Badge variant="success" size={size} dot>
          Approved
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant="warning" size={size} dot>
          Pending Review
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="danger" size={size} dot>
          Rejected
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="neutral" size={size} dot>
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size}>
          {status}
        </Badge>
      );
  }
};
