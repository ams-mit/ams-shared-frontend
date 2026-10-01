import { USE_MOCK_DATA } from '@/services/mock/mockMode';
import { mockLeaseApi } from '@/services/mock/propertyLeaseMock';
import { leaseClient } from './leaseClient';
import type {
  ApiEnvelope,
  CreateLeaseRequest,
  Lease,
  LeaseHistory,
  LeaseListFilters,
  PaginationMeta,
  UpdateLeaseStatusRequest,
} from '../types/lease.types';

export const unwrap = <T>(envelope: ApiEnvelope<T>): T => {
  if (envelope.data === null || envelope.data === undefined) {
    throw new Error(envelope.message || 'The server returned an empty response.');
  }
  return envelope.data;
};

const realLeaseApi = {
  // LEASE-002
  list: async (filters: LeaseListFilters = {}): Promise<{ leases: Lease[]; pagination: PaginationMeta | null }> => {
    const response = await leaseClient.get<ApiEnvelope<Lease[]>>('/leases', { params: filters });
    return { leases: response.data.data ?? [], pagination: response.data.pagination ?? null };
  },

  // Every page of LEASE-002 (the service caps page size at 100).
  listAll: async (filters: Omit<LeaseListFilters, 'page' | 'size'> = {}): Promise<Lease[]> => {
    const leases: Lease[] = [];
    for (let page = 0; ; page += 1) {
      const result = await leaseApi.list({ ...filters, page, size: 100 });
      leases.push(...result.leases);
      if (!result.pagination?.hasNext) return leases;
    }
  },

  // LEASE-003
  get: async (leaseId: string): Promise<Lease> => {
    const response = await leaseClient.get<ApiEnvelope<Lease>>(`/leases/${leaseId}`);
    return unwrap(response.data);
  },

  // LEASE-004
  history: async (leaseId: string): Promise<LeaseHistory> => {
    const response = await leaseClient.get<ApiEnvelope<LeaseHistory>>(`/leases/${leaseId}/history`);
    return unwrap(response.data);
  },

  // LEASE-005 — newest first.
  forUnit: async (unitId: string): Promise<Lease[]> => {
    const response = await leaseClient.get<ApiEnvelope<Lease[]>>(`/leases/units/${unitId}`);
    return response.data.data ?? [];
  },

  // LEASE-001
  create: async (payload: CreateLeaseRequest): Promise<Lease> => {
    const response = await leaseClient.post<ApiEnvelope<Lease>>('/leases', payload);
    return unwrap(response.data);
  },

  // LEASE-006
  updateStatus: async (leaseId: string, payload: UpdateLeaseStatusRequest): Promise<Lease> => {
    const response = await leaseClient.patch<ApiEnvelope<Lease>>(`/leases/${leaseId}/status`, payload);
    return unwrap(response.data);
  },
};

/** Demo build: answers from browser-stored mock data (see services/mock). */
export const leaseApi: typeof realLeaseApi = USE_MOCK_DATA ? mockLeaseApi : realLeaseApi;
