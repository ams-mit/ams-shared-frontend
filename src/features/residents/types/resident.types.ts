import type { RelationshipType } from './relationship.types';
import type { ProfileStatus, ProfileType } from './profile.types';

export interface ResidentUnitLink {
  unitReference: string;
  relationshipType: RelationshipType;
}

export interface ResidentDirectoryEntry {
  userId: string;
  firstName: string;
  lastName: string;
  /** Restricted — render only through presentRestrictedValue. */
  email: string;
  /** Restricted — render only through presentRestrictedValue. */
  phone?: string;
  /** The most active of the person's profiles. */
  status: ProfileStatus;
  /** Which resident-management profiles the person has. */
  profileTypes: ProfileType[];
  units: ResidentUnitLink[];
}
