import { loadPersisted, mockDelay, savePersisted } from '@/features/users/api/userMockStore';
import { RELATIONSHIP_TYPE_CONFIG } from '../constants/relationships';
import type {
  ApartmentRelationship,
  RelationshipRequester,
  SubmitRelationshipRequest,
  UnitValidation,
} from '../types/relationship.types';

// Apartment relationship requests and reviews (resident-management-service /api/v1/relationships).
// Mock implementation for the UI-only phase — replace each body with an apiClient
// call during API/Gateway integration.

/** What the service currently reports while Group 2's unit contract is not agreed. */
const PENDING_UNIT_VALIDATION: UnitValidation = {
  status: 'NOT_AVAILABLE',
  reason: 'Group 2 unit/occupancy contract not yet agreed',
};

const SEED_RELATIONSHIPS: ApartmentRelationship[] = [
  {
    relationshipId: 'rel-001',
    requesterUserId: 'resident-001',
    requesterName: 'Sarah Jenkins',
    requesterEmail: 'sarah.j@ams-community.org',
    unitReference: 'Tower A - 402',
    relationshipType: 'TENANT_RESIDENT',
    status: 'APPROVED',
    createdAt: '2025-03-02T10:30:00Z',
    decidedAt: '2025-03-03T09:12:00Z',
    decidedBy: 'Eleanor Sterling',
  },
  {
    relationshipId: 'rel-002',
    requesterUserId: 'resident-002',
    requesterName: 'Michael Chen',
    requesterEmail: 'michael.c@ams-community.org',
    unitReference: 'Tower B - 205',
    relationshipType: 'OWNER',
    status: 'APPROVED',
    createdAt: '2025-03-05T15:00:00Z',
    decidedAt: '2025-03-06T11:45:00Z',
    decidedBy: 'Eleanor Sterling',
  },
  {
    relationshipId: 'rel-003',
    requesterUserId: 'resident-002',
    requesterName: 'Michael Chen',
    requesterEmail: 'michael.c@ams-community.org',
    unitReference: 'Tower A - 101',
    relationshipType: 'TENANT_RESIDENT',
    status: 'PENDING',
    supportingInfo: 'Moving into A-101 while my own unit is being renovated.',
    createdAt: '2026-09-22T08:15:00Z',
    unitValidation: PENDING_UNIT_VALIDATION,
  },
  {
    relationshipId: 'rel-004',
    requesterUserId: 'resident-003',
    requesterName: 'Priya Patel',
    requesterEmail: 'priya.p@ams-community.org',
    unitReference: 'Tower A - 108',
    relationshipType: 'TENANT_RESIDENT',
    status: 'APPROVED',
    createdAt: '2025-04-11T08:40:00Z',
    decidedAt: '2025-04-12T14:05:00Z',
    decidedBy: 'Eleanor Sterling',
  },
  {
    relationshipId: 'rel-005',
    requesterUserId: 'resident-003',
    requesterName: 'Priya Patel',
    requesterEmail: 'priya.p@ams-community.org',
    unitReference: 'Tower B - 310',
    relationshipType: 'OWNER',
    status: 'REJECTED',
    supportingInfo: 'Recently purchased this unit.',
    createdAt: '2026-06-03T12:20:00Z',
    decidedAt: '2026-06-05T10:00:00Z',
    decidedBy: 'Eleanor Sterling',
    decisionReason:
      'Ownership transfer is not yet recorded for this unit. Please resubmit once the title transfer is complete.',
  },
  {
    relationshipId: 'rel-006',
    requesterUserId: 'resident-004',
    requesterName: 'David Kim',
    requesterEmail: 'david.k@ams-community.org',
    unitReference: 'Tower B - 512',
    relationshipType: 'OWNER',
    status: 'PENDING',
    createdAt: '2026-09-18T16:30:00Z',
    unitValidation: PENDING_UNIT_VALIDATION,
  },
  {
    relationshipId: 'rel-007',
    requesterUserId: 'resident-005',
    requesterName: 'Elena Rostova',
    requesterEmail: 'elena.r@ams-community.org',
    unitReference: 'Tower A - 904',
    relationshipType: 'TENANT_RESIDENT',
    status: 'PENDING',
    supportingInfo: 'Lease signed with the unit owner in August.',
    createdAt: '2026-09-24T11:05:00Z',
    unitValidation: PENDING_UNIT_VALIDATION,
  },
  {
    relationshipId: 'rel-008',
    requesterUserId: 'resident-006',
    requesterName: 'Alexander Wright',
    requesterEmail: 'alex.w@ams-community.org',
    unitReference: 'Tower B - 801',
    relationshipType: 'OWNER',
    status: 'APPROVED',
    createdAt: '2025-06-22T13:30:00Z',
    decidedAt: '2025-06-23T09:00:00Z',
    decidedBy: 'Eleanor Sterling',
  },
];

