import type { UserAccount } from '../types/user.types';

/*
 * In-memory stand-in for the Identity Access Service during the UI-only phase.
 * The api modules are the only consumers; swap their bodies for apiClient calls
 * during API/Gateway integration and delete this file.
 *
 * Passwords live in a separate credential table and are never returned with a
 * user — the real API never returns passwords. Plain-text storage is acceptable
 * only because this is local mock data.
 *
 * User ids for the seeded residents, staff and admin match the persona ids in
 * `constants/roles.ts` so the demo persona switcher has matching profiles.
 */

interface Credentials {
  password?: string;
  temporaryPassword?: string;
}

interface SeedUser extends UserAccount {
  credentials: Credentials;
}

const SEED_USERS: SeedUser[] = [
  {
    id: 'admin-001',
    firstName: 'Eleanor',
    lastName: 'Sterling',
    email: 'admin@ams-community.org',
    phone: '+1 555-0100',
    roles: ['SYSTEM_ADMINISTRATOR', 'APARTMENT_MANAGER'],
    status: 'ACTIVE',
    createdAt: '2025-01-06T09:00:00Z',
    credentials: { password: 'admin123' },
  },
  {
    id: 'staff-001',
    firstName: 'David',
    lastName: 'Vance',
    email: 'security.staff@ams-community.org',
    phone: '+1 555-0111',
    roles: ['SECURITY_OFFICER'],
    status: 'ACTIVE',
    createdAt: '2025-02-10T09:00:00Z',
    credentials: { password: 'staff123' },
  },
  {
    id: 'resident-001',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@ams-community.org',
    phone: '+1 555-0192',
    roles: ['TENANT_RESIDENT'],
    status: 'ACTIVE',
    createdAt: '2025-03-02T10:15:00Z',
    credentials: { password: 'resident123' },
  },
  {
    id: 'resident-002',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.c@ams-community.org',
    phone: '+1 555-0144',
    roles: ['OWNER', 'TENANT_RESIDENT'],
    status: 'ACTIVE',
    createdAt: '2025-03-05T14:40:00Z',
    credentials: { password: 'owner123' },
  },
  {
    id: 'resident-003',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.p@ams-community.org',
    phone: '+1 555-0178',
    roles: ['TENANT_RESIDENT'],
    status: 'ACTIVE',
    createdAt: '2025-04-11T08:20:00Z',
    credentials: { password: 'resident123' },
  },
  {
    id: 'resident-004',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.k@ams-community.org',
    phone: '+1 555-0129',
    roles: ['OWNER'],
    status: 'ACTIVE',
    createdAt: '2025-05-19T16:05:00Z',
    credentials: { password: 'owner123' },
  },
  {
    id: 'resident-005',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.r@ams-community.org',
    phone: '+1 555-0163',
    roles: ['TENANT_RESIDENT'],
    status: 'ACTIVE',
    createdAt: '2025-06-01T11:30:00Z',
    credentials: { password: 'resident123' },
  },
  {
    id: 'resident-006',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alex.w@ams-community.org',
    phone: '+1 555-0187',
    roles: ['OWNER'],
    status: 'ACTIVE',
    createdAt: '2025-06-22T13:10:00Z',
    credentials: { password: 'owner123' },
  },
  {
    id: 'usr-101',
    firstName: 'Grace',
    lastName: 'Okafor',
    email: 'grace.o@ams-community.org',
    phone: '+1 555-0151',
    roles: ['FINANCE_OFFICER'],
    status: 'ACTIVE',
    createdAt: '2025-07-03T09:45:00Z',
    credentials: { password: 'finance123' },
  },
  {
    id: 'usr-102',
    firstName: 'Tomas',
    lastName: 'Rivera',
    email: 'tomas.r@ams-community.org',
    phone: '+1 555-0170',
    roles: ['MAINTENANCE_COORDINATOR'],
    status: 'ACTIVE',
    createdAt: '2025-07-15T10:00:00Z',
    credentials: { password: 'maint123' },
  },
  {
    id: 'usr-103',
    firstName: 'Ken',
    lastName: 'Watanabe',
    email: 'ken.w@ams-community.org',
    phone: '+1 555-0138',
    roles: ['TECHNICIAN'],
    status: 'SUSPENDED',
    createdAt: '2025-08-08T15:25:00Z',
    credentials: { password: 'tech1234' },
  },
  {
    id: 'usr-105',
    firstName: 'Ravi',
    lastName: 'Menon',
    email: 'ravi.m@ams-community.org',
    phone: '+1 555-0199',
    roles: ['TENANT_RESIDENT'],
    status: 'ACTIVE',
    failedAttemptCount: 5,
    lockedUntil: '2030-01-01T00:00:00Z',
    createdAt: '2025-09-30T17:50:00Z',
    credentials: { password: 'user1234' },
  },
  {
    id: 'usr-106',
    firstName: 'Nadia',
    lastName: 'Farouk',
    email: 'nadia.f@ams-community.org',
    roles: ['MAINTENANCE_COORDINATOR'],
    status: 'DEACTIVATED',
    createdAt: '2024-11-12T08:00:00Z',
    credentials: { password: 'user1234' },
  },
  // Self-registered accounts (reviewed on the Registrations tab)
  {
    id: 'usr-104',
    firstName: 'Laura',
    lastName: 'Bennett',
    email: 'laura.b@ams-community.org',
    roles: [],
    requestedRole: 'TENANT_RESIDENT',
    status: 'PENDING_VERIFICATION',
    createdAt: '2026-09-20T12:00:00Z',
    credentials: { password: 'welcome123' },
  },
  {
    id: 'reg-101',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.v@example.com',
    phone: '+1 555-0182',
    roles: [],
    requestedRole: 'TENANT_RESIDENT',
    status: 'PENDING_VERIFICATION',
    createdAt: '2026-09-28T14:30:00Z',
    credentials: { password: 'welcome123' },
  },
  {
    id: 'reg-102',
    firstName: 'Sophia',
    lastName: 'Martinez',
    email: 'sophia.m@example.com',
    phone: '+1 555-0194',
    roles: [],
    requestedRole: 'OWNER',
    status: 'PENDING_VERIFICATION',
    createdAt: '2026-09-29T09:15:00Z',
    credentials: { password: 'welcome123' },
  },
  {
    id: 'reg-103',
    firstName: 'Julian',
    lastName: 'Thorne',
    email: 'julian.t@example.com',
    phone: '+1 555-0133',
    roles: [],
    requestedRole: 'TENANT_RESIDENT',
    status: 'PENDING_VERIFICATION',
    createdAt: '2026-09-29T16:45:00Z',
    credentials: { password: 'welcome123' },
  },
  {
    id: 'reg-104',
    firstName: 'Amanda',
    lastName: 'Hayes',
    email: 'amanda.h@example.com',
    phone: '+1 555-0171',
    roles: ['OWNER'],
    requestedRole: 'OWNER',
    status: 'ACTIVE',
    createdAt: '2026-09-25T11:00:00Z',
    credentials: { password: 'welcome123' },
  },
  {
    id: 'reg-105',
    firstName: 'Derek',
    lastName: 'Foster',
    email: 'derek.f@example.com',
    phone: '+1 555-0112',
    roles: [],
    requestedRole: 'TENANT_RESIDENT',
    status: 'REJECTED',
    createdAt: '2026-09-24T10:00:00Z',
    credentials: { password: 'welcome123' },
  },
];

