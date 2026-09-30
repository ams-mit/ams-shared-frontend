import type { BadgeProps } from '@/components/ui/Badge';
import type { AccountStatus, UserAccount } from '../types/user.types';

export interface AccountStatusInfo {
  label: string;
  description: string;
  badgeVariant: NonNullable<BadgeProps['variant']>;
}

// Single source of truth for account status presentation (identity-access-service AccountStatus).
export const ACCOUNT_STATUS_CONFIG: Record<AccountStatus, AccountStatusInfo> = {
  PENDING_VERIFICATION: {
    label: 'Pending approval',
    description: 'Self-registered; waiting for an administrator to review.',
    badgeVariant: 'warning',
  },
  ACTIVE: {
    label: 'Active',
    description: 'Can sign in and use the portal.',
    badgeVariant: 'success',
  },
  SUSPENDED: {
    label: 'Suspended',
    description: 'Temporarily blocked by an administrator.',
    badgeVariant: 'warning',
  },
  DEACTIVATED: {
    label: 'Deactivated',
    description: 'Permanently disabled; the record is kept.',
    badgeVariant: 'neutral',
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Self-registration was rejected by an administrator.',
    badgeVariant: 'danger',
  },
};

export const ACCOUNT_STATUSES = Object.keys(ACCOUNT_STATUS_CONFIG) as AccountStatus[];

/** Status changes the identity service accepts (US-G1-11). */
export const ALLOWED_STATUS_TRANSITIONS: Record<AccountStatus, AccountStatus[]> = {
  PENDING_VERIFICATION: ['ACTIVE', 'REJECTED'],
  ACTIVE: ['SUSPENDED', 'DEACTIVATED'],
  SUSPENDED: ['ACTIVE', 'DEACTIVATED'],
  DEACTIVATED: [],
  REJECTED: [],
};

export const canTransitionStatus = (from: AccountStatus, to: AccountStatus): boolean =>
  from === to || ALLOWED_STATUS_TRANSITIONS[from].includes(to);

export const LOCKOUT_MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;

export const isAccountLocked = (user: Pick<UserAccount, 'lockedUntil'>, now: Date = new Date()): boolean =>
  Boolean(user.lockedUntil && new Date(user.lockedUntil) > now);
