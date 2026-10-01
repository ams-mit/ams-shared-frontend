import { userApi } from '@/features/users/api/userApi';
import type { SystemRole } from '@/features/users/types/user.types';
import type { ResidentDirectoryEntry } from '../types/resident.types';
import type { ProfileStatus, ProfileType, ResidentProfile } from '../types/profile.types';
import { relationshipApi } from './relationshipApi';
import { residentProfileApi, withResidentFallback } from './residentProfileApi';

// Resident directory: resident, owner and tenant profiles from resident-management-service,
// grouped by user. Unit links still come from the (mocked) apartment relationships, which
// the service doesn't expose yet. When the service is unreachable the directory is built
// from the offline demo accounts instead.

const DIRECTORY_TYPES: ProfileType[] = ['RESIDENT', 'OWNER', 'TENANT'];

const STATUS_PRIORITY: ProfileStatus[] = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

const buildFromProfiles = async (): Promise<ResidentDirectoryEntry[]> => {
  const [lists, approved] = await Promise.all([
    Promise.all(DIRECTORY_TYPES.map((type) => residentProfileApi.listAll(type))),
    relationshipApi.getApprovedRelationships(),
  ]);

  const byUser = new Map<string, { profile: ResidentProfile; types: ProfileType[]; statuses: ProfileStatus[] }>();
  lists.forEach((profiles, index) => {
    for (const profile of profiles) {
      const entry = byUser.get(profile.userId) ?? { profile, types: [], statuses: [] };
      entry.types.push(DIRECTORY_TYPES[index]);
      entry.statuses.push(profile.status);
      byUser.set(profile.userId, entry);
    }
  });

  return [...byUser.values()].map(({ profile, types, statuses }) => ({
    userId: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone || undefined,
    // The most active of the person's profiles.
    status: STATUS_PRIORITY.find((s) => statuses.includes(s)) ?? 'ACTIVE',
    profileTypes: types,
    units: approved
      .filter((rel) => rel.requesterUserId === profile.userId)
      .map((rel) => ({ unitReference: rel.unitReference, relationshipType: rel.relationshipType })),
  }));
};

const MOCK_PROFILE_TYPES: Partial<Record<SystemRole, ProfileType>> = { OWNER: 'OWNER', TENANT_RESIDENT: 'TENANT' };

const buildFromDemoAccounts = async (): Promise<ResidentDirectoryEntry[]> => {
  const [users, approved] = await Promise.all([userApi.getUsers(), relationshipApi.getApprovedRelationships()]);
  return users
    .filter((user) => user.roles.some((role) => role in MOCK_PROFILE_TYPES))
    .map((user) => ({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      profileTypes: user.roles.map((role) => MOCK_PROFILE_TYPES[role]).filter((t): t is ProfileType => Boolean(t)),
      units: approved
        .filter((rel) => rel.requesterUserId === user.id)
        .map((rel) => ({ unitReference: rel.unitReference, relationshipType: rel.relationshipType })),
    }));
};

export const residentApi = {
  /** Listing profiles requires SYSTEM_ADMINISTRATOR or APARTMENT_MANAGER. */
  getResidentDirectory: async (): Promise<ResidentDirectoryEntry[]> => {
    const entries = await withResidentFallback(buildFromProfiles, buildFromDemoAccounts, 'Residents could not be loaded.');
    return entries.sort((a, b) => a.lastName.localeCompare(b.lastName));
  },
};
