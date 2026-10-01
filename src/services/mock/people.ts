import { userMockStore } from '@/features/users/api/userMockStore';
import type { UserAccount } from '@/features/users/types/user.types';

// Resident Management profiles in the demo build. Every resident/owner account has one profile
// whose UUID is derived from the user id, so the same person has the same profile id everywhere
// (leases, occupancies, ownerships, the residents directory).

const hex = (seed: string, length: number): string => {
  let out = '';
  let h = 2166136261;
  for (let round = 0; out.length < length; round += 1) {
    for (const ch of `${seed}:${round}`) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619) >>> 0;
    }
    out += h.toString(16).padStart(8, '0');
  }
  return out.slice(0, length);
};

/** Deterministic UUID for seed data, so related seeds can refer to each other. */
export const stableUuid = (seed: string): string => {
  const h = hex(seed, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

/** The resident profile id of a user. */
export const profileIdFor = (userId: string): string => stableUuid(`profile:${userId}`);

const RESIDENT_ROLES = ['TENANT_RESIDENT', 'OWNER'] as const;

export const hasResidentProfile = (user: UserAccount): boolean =>
  user.roles.some((role) => (RESIDENT_ROLES as readonly string[]).includes(role));

/** The account behind a resident profile id (or a user id), if it has a resident profile. */
export const findResidentByProfileId = (id: string): UserAccount | undefined =>
  userMockStore.list().find((u) => hasResidentProfile(u) && (profileIdFor(u.id) === id || u.id === id));

export const findOwnerByProfileId = (id: string): UserAccount | undefined =>
  userMockStore.list().find((u) => u.roles.includes('OWNER') && (profileIdFor(u.id) === id || u.id === id));

/** Accepts either a profile id or a user id and returns the profile id. */
export const toProfileId = (id: string): string => {
  const user = userMockStore.findById(id);
  return user ? profileIdFor(user.id) : id;
};