// ---- Local persistence (mock only) -------------------------------------------------

/** Reads a value saved by `savePersisted`, falling back when absent or unreadable. */
export const loadPersisted = <T,>(key: string, fallback: () => T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // Storage unavailable or corrupt — use the seed data.
  }
  return fallback();
};

export const savePersisted = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — keep working in memory.
  }
};

// Bump the version whenever the shape of the seed data changes.
const USERS_KEY = 'ams_mock_users_v2';
const CREDENTIALS_KEY = 'ams_mock_credentials_v2';

const MOCK_LATENCY_MS = 450;

/** Simulates network latency so loading states are visible during the UI-only phase. */
export const mockDelay = (ms: number = MOCK_LATENCY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const cloneUser = (user: UserAccount): UserAccount => ({ ...user, roles: [...user.roles] });

let users: UserAccount[] = loadPersisted(USERS_KEY, () =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SEED_USERS.map(({ credentials, ...user }) => cloneUser(user))
);
let credentials: Record<string, Credentials> = loadPersisted(CREDENTIALS_KEY, () =>
  Object.fromEntries(SEED_USERS.map((u) => [u.id, { ...u.credentials }]))
);

const persist = () => {
  savePersisted(USERS_KEY, users);
  savePersisted(CREDENTIALS_KEY, credentials);
};

export type PasswordMatch = 'permanent' | 'temporary' | null;

export const userMockStore = {
  list: (): UserAccount[] => users.map(cloneUser),

  findById: (id: string): UserAccount | undefined => {
    const user = users.find((u) => u.id === id);
    return user ? cloneUser(user) : undefined;
  },

  /** Matches the verified email only — a pending (unverified) email can't be used to sign in. */
  findByEmail: (email: string): UserAccount | undefined => {
    const target = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === target);
    return user ? cloneUser(user) : undefined;
  },

  isEmailTaken: (email: string, excludeUserId?: string): boolean => {
    const target = email.trim().toLowerCase();
    return users.some(
      (u) =>
        u.id !== excludeUserId &&
        (u.email.toLowerCase() === target || u.pendingEmail?.toLowerCase() === target)
    );
  },

  insert: (user: UserAccount, userCredentials: Credentials): UserAccount => {
    users = [cloneUser(user), ...users];
    credentials = { ...credentials, [user.id]: { ...userCredentials } };
    persist();
    return cloneUser(user);
  },

  update: (id: string, patch: Partial<Omit<UserAccount, 'id'>>): UserAccount | undefined => {
    let updated: UserAccount | undefined;
    users = users.map((u) => {
      if (u.id !== id) return u;
      updated = { ...u, ...patch };
      return updated;
    });
    if (updated) persist();
    return updated ? cloneUser(updated) : undefined;
  },

  matchPassword: (userId: string, password: string): PasswordMatch => {
    const stored = credentials[userId];
    if (!stored || !password) return null;
    if (stored.temporaryPassword && password === stored.temporaryPassword) return 'temporary';
    if (stored.password && password === stored.password) return 'permanent';
    return null;
  },

  /** Sets a permanent password and clears any temporary password / forced-change flag. */
  setPassword: (userId: string, newPassword: string): void => {
    credentials = { ...credentials, [userId]: { password: newPassword } };
    users = users.map((u) => (u.id === userId ? { ...u, mustChangePassword: false } : u));
    persist();
  },
};
