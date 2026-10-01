import type { BadgeProps } from '@/components/ui/Badge';
import type { AccountStatus, UserAccount } from '../types/user.types';

export interface AccountStatusInfo {
  label: string;
  description: string;
  badgeVariant: NonNullable<BadgeProps['variant']>;
}

// Single source of truth for account status presentation (identity-access-service AccountStatus).
export const ACCOUNT_STATUS_CONFIG: Record<AccountStatus, AccountStatusInfo> = {
  ACTIVE: {
    label: 'Active',
    description: 'Can sign in and use the portal.',
    badgeVariant: 'success',
  },
  INACTIVE: {
    label: 'Inactive',
    description: 'Cannot sign in. New self-registrations stay inactive until an administrator activates them.',
    badgeVariant: 'neutral',
  },
  SUSPENDED: {
    label: 'Suspended',
    description: 'Blocked by an administrator, including rejected registrations.',
    badgeVariant: 'warning',
  },
};

export const ACCOUNT_STATUSES = Object.keys(ACCOUNT_STATUS_CONFIG) as AccountStatus[];

/** Status changes the identity service accepts (PATCH /users/{userId}/status). */
export const ALLOWED_STATUS_TRANSITIONS: Record<AccountStatus, AccountStatus[]> = {
  ACTIVE: ['INACTIVE', 'SUSPENDED'],
  INACTIVE: ['ACTIVE', 'SUSPENDED'],
  SUSPENDED: ['ACTIVE', 'INACTIVE'],
};

export const canTransitionStatus = (from: AccountStatus, to: AccountStatus): boolean =>
  from === to || ALLOWED_STATUS_TRANSITIONS[from].includes(to);

export const LOCKOUT_MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;

export const isAccountLocked = (user: Pick<UserAccount, 'lockedUntil'>, now: Date = new Date()): boolean =>
  Boolean(user.lockedUntil && new Date(user.lockedUntil) > now);
