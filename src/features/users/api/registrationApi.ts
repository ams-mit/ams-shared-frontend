import type { RegistrationRequest } from '../types/registration.types';
import { mockDelay, registrationMockStore } from './registrationMockStore';

// Review of self-registered accounts. In identity-access-service these map to:
//   list     GET   /api/v1/users?status=PENDING_VERIFICATION (and reviewed ones)
//   approve  PATCH /api/v1/users/{userId}/status  { status: "ACTIVE" }  + POST /users/{userId}/roles
//   reject   PATCH /api/v1/users/{userId}/status  { status: "REJECTED", reason }
// Mock implementation for the UI-only phase.

export const registrationApi = {
  getRegistrationRequests: async (): Promise<RegistrationRequest[]> => {
    await mockDelay();
    return registrationMockStore.list();
  },

  approveRegistration: async (id: string, reviewedBy?: string): Promise<RegistrationRequest> => {
    await mockDelay();
    return registrationMockStore.approve(id, reviewedBy);
  },

  rejectRegistration: async (id: string, reason: string, reviewedBy?: string): Promise<RegistrationRequest> => {
    await mockDelay();
    return registrationMockStore.reject(id, reason, reviewedBy);
  },
};

export default registrationApi;