// Persisted like the user store so accounts and their relationships stay in step across reloads.
const RELATIONSHIPS_KEY = 'ams_mock_relationships_v2';

let relationships: ApartmentRelationship[] = loadPersisted(RELATIONSHIPS_KEY, () =>
  SEED_RELATIONSHIPS.map((r) => ({ ...r }))
);

const persist = () => savePersisted(RELATIONSHIPS_KEY, relationships);

const clone = (rel: ApartmentRelationship): ApartmentRelationship => ({ ...rel });

const newestFirst = (a: ApartmentRelationship, b: ApartmentRelationship) => b.createdAt.localeCompare(a.createdAt);

const requirePending = (relationshipId: string): ApartmentRelationship => {
  const request = relationships.find((r) => r.relationshipId === relationshipId);
  if (!request) throw new Error('This relationship request could not be found.');
  if (request.status !== 'PENDING') throw new Error('This request has already been reviewed.');
  return request;
};

const saveDecision = (relationshipId: string, patch: Partial<ApartmentRelationship>): ApartmentRelationship => {
  let updated: ApartmentRelationship | undefined;
  relationships = relationships.map((r) => {
    if (r.relationshipId !== relationshipId) return r;
    updated = { ...r, ...patch, decidedAt: new Date().toISOString() };
    return updated;
  });
  persist();
  return clone(updated as ApartmentRelationship);
};

export const relationshipApi = {
  /** GET /relationships/me */
  getMyRelationships: async (userId: string): Promise<ApartmentRelationship[]> => {
    await mockDelay();
    return relationships.filter((r) => r.requesterUserId === userId).sort(newestFirst).map(clone);
  },

  /** GET /relationships (SYSTEM_ADMINISTRATOR) */
  getRelationshipRequests: async (): Promise<ApartmentRelationship[]> => {
    await mockDelay();
    return [...relationships].sort(newestFirst).map(clone);
  },

  getApprovedRelationships: async (): Promise<ApartmentRelationship[]> => {
    await mockDelay();
    return relationships.filter((r) => r.status === 'APPROVED').map(clone);
  },

  /** POST /relationships */
  submitRequest: async (
    requester: RelationshipRequester,
    payload: SubmitRelationshipRequest
  ): Promise<ApartmentRelationship> => {
    await mockDelay(650);
    const duplicate = relationships.find(
      (r) =>
        r.requesterUserId === requester.userId &&
        r.unitReference === payload.unitReference &&
        r.relationshipType === payload.relationshipType &&
        r.status !== 'REJECTED'
    );
    if (duplicate) {
      const typeLabel = RELATIONSHIP_TYPE_CONFIG[payload.relationshipType].label;
      throw new Error(
        `You already have a ${duplicate.status === 'PENDING' ? 'pending' : 'approved'} ${typeLabel} relationship for ${payload.unitReference}.`
      );
    }

    const created: ApartmentRelationship = {
      relationshipId: `rel-${Date.now()}`,
      requesterUserId: requester.userId,
      requesterName: requester.name,
      requesterEmail: requester.email,
      unitReference: payload.unitReference,
      relationshipType: payload.relationshipType,
      supportingInfo: payload.supportingInfo?.trim() || undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      unitValidation: PENDING_UNIT_VALIDATION,
    };
    relationships = [created, ...relationships];
    persist();
    return clone(created);
  },

  /** PATCH /relationships/{id}/approve (SYSTEM_ADMINISTRATOR) */
  approveRequest: async (relationshipId: string, reviewerName: string): Promise<ApartmentRelationship> => {
    await mockDelay();
    requirePending(relationshipId);
    return saveDecision(relationshipId, { status: 'APPROVED', decidedBy: reviewerName, decisionReason: undefined });
  },

  /** PATCH /relationships/{id}/reject (SYSTEM_ADMINISTRATOR) — reason required, max 500 characters. */
  rejectRequest: async (
    relationshipId: string,
    reviewerName: string,
    reason: string
  ): Promise<ApartmentRelationship> => {
    await mockDelay();
    requirePending(relationshipId);
    if (!reason.trim()) throw new Error('A rejection reason is required.');
    return saveDecision(relationshipId, {
      status: 'REJECTED',
      decidedBy: reviewerName,
      decisionReason: reason.trim().slice(0, 500),
    });
  },
};
