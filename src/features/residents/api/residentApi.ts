import { userApi } from '@/features/users/api/userApi';
import type { SystemRole } from '@/features/users/types/user.types';
import type { ResidentDirectoryEntry } from '../types/resident.types';
import { relationshipApi } from './relationshipApi';

// Resident directory built from user accounts and approved apartment relationships.
// Mock composition for the UI-only phase — the Resident Management Service will
// return this shape directly (with restricted fields omitted where appropriate).

const RESIDENT_ROLES: SystemRole[] = ['OWNER', 'TENANT_RESIDENT'];

export const residentApi = {
  getResidentDirectory: async (): Promise<ResidentDirectoryEntry[]> => {
    const [users, approved] = await Promise.all([userApi.getUsers(), relationshipApi.getApprovedRelationships()]);

    return users
      .filter((user) => user.roles.some((role) => RESIDENT_ROLES.includes(role)))
      .map((user) => ({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        units: approved
          .filter((rel) => rel.requesterUserId === user.id)
          .map((rel) => ({ unitReference: rel.unitReference, relationshipType: rel.relationshipType })),
      }))
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  },
};
