import { withMockFallback } from '@/features/auth/api/identityClient';
import type { RegistrationRequest, RegistrationStatus } from '../types/registration.types';
import type { UserAccount } from '../types/user.types';
import { mockDelay, registrationMockStore } from './registrationMockStore';
import { identityUserApi } from './userApi';

// Review of self-registered accounts. identity-access-service creates them INACTIVE with
// TENANT_RESIDENT, and has no separate registration resource or REJECTED status:
//   list     GET   /api/v1/users?status=INACTIVE&role=TENANT_RESIDENT
//   approve  PATCH /api/v1/users/{userId}/status  { status: "ACTIVE", reason }
//   reject   PATCH /api/v1/users/{userId}/status  { status: "SUSPENDED", reason }
// The service keeps no review history, so after a reload only pending requests are listed;
// approved and rejected ones appear on the User Accounts tab as Active / Suspended.

const toRegistration = (
  user: UserAccount,
  status: RegistrationStatus,
  review?: { reviewedBy?: string; rejectionReason?: string }
): RegistrationRequest => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  // The requested role is not sent to the service; self-registrations are tenants/residents.
  requestedRole: user.roles.includes('OWNER') ? 'OWNER' : 'TENANT_RESIDENT',
  status,
  createdAt: user.createdAt,
  ...(review && { reviewedAt: new Date().toISOString(), ...review }),
});

export const registrationApi = {
  getRegistrationRequests: (): Promise<RegistrationRequest[]> =>
    withMockFallback(
      async () => {
        const pending = await identityUserApi.listUsers({ status: 'INACTIVE', role: 'TENANT_RESIDENT' });
        return pending
          .map((user) => toRegistration(user, 'PENDING'))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },
      async () => {
        await mockDelay();
        return registrationMockStore.list();
      },
      'Registration requests could not be loaded.'
    ),

  approveRegistration: (id: string, reviewedBy?: string): Promise<RegistrationRequest> =>
    withMockFallback(
      async () => {
        const user = await identityUserApi.patchStatus(id, 'ACTIVE', 'Registration approved');
        return toRegistration(user, 'APPROVED', { reviewedBy });
      },
      async () => {
        await mockDelay();
        return registrationMockStore.approve(id, reviewedBy);
      },
      'The registration could not be approved.'
    ),

  rejectRegistration: (id: string, reason: string, reviewedBy?: string): Promise<RegistrationRequest> =>
    withMockFallback(
      async () => {
        const user = await identityUserApi.patchStatus(id, 'SUSPENDED', `Registration rejected: ${reason}`);
        return toRegistration(user, 'REJECTED', { reviewedBy, rejectionReason: reason });
      },
      async () => {
        await mockDelay();
        return registrationMockStore.reject(id, reason, reviewedBy);
      },
      'The registration could not be rejected.'
    ),
};

export default registrationApi;
