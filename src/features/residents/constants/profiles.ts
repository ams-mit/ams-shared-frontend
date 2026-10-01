import type { BadgeProps } from '@/components/ui/Badge';
import type { ProfileStatus, ProfileType } from '../types/profile.types';

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  RESIDENT: 'Resident',
  OWNER: 'Owner',
  TENANT: 'Tenant',
  STAFF: 'Staff',
};

export const PROFILE_STATUS_CONFIG: Record<ProfileStatus, { label: string; badgeVariant: NonNullable<BadgeProps['variant']> }> = {
  ACTIVE: { label: 'Active', badgeVariant: 'success' },
  INACTIVE: { label: 'Inactive', badgeVariant: 'warning' },
  ARCHIVED: { label: 'Archived', badgeVariant: 'neutral' },
};
