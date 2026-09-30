export type SystemRole =
  | 'SYSTEM_ADMINISTRATOR'
  | 'APARTMENT_MANAGER'
  | 'OWNER'
  | 'TENANT_RESIDENT'
  | 'FINANCE_OFFICER'
  | 'MAINTENANCE_COORDINATOR'
  | 'TECHNICIAN'
  | 'SECURITY_OFFICER';

/** Roles a person may request through self-registration (identity-access-service RegisterRequest). */
export type SelfRegistrationRole = Extract<SystemRole, 'OWNER' | 'TENANT_RESIDENT'>;

// Matches identity-access-service `AccountStatus`. Only referenced through
// ACCOUNT_STATUS_CONFIG so presentation stays in one place.
export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'REJECTED';

/**
 * A user account as returned by the identity service (AdminUserDetailResponse).
 * Never contains passwords — the API does not return them.
 */
export interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: SystemRole[];
  status: AccountStatus;
  createdAt: string;
  /** Role requested during self-registration; reviewed by an administrator. */
  requestedRole?: SelfRegistrationRole;
  mustChangePassword?: boolean;
  failedAttemptCount?: number;
  /** Lockout is separate from status: 5 failed sign-ins lock the account for 15 minutes. */
  lockedUntil?: string;
  /** Set while an email change is waiting for verification. */
  pendingEmail?: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: SystemRole[];
  status: AccountStatus;
  /** Create only: one-time password the administrator gives the new user. */
  temporaryPassword: string;
}

export type CreateUserRequest = Omit<UserFormValues, 'status'>;
export type UpdateUserRequest = Omit<UserFormValues, 'roles' | 'temporaryPassword'>;

export interface UserListFilters {
  search: string;
  role: SystemRole | 'ALL';
  status: AccountStatus | 'ALL';
}
