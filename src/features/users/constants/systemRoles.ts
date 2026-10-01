import type { SystemRole } from '../types/user.types';

export interface SystemRoleInfo {
  label: string;
  description: string;
}

export const SYSTEM_ROLE_CONFIG: Record<SystemRole, SystemRoleInfo> = {
  SYSTEM_ADMINISTRATOR: {
    label: 'System Administrator',
    description: 'Manages user accounts, roles and platform-wide access.',
  },
  APARTMENT_MANAGER: {
    label: 'Apartment Manager',
    description: 'Oversees building operations and resident administration.',
  },
  OWNER: {
    label: 'Owner',
    description: 'Holds ownership of one or more apartment units.',
  },
  TENANT_RESIDENT: {
    label: 'Tenant / Resident',
    description: 'Lives in an apartment unit under a tenancy.',
  },
  FINANCE_OFFICER: {
    label: 'Finance Officer',
    description: 'Handles billing, invoices and payment records.',
  },
  MAINTENANCE_COORDINATOR: {
    label: 'Maintenance Coordinator',
    description: 'Plans and assigns maintenance work.',
  },
  TECHNICIAN: {
    label: 'Technician',
    description: 'Carries out assigned maintenance tasks.',
  },
  SERVICE_STAFF: {
    label: 'Service Staff',
    description: 'Provides day-to-day building services such as cleaning and front desk.',
  },
  SECURITY_OFFICER: {
    label: 'Security Officer',
    description: 'Manages building security and visitor checkpoints.',
  },
};

export const SYSTEM_ROLES = Object.keys(SYSTEM_ROLE_CONFIG) as SystemRole[];

export const getRoleLabel = (role: SystemRole): string => SYSTEM_ROLE_CONFIG[role].label;

export const isSystemRole = (value: string): value is SystemRole => value in SYSTEM_ROLE_CONFIG;
