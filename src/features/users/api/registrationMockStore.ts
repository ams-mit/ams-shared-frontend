import type { RegistrationRequest, RegistrationStatus } from '../types/registration.types';
import type { UserAccount } from '../types/user.types';
import { loadPersisted, mockDelay, savePersisted, userMockStore } from './userMockStore';

export { mockDelay };

/*
 * Self-registrations are ordinary user accounts that carry a `requestedRole`. Like
 * identity-access-service they start INACTIVE; approval sets ACTIVE and rejection sets
 * SUSPENDED. This store only keeps the review decision details (who reviewed, when, and
 * the rejection reason), keyed by user id.
 */

interface ReviewRecord {
  reviewedAt: string;
  reviewedBy: string;
  rejectionReason?: string;
}

const REVIEWS_KEY = 'ams_registration_reviews_v3';

const SEED_REVIEWS: Record<string, ReviewRecord> = {
  'reg-104': { reviewedAt: '2026-09-25T14:00:00Z', reviewedBy: 'Eleanor Sterling' },
  'reg-105': {
    reviewedAt: '2026-09-24T15:30:00Z',
    reviewedBy: 'Eleanor Sterling',
    rejectionReason: 'Invalid lease documentation attached; unit occupancy could not be verified.',
  },
};

let reviews: Record<string, ReviewRecord> = loadPersisted(REVIEWS_KEY, () => ({ ...SEED_REVIEWS }));

const toRegistrationStatus = (user: UserAccount): RegistrationStatus => {
  const review = reviews[user.id];
  if (review?.rejectionReason) return 'REJECTED';
  if (!review && user.status === 'INACTIVE') return 'PENDING';
  return 'APPROVED';
};

const toRegistration = (user: UserAccount): RegistrationRequest | null => {
  if (!user.requestedRole) return null;
  const review = reviews[user.id];
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    requestedRole: user.requestedRole,
    status: toRegistrationStatus(user),
    createdAt: user.createdAt,
    reviewedAt: review?.reviewedAt,
    reviewedBy: review?.reviewedBy,
    rejectionReason: review?.rejectionReason,
  };
};

const requirePending = (id: string): UserAccount => {
  const user = userMockStore.findById(id);
  if (!user || !user.requestedRole) throw new Error('Registration request not found.');
  if (toRegistrationStatus(user) !== 'PENDING') {
    throw new Error('This registration has already been reviewed.');
  }
  return user;
};

const saveReview = (id: string, review: ReviewRecord) => {
  reviews = { ...reviews, [id]: review };
  savePersisted(REVIEWS_KEY, reviews);
};

export const registrationMockStore = {
  list: (): RegistrationRequest[] =>
    userMockStore
      .list()
      .map(toRegistration)
      .filter((r): r is RegistrationRequest => r !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  /** Approve: account becomes ACTIVE and is granted the requested role. */
  approve: (id: string, reviewedBy = 'System Administrator'): RegistrationRequest => {
    const user = requirePending(id);
    const roles = user.roles.includes(user.requestedRole!) ? user.roles : [...user.roles, user.requestedRole!];
    const updated = userMockStore.update(id, { status: 'ACTIVE', roles })!;
    saveReview(id, { reviewedAt: new Date().toISOString(), reviewedBy });
    return toRegistration(updated)!;
  },

  /** Reject: account becomes SUSPENDED; the reason is kept for the requester and auditors. */
  reject: (id: string, reason: string, reviewedBy = 'System Administrator'): RegistrationRequest => {
    const user = requirePending(id);
    if (!reason.trim()) throw new Error('A rejection reason is required.');
    const updated = userMockStore.update(user.id, { status: 'SUSPENDED' })!;
    saveReview(id, { reviewedAt: new Date().toISOString(), reviewedBy, rejectionReason: reason.trim() });
    return toRegistration(updated)!;
  },
};
