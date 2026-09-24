export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  RESIDENT: 'RESIDENT',
  OWNER: 'OWNER',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface MockUser {
  id: string;
  name: string;
  role: UserRole;
  unitId?: string;
  email: string;
}

export const PRESET_USERS: MockUser[] = [
  {
    id: 'resident-001',
    name: 'Sarah Jenkins',
    role: 'RESIDENT',
    unitId: 'Tower A - 402',
    email: 'sarah.j@ams-community.org',
  },
  {
    id: 'resident-002',
    name: 'Michael Chen',
    role: 'RESIDENT',
    unitId: 'Tower B - 205',
    email: 'michael.c@ams-community.org',
  },
  {
    id: 'resident-003',
    name: 'Priya Patel',
    role: 'RESIDENT',
    unitId: 'Tower A - 108',
    email: 'priya.p@ams-community.org',
  },
  {
    id: 'resident-004',
    name: 'David Kim',
    role: 'RESIDENT',
    unitId: 'Tower B - 512',
    email: 'david.k@ams-community.org',
  },
  {
    id: 'resident-005',
    name: 'Elena Rostova',
    role: 'RESIDENT',
    unitId: 'Tower A - 904',
    email: 'elena.r@ams-community.org',
  },
  {
    id: 'resident-006',
    name: 'Alexander Wright',
    role: 'RESIDENT',
    unitId: 'Tower B - 801',
    email: 'alex.w@ams-community.org',
  },
  {
    id: 'staff-001',
    name: 'Officer David Vance',
    role: 'STAFF',
    email: 'security.staff@ams-community.org',
  },
  {
    id: 'admin-001',
    name: 'Eleanor Sterling (Manager)',
    role: 'ADMIN',
    email: 'admin@ams-community.org',
  },
];

export const getRegisteredResidents = (): MockUser[] =>
  PRESET_USERS.filter((u) => u.role === 'RESIDENT');

export const findResidentById = (residentId: string): MockUser | undefined => {
  const cleanId = residentId.trim().toLowerCase();
  return PRESET_USERS.find(
    (u) => u.role === 'RESIDENT' && u.id.toLowerCase() === cleanId
  );
};

export const findUserByIdOrName = (identifier: string): MockUser | undefined => {
  const clean = identifier.trim().toLowerCase();
  return PRESET_USERS.find(
    (u) => u.id.toLowerCase() === clean || u.name.toLowerCase() === clean
  );
};
