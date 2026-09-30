import type { BadgeProps } from '@/components/ui/Badge';
import type { SelectOption } from '@/components/ui/Select';
import type { RelationshipStatus, RelationshipType } from '../types/relationship.types';

export const RELATIONSHIP_TYPE_CONFIG: Record<RelationshipType, { label: string; description: string }> = {
  OWNER: {
    label: 'Owner',
    description: 'You own this unit, or are its registered co-owner.',
  },
  TENANT_RESIDENT: {
    label: 'Tenant / Resident',
    description: 'You live in this unit under a lease or as a household member.',
  },
};

export const RELATIONSHIP_TYPES = Object.keys(RELATIONSHIP_TYPE_CONFIG) as RelationshipType[];

export const RELATIONSHIP_STATUS_CONFIG: Record<
  RelationshipStatus,
  { label: string; badgeVariant: NonNullable<BadgeProps['variant']> }
> = {
  PENDING: { label: 'Pending review', badgeVariant: 'warning' },
  APPROVED: { label: 'Approved', badgeVariant: 'success' },
  REJECTED: { label: 'Rejected', badgeVariant: 'danger' },
};

export const RELATIONSHIP_STATUSES = Object.keys(RELATIONSHIP_STATUS_CONFIG) as RelationshipStatus[];

export const REJECTION_REASON_MIN_LENGTH = 10;
export const REQUEST_NOTES_MAX_LENGTH = 500;

/*
 * Placeholder unit list for the UI-only phase. Units belong to Group 2
 * (Property & Units); replace with their unit lookup during integration.
 */
export const PLACEHOLDER_UNIT_OPTIONS: SelectOption[] = [
  { value: 'Tower A - 101', label: 'Tower A - 101', subLabel: 'Tower A · Floor 1' },
  { value: 'Tower A - 108', label: 'Tower A - 108', subLabel: 'Tower A · Floor 1' },
  { value: 'Tower A - 402', label: 'Tower A - 402', subLabel: 'Tower A · Floor 4' },
  { value: 'Tower A - 904', label: 'Tower A - 904', subLabel: 'Tower A · Floor 9' },
  { value: 'Tower B - 205', label: 'Tower B - 205', subLabel: 'Tower B · Floor 2' },
  { value: 'Tower B - 310', label: 'Tower B - 310', subLabel: 'Tower B · Floor 3' },
  { value: 'Tower B - 512', label: 'Tower B - 512', subLabel: 'Tower B · Floor 5' },
  { value: 'Tower B - 801', label: 'Tower B - 801', subLabel: 'Tower B · Floor 8' },
];
